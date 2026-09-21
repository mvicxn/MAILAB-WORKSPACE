import re
from pathlib import Path
from typing import Dict, Optional, Tuple

ROOT = Path(__file__).resolve().parents[1]
AGENTS_ROOT = ROOT / "agentes"
DEFAULT_AGENT = "ceo"

MAX_MINIMAL_CHARS = 2800
MAX_LIVE_MEMORY_CHARS = 1400
MAX_AGENT_CHARS = 2200
MAX_MEMORY_CHARS = 1200
MAX_SKILL_CHARS = 1800

AGENTS: Dict[str, Dict[str, str]] = {
    "ceo": {"emoji": "🧭", "label": "CEO"},
    "produto": {"emoji": "💡", "label": "Produto"},
    "pesquisa": {"emoji": "🔎", "label": "Pesquisa"},
    "design": {"emoji": "🎨", "label": "Design"},
    "dev": {"emoji": "💻", "label": "Dev"},
    "marketing": {"emoji": "📣", "label": "Marketing"},
    "financeiro": {"emoji": "💰", "label": "Financeiro"},
    "juridico": {"emoji": "⚖️", "label": "Jurídico"},
    "qa": {"emoji": "🧪", "label": "QA"},
    "seguranca": {"emoji": "🛡️", "label": "Segurança"},
    "operacoes": {"emoji": "🛠️", "label": "Operações"},
}

CHANNEL_TO_AGENT = {
    "ceo": "ceo",
    "planejamento": "ceo",
    "decisoes": "ceo",
    "decisões": "ceo",
    "ideias": "produto",
    "status-da-mai": "ceo",
    "produto": "produto",
    "pesquisa": "pesquisa",
    "backend": "dev",
    "frontend": "dev",
    "bugs": "qa",
    "pull-requests": "dev",
    "design": "design",
    "criativos": "design",
    "trafego": "marketing",
    "tráfego": "marketing",
    "copy": "marketing",
    "financeiro": "financeiro",
    "negociacoes": "financeiro",
    "negociações": "financeiro",
    "qa": "qa",
    "seguranca": "seguranca",
    "segurança": "seguranca",
    "clientes": "operacoes",
    "novos-clientes": "operacoes",
    "suporte": "operacoes",
    "incidentes": "operacoes",
    "github-alertas": "dev",
    "ia-relatorios": "ceo",
    "metricas": "marketing",
    "métricas": "marketing",
}

ALIASES = {
    "ceo": "ceo",
    "produto": "produto",
    "pesquisa": "pesquisa",
    "design": "design",
    "dev": "dev",
    "codigo": "dev",
    "código": "dev",
    "marketing": "marketing",
    "copy": "marketing",
    "trafego": "marketing",
    "tráfego": "marketing",
    "financeiro": "financeiro",
    "juridico": "juridico",
    "jurídico": "juridico",
    "qa": "qa",
    "seguranca": "seguranca",
    "segurança": "seguranca",
    "operacoes": "operacoes",
    "operações": "operacoes",
}

REVIEW_RE = re.compile(
    r"\b(issue|pr|pull request|revisar|revisão|teste|checklist|bug|aceite)\b",
    flags=re.IGNORECASE,
)
CHANNEL_RE = re.compile(
    r"\b(canal|canais|discord|sala|salas|server|servidor|mapear|"
    r"onde (falar|dizer)|marcar)\b",
    flags=re.IGNORECASE,
)

TOPIC_TO_AGENT = (
    (re.compile(r"primeiro produto|validar .+produto|\bmvp\b|dor do cliente", re.I), "produto"),
    (re.compile(r"\b(pr|pull request|quebra|checklist|aceite)\b", re.I), "qa"),
    (re.compile(r"cursor|copilot|código|codigo|\bpasta\b|commit", re.I), "dev"),
    (re.compile(r"preço|preco|custo|caixa|dinheiro", re.I), "financeiro"),
    (re.compile(r"contrato|jurídic|juridic", re.I), "juridico"),
    (re.compile(r"entrevista|evidência|evidencia|pesquisa", re.I), "pesquisa"),
)

