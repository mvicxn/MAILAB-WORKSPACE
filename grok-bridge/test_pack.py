#!/usr/bin/env python3
from pack import choose_agent, load_pack, parse_explicit_agent, pick_skill


def main() -> None:
    assert choose_agent(None, "como validar?", "⚙️・backend")[0] == "dev"
    assert choose_agent(None, "qa: isso quebra o cadastro?", "💡・produto")[0] == "qa"
    assert choose_agent("design", "oi", "⚙️・backend")[0] == "design"
    assert choose_agent(None, "e agora?", "👋・boas-vindas")[0] == "ceo"
    agent, cleaned = parse_explicit_agent("dev: essa pasta está clara?")
    assert agent == "dev" and "pasta" in cleaned
    pack_qa = load_pack("qa", "revisar o pull request 12")
    pack_ceo = load_pack("ceo", "qual a prioridade?")
    assert "QA" in pack_qa
    assert "Skill" in pack_qa
    assert "Nenhuma memória aprovada ainda." not in pack_ceo
    assert "primeiro produto" in pack_ceo.lower()
    assert pick_skill("ceo", "revisar o pull request 12") is None
    print("router ok")
    print("qa pack chars", len(pack_qa), "~tokens", round(len(pack_qa) / 3.2))
    print("ceo pack chars", len(pack_ceo), "~tokens", round(len(pack_ceo) / 3.2))
    print("payload vs teto antigo 24000:", round(24000 / len(pack_ceo), 1), "x menor")

    from repo_tools import git_log, git_status, list_repo, read_file, run_tool

    listing = list_repo("agentes")
    assert "agentes/dev/AGENT.md" in listing
    readme = read_file("README.md")
    assert "MAILAB-WORKSPACE" in readme
    assert "main" in git_status() or git_status().startswith("##")
    assert git_log()
    blocked = run_tool("read_file", {"path": ".env"})
    assert "bloqueado" in blocked or "inválido" in blocked or "não encontrado" in blocked
    escaped = run_tool("read_file", {"path": "../README.md"})
    assert "inválido" in escaped or "fora" in escaped
    pack_dev = load_pack("dev", "esse codigo python está claro?")
    assert "Skill" in pack_dev or "código" in pack_dev.lower() or "codigo" in pack_dev.lower()
    pack_design = load_pack("design", "essa interface está óbvia?")
    assert "interface" in pack_design.lower() or "Hierarquia" in pack_design
    print("skills do lote ok")


if __name__ == "__main__":
    main()
