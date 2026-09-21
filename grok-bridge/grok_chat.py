#!/usr/bin/env python3
"""Interfone Discord → webhook do Grok Bot certo (cota Grok Bot, não Cursor SDK)."""

from __future__ import annotations

import asyncio
import os
import subprocess
from pathlib import Path
from typing import Dict, Optional, Tuple

import aiohttp
import discord
from discord import app_commands

from pack import AGENTS, choose_agent, load_pack

ROOT = Path(__file__).resolve().parents[1]
CONFIG_DIR = Path(os.environ.get("XDG_CONFIG_HOME", Path.home() / ".config")) / "mai"

SPEAKERS = {
    "ceo": "Carlos",
    "produto": "Produto",
    "pesquisa": "Pesquisa",
    "design": "Design",
    "dev": "Dev",
    "marketing": "Marketing",
    "financeiro": "Financeiro",
    "juridico": "Jurídico",
    "qa": "André",
    "seguranca": "Segurança",
    "operacoes": "Operações",
}
EMAILS = {
    "ceo": "carlos@mai.local",
    "produto": "produto@mai.local",
    "pesquisa": "pesquisa@mai.local",
    "design": "design@mai.local",
    "dev": "dev@mai.local",
    "marketing": "marketing@mai.local",
    "financeiro": "financeiro@mai.local",
    "juridico": "juridico@mai.local",
    "qa": "andre@mai.local",
    "seguranca": "seguranca@mai.local",
    "operacoes": "operacoes@mai.local",
}
MAICON_ID = "328991117989380096"
IAN_ID = "940260528817844305"
GUILD_ID = "1550495637303201953"
ESCRITORIO_URL = os.getenv("MAI_ESCRITORIO_URL", "http://127.0.0.1:3000")


def parse_env(path: Path) -> Dict[str, str]:
    data: Dict[str, str] = {}
    if not path.exists():
        return data
    for line in path.read_text(encoding="utf-8").splitlines():
        if "=" in line and not line.strip().startswith("#"):
            name, raw = line.split("=", 1)
            raw = raw.strip()
            if raw[:1] in {"'", '"'}:
                raw = raw.strip(raw[0])
            data[name.strip()] = raw
    return data


def load_env_file(*names: str) -> Dict[str, str]:
    merged: Dict[str, str] = {}
    for name in names:
        merged.update(parse_env(CONFIG_DIR / name))
    return merged


def load_senhas() -> Dict[str, str]:
    data = load_env_file("funcionarios.env")
    senhas: Dict[str, str] = {}
    for ficha in EMAILS:
        senhas[ficha] = data.get(f"MAI_SENHA_{ficha.upper()}", "").strip()
    return senhas


def load_webhooks() -> Dict[str, Tuple[str, str]]:
    data = load_env_file("grokbot.env", "grokbot-agentes.env")
    padrao = (
        os.getenv("GROK_BOT_WEBHOOK_URL", "").strip() or data.get("GROK_BOT_WEBHOOK_URL", "").strip(),
        os.getenv("GROK_BOT_WEBHOOK_KEY", "").strip() or data.get("GROK_BOT_WEBHOOK_KEY", "").strip(),
    )
    hooks: Dict[str, Tuple[str, str]] = {}
    for ficha in EMAILS:
        url = (
            os.getenv(f"GROK_WEBHOOK_URL_{ficha.upper()}", "").strip()
            or data.get(f"GROK_WEBHOOK_URL_{ficha.upper()}", "").strip()
            or padrao[0]
        )
        key = (
            os.getenv(f"GROK_WEBHOOK_KEY_{ficha.upper()}", "").strip()
            or data.get(f"GROK_WEBHOOK_KEY_{ficha.upper()}", "").strip()
            or padrao[1]
        )
        if url and key:
            hooks[ficha] = (url, key)
    if padrao[0] and padrao[1]:
        hooks.setdefault("ceo", padrao)
    return hooks


def required_secret(name: str) -> str:
    value = os.getenv(name, "").strip()
    if not value:
        raise SystemExit(f"Segredo ausente: configure {name} no ambiente local.")
    return value


def git_sha() -> str:
    try:
        return subprocess.check_output(
            ["git", "rev-parse", "--short", "HEAD"],
            cwd=ROOT,
            text=True,
        ).strip()
    except (OSError, subprocess.CalledProcessError):
        return "desconhecido"