ROSTER = (
    "Carlos escolhe UM: ceo prioridade; produto dor/MVP; pesquisa evidência; "
    "design tela; dev Cursor/Copilot/código; marketing texto; financeiro preço; "
    "juridico contrato; qa quebra/PR; seguranca dado; operacoes suporte."
)


def agent_from_topic(question: str) -> Optional[str]:
    for pattern, agent in TOPIC_TO_AGENT:
        if pattern.search(question):
            return agent
    return None


def clip(text: str, limit: int) -> str:
    text = text.strip()
    if len(text) <= limit:
        return text
    return text[: limit - 1].rstrip() + "…"


def read_capped(path: Path, limit: int) -> str:
    if not path.exists():
        return ""
    return clip(path.read_text(encoding="utf-8"), limit)


def normalize_agent(name: Optional[str]) -> Optional[str]:
    if not name:
        return None
    key = name.strip().lower()
    return ALIASES.get(key) if key in ALIASES else (key if key in AGENTS else None)


def agent_from_channel(channel_name: str) -> str:
    lowered = channel_name.lower()
    for needle, agent in CHANNEL_TO_AGENT.items():
        if needle in lowered:
            return agent
    return DEFAULT_AGENT


def parse_explicit_agent(text: str) -> Tuple[Optional[str], str]:
    stripped = text.strip()
    match = re.match(
        r"^(?:agente\s*[:=]\s*)?(" + "|".join(map(re.escape, ALIASES.keys())) + r")\s*[:\-]\s*",
        stripped,
        flags=re.IGNORECASE,
    )
    if not match:
        return None, stripped
    return normalize_agent(match.group(1)), stripped[match.end() :].strip()


def choose_agent(
    explicit: Optional[str],
    question: str,
    channel_name: str,
) -> Tuple[str, str]:
    named, cleaned = parse_explicit_agent(question)
    agent = (
        normalize_agent(explicit)
        or named
        or agent_from_topic(cleaned or question)
        or agent_from_channel(channel_name)
    )
    return agent or DEFAULT_AGENT, cleaned or question


def memory_is_useful(text: str) -> bool:
    return bool(text) and "Nenhuma memória aprovada ainda." not in text


def pick_skill(agent_id: str, question: str) -> Optional[Path]:
    skills_dir = AGENTS_ROOT / agent_id / "skills"
    if not skills_dir.is_dir():
        return None
    files = sorted(skills_dir.glob("*.md"))
    if not files:
        return None
    lowered = question.lower()
    for path in files:
        tokens = [part for part in path.stem.split("-") if len(part) > 3]
        if any(token in lowered for token in tokens):
            return path
    if agent_id == "qa" and REVIEW_RE.search(question):
        return files[0]
    return None


def load_pack(agent_id: str, question: str) -> str:
    meta = AGENTS[agent_id]
    parts = [
        f"Especialista ativo: {meta['emoji']} {meta['label']} ({agent_id})",
        ROSTER,
        read_capped(AGENTS_ROOT / "CONTEXTO-MINIMO.md", MAX_MINIMAL_CHARS),
        read_capped(AGENTS_ROOT / "MEMORIA-VIVA.md", MAX_LIVE_MEMORY_CHARS),
        read_capped(AGENTS_ROOT / agent_id / "AGENT.md", MAX_AGENT_CHARS),
    ]
    memory = read_capped(AGENTS_ROOT / agent_id / "MEMORY.md", MAX_MEMORY_CHARS)
    if memory_is_useful(memory):
        parts.append(memory)
    skill = pick_skill(agent_id, question)
    if skill is not None:
        parts.append(read_capped(skill, MAX_SKILL_CHARS))
    if CHANNEL_RE.search(question):
        parts.append(read_capped(AGENTS_ROOT / "CANAIS-DISCORD.md", 3500))
    return "\n\n".join(part for part in parts if part)
