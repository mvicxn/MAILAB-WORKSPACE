import json
import subprocess
from pathlib import Path
from typing import Any, Dict, List

from pack import ROOT, clip


MAX_RESULT_CHARS = 3500
MAX_TREE_LINES = 80
MAX_SEARCH_HITS = 15
MAX_GIT_LOG = 8
SKIP_DIRS = {".git", ".venv", "node_modules", "__pycache__", ".cursor"}
BLOCKED_NAMES = {".env", "discord.env", "grok.env", "credentials.json"}
BLOCKED_SUFFIXES = {".pem", ".key"}

TOOLS: List[Dict[str, Any]] = [
    {
        "type": "function",
        "function": {
            "name": "list_repo",
            "description": "Lista arquivos do repositório local da MAI. Use antes de abrir um arquivo.",
            "parameters": {
                "type": "object",
                "properties": {
                    "path": {
                        "type": "string",
                        "description": "Pasta relativa, por exemplo grok-bridge ou agentes/dev",
                    }
                },
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "read_file",
            "description": "Lê um arquivo de texto do repositório. Não use para segredos.",
            "parameters": {
                "type": "object",
                "properties": {
                    "path": {"type": "string", "description": "Caminho relativo do arquivo"}
                },
                "required": ["path"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "search_repo",
            "description": "Busca um termo nos arquivos do repositório.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "Texto a procurar"}
                },
                "required": ["query"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "git_status",
            "description": "Mostra branch e arquivos modificados no Git local.",
            "parameters": {"type": "object", "properties": {}},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "git_log",
            "description": "Mostra os commits recentes.",
            "parameters": {"type": "object", "properties": {}},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "git_diff",
            "description": "Mostra um resumo das mudanças locais ou de um arquivo.",
            "parameters": {
                "type": "object",
                "properties": {
                    "path": {
                        "type": "string",
                        "description": "Arquivo ou pasta relativa. Vazio = resumo geral.",
                    }
                },
            },
        },
    },
]


def _blocked(path: Path) -> bool:
    name = path.name.lower()
    if name in BLOCKED_NAMES or name.startswith(".env"):
        return True
    return any(name.endswith(suffix) for suffix in BLOCKED_SUFFIXES)


def safe_path(relative: str) -> Path:
    raw = (relative or ".").strip() or "."
    if Path(raw).is_absolute() or ".." in Path(raw).parts:
        raise ValueError("caminho inválido")
    root = ROOT.resolve()
    candidate = (root / raw).resolve()
    if candidate != root and root not in candidate.parents:
        raise ValueError("fora do repositório")
    if any(part in SKIP_DIRS for part in candidate.parts):
        raise ValueError("caminho bloqueado")
    if _blocked(candidate):
        raise ValueError("arquivo bloqueado")
    return candidate


def _run_git(args: List[str]) -> str:
    completed = subprocess.run(
        ["git", "-C", str(ROOT), *args],
        check=False,
        capture_output=True,
        text=True,
        timeout=8,
    )
    output = (completed.stdout or completed.stderr or "").strip()
    if completed.returncode != 0 and not output:
        output = f"git saiu com código {completed.returncode}"
    return clip(output, MAX_RESULT_CHARS)


def list_repo(path: str = ".") -> str:
    folder = safe_path(path)
    if not folder.exists():
        return "pasta não encontrada"
    if folder.is_file():
        return str(folder.relative_to(ROOT))
    lines: List[str] = []
    for item in sorted(folder.rglob("*")):
        if any(part in SKIP_DIRS for part in item.parts):
            continue
        if _blocked(item):
            continue
        rel = item.relative_to(ROOT).as_posix()
        if item.is_dir():
            lines.append(rel + "/")
        else:
            lines.append(rel)
        if len(lines) >= MAX_TREE_LINES:
            lines.append("… lista cortada")
            break
    return "\n".join(lines) or "(vazia)"


def read_file(path: str) -> str:
    target = safe_path(path)
    if not target.is_file():
        return "arquivo não encontrado"
    try:
        text = target.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        return "arquivo binário, não vou abrir"
    return clip(text, MAX_RESULT_CHARS)


def search_repo(query: str) -> str:
    needle = (query or "").strip()
    if len(needle) < 3:
        return "busca curta demais"
    hits: List[str] = []
    for item in ROOT.rglob("*"):
        if not item.is_file():
            continue
        if any(part in SKIP_DIRS for part in item.parts):
            continue
        if _blocked(item):
            continue
        try:
            text = item.read_text(encoding="utf-8")
        except (UnicodeDecodeError, OSError):
            continue
        for number, line in enumerate(text.splitlines(), start=1):
            if needle.lower() in line.lower():
                rel = item.relative_to(ROOT).as_posix()
                hits.append(f"{rel}:{number}: {clip(line.strip(), 160)}")
                if len(hits) >= MAX_SEARCH_HITS:
                    return clip("\n".join(hits), MAX_RESULT_CHARS)
    return "\n".join(hits) or "nada encontrado"


def git_status() -> str:
    return _run_git(["status", "-sb"])


def git_log() -> str:
    return _run_git(["log", f"-{MAX_GIT_LOG}", "--oneline", "--decorate"])


def git_diff(path: str = "") -> str:
    args = ["diff", "--stat", "HEAD"]
    if path.strip():
        target = safe_path(path)
        args.extend(["--", str(target.relative_to(ROOT))])
    return _run_git(args)


HANDLERS = {
    "list_repo": lambda args: list_repo(str(args.get("path") or ".")),
    "read_file": lambda args: read_file(str(args.get("path") or "")),
    "search_repo": lambda args: search_repo(str(args.get("query") or "")),
    "git_status": lambda args: git_status(),
    "git_log": lambda args: git_log(),
    "git_diff": lambda args: git_diff(str(args.get("path") or "")),
}


def run_tool(name: str, arguments: Any) -> str:
    if isinstance(arguments, str):
        try:
            args = json.loads(arguments or "{}")
        except json.JSONDecodeError:
            return "argumentos inválidos"
    elif isinstance(arguments, dict):
        args = arguments
    else:
        args = {}
    handler = HANDLERS.get(name)
    if handler is None:
        return f"ferramenta desconhecida: {name}"
    try:
        return handler(args)
    except Exception as error:
        return f"erro: {error}"