class GrokBridge(discord.Client):
    def __init__(self, discord_token: str) -> None:
        intents = discord.Intents.default()
        intents.message_content = os.getenv("DISCORD_MESSAGE_CONTENT", "").lower() in {
            "1",
            "true",
            "yes",
        }
        super().__init__(intents=intents)
        self.discord_token = discord_token
        self.webhooks = load_webhooks()
        self.senhas = load_senhas()
        self.tree = app_commands.CommandTree(self)

    async def setup_hook(self) -> None:
        guild = discord.Object(id=int(GUILD_ID))
        self.tree.copy_global_to(guild=guild)
        no_servidor = await self.tree.sync(guild=guild)
        self.tree.clear_commands(guild=None)
        await self.tree.sync()
        print(
            "comandos no servidor MAI:",
            [cmd.name for cmd in no_servidor],
            flush=True,
        )

    async def on_ready(self) -> None:
        ligados = ", ".join(sorted(self.webhooks)) or "nenhum"
        print(
            f"Discord como {self.user}. Webhooks: {ligados}. "
            f"Logins no PC: {sum(1 for v in self.senhas.values() if v)}/{len(EMAILS)}",
            flush=True,
        )

    def hook_do(self, agent_id: str) -> Tuple[str, str]:
        return self.webhooks.get(agent_id) or self.webhooks.get("ceo") or ("", "")

    async def wake_grok_bot(self, agent_id: str, payload: dict) -> str:
        url, key = self.hook_do(agent_id)
        speaker = SPEAKERS.get(agent_id, AGENTS[agent_id]["label"])
        if not url or not key:
            return (
                "Ainda não está ligado no **Grok Bot**.\n"
                "Cola `grok-bridge/COLA-NO-GROK-BOT.md` no Carlos. "
                "Ele devolve URL e key da rotina webhook. Aí eu abro a janela pra salvar."
            )
        timeout = aiohttp.ClientTimeout(total=30)
        headers = {
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
        }
        async with aiohttp.ClientSession(timeout=timeout) as session:
            async with session.post(url, json=payload, headers=headers) as resp:
                if resp.status == 200:
                    return (
                        f"**{speaker}** acordou no Grok Bot (webhook do cargo).\n"
                        "A fala entra neste canal quando ele terminar. "
                        "Se for trabalho da empresa, ele entra no MAI LAB com o login dele — senha não aparece aqui."
                    )
                detail = (await resp.text())[:200]
                return f"Grok Bot não acordou (HTTP {resp.status}). {detail}"


agent_choices = [
    app_commands.Choice(name=f"{meta['emoji']} {SPEAKERS.get(agent_id, meta['label'])}", value=agent_id)
    for agent_id, meta in AGENTS.items()
]


@app_commands.command(name="grok", description="Acorda o Grok Bot do cargo neste canal")
@app_commands.describe(
    pergunta="O que você quer discutir",
    agente="Quem deve responder. Se vazio, o canal escolhe.",
)
@app_commands.choices(agente=agent_choices)
async def grok_command(
    interaction: discord.Interaction,
    pergunta: str,
    agente: Optional[str] = None,
) -> None:
    bridge = interaction.client
    if not isinstance(bridge, GrokBridge):
        await interaction.response.send_message("Integração indisponível.", ephemeral=True)
        return
    channel_name = (
        interaction.channel.name if isinstance(interaction.channel, discord.TextChannel) else ""
    )
    agent_id, cleaned = choose_agent(agente, pergunta, channel_name)
    speaker = SPEAKERS.get(agent_id, AGENTS[agent_id]["label"])
    channel_id = str(interaction.channel_id or "")
    payload = {
        "pergunta": cleaned,
        "agent_id": agent_id,
        "speaker": speaker,
        "channel_id": channel_id,
        "channel_name": channel_name,
        "guild_id": str(interaction.guild_id or GUILD_ID),
        "maicon_id": MAICON_ID,
        "ian_id": IAN_ID,
        "user_id": str(interaction.user.id),
        "sha": git_sha(),
        "pack": load_pack(agent_id, cleaned),
        "escritorio_url": ESCRITORIO_URL,
        "escritorio_email": EMAILS[agent_id],
        "escritorio_senha": bridge.senhas.get(agent_id, ""),
        "escritorio_ficha": agent_id,
        "tarefa": (
            "Você É o especialista agent_id. Uma voz. "
            "Fala de gente, curta, 1 piada leve. "
            "Proibido AGENTE/CONTEXTO/FATOS e emoji-relatório. "
            "Maicon e Ian são vibe-coders: Cursor escreve, Copilot no VS Code ajuda. "
            "Use o pack. Se for do projeto, leia o git. Nível 0 no Git. "
            "JSON traz escritorio_url, escritorio_email, escritorio_senha. "
            "Se o assunto for trabalho da empresa: no computador deste PC, abre o site, "
            "entra com esse e-mail e senha, registra no diário. "
            "NUNCA cole a senha no Discord. NUNCA invente cliente."
        ),
    }
    await interaction.response.defer()
    msg = await bridge.wake_grok_bot(agent_id, payload)
    meta = AGENTS[agent_id]
    await interaction.followup.send(f"{meta['emoji']} **{speaker}**\n{msg}")


async def main() -> None:
    client = GrokBridge(required_secret("DISCORD_BOT_TOKEN"))
    client.tree.add_command(grok_command)
    await client.start(client.discord_token)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        pass
