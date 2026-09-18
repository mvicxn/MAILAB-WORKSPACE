import asyncio
import os
from pathlib import Path
from typing import List

import aiohttp
import discord
from discord import app_commands


ROOT = Path(__file__).resolve().parents[1]
XAI_URL = "https://api.x.ai/v1/chat/completions"
MODEL = os.getenv("XAI_MODEL", "grok-4.1-fast")
MAX_CONTEXT_CHARS = 24000
MAX_HISTORY_MESSAGES = 12


def load_context() -> str:
    files = [
        ROOT / "MAPA-WIREFRAME-MVP-MAI.md",
        ROOT / "docs" / "INTEGRACAO-GROK-DISCORD-GITHUB.md",
        ROOT / "README.md",
    ]
    sections = []
    remaining = MAX_CONTEXT_CHARS
    for path in files:
        if remaining <= 0 or not path.exists():
            continue
        content = path.read_text(encoding="utf-8")
        excerpt = content[:remaining]
        sections.append(f"\n--- {path.relative_to(ROOT)} ---\n{excerpt}")
        remaining -= len(excerpt)
    return "".join(sections)


SYSTEM_PROMPT = """Você é o Grok, equipe de especialistas da MAI.
Converse em português brasileiro simples, direto e útil.
Use o contexto fornecido como orientação, mas não invente fatos.
Separe fatos, hipóteses, riscos, dúvidas e recomendações.
Não revele segredos, tokens, chaves ou dados pessoais.
Não diga que executou algo no GitHub ou Discord: nesta versão você apenas
conversa e sugere.
Quando a pergunta envolver uma regra ambígua da MAI Central, apresente uma
proposta e diga que precisa de consenso de Maicon e Ian.
Quando não souber, diga claramente que não sabe.
"""


class GrokBridge(discord.Client):
    def __init__(self, discord_token: str, xai_key: str) -> None:
        intents = discord.Intents.default()
        intents.message_content = True
        super().__init__(intents=intents)
        self.discord_token = discord_token
        self.xai_key = xai_key
        self.tree = app_commands.CommandTree(self)
        self.context = load_context()

    async def setup_hook(self) -> None:
        await self.tree.sync()

    async def on_ready(self) -> None:
        print(f"Grok conectado como {self.user}. Comando disponível: /grok")

    async def on_message(self, message: discord.Message) -> None:
        if message.author.bot or self.user is None:
            return
        if self.user not in message.mentions:
            return
        question = message.clean_content.replace(f"@{self.user.name}", "").strip()
        if not question:
            await message.reply("🤖 Escreva sua pergunta depois da menção.")
            return
        async with message.channel.typing():
            answer = await self.answer(message.channel, question)
        await self.send_chunks(message.channel, answer, message)

    async def answer(self, channel: discord.abc.Messageable, question: str) -> str:
        history: List[dict] = []
        if isinstance(channel, discord.TextChannel):
            async for message in channel.history(
                limit=MAX_HISTORY_MESSAGES,
                oldest_first=False,
            ):
                if message.author.bot:
                    continue
                history.append({"role": "user", "content": message.clean_content})
            history.reverse()

        messages = [
            {"role": "system", "content": SYSTEM_PROMPT + "\n\nCONTEXTO:\n" + self.context},
            *history,
            {"role": "user", "content": question},
        ]
        payload = {
            "model": MODEL,
            "messages": messages,
            "temperature": 0.3,
        }
        headers = {
            "Authorization": f"Bearer {self.xai_key}",
            "Content-Type": "application/json",
        }
        timeout = aiohttp.ClientTimeout(total=90)
        async with aiohttp.ClientSession(timeout=timeout) as session:
            async with session.post(XAI_URL, json=payload, headers=headers) as response:
                if response.status >= 400:
                    detail = await response.text()
                    raise RuntimeError(f"xAI retornou HTTP {response.status}: {detail[:300]}")
                data = await response.json()
        return data["choices"][0]["message"]["content"].strip()

    async def send_chunks(
        self,
        channel: discord.abc.Messageable,
        answer: str,
        reference: discord.Message,
    ) -> None:
        chunks = [answer[index : index + 1900] for index in range(0, len(answer), 1900)]
        for index, chunk in enumerate(chunks):
            prefix = "🤖 " if index == 0 else "↪️ "
            await channel.send(f"{prefix}{chunk}", reference=reference if index == 0 else None)


@app_commands.command(name="grok", description="Conversa com o Grok usando o contexto da MAI")
@app_commands.describe(pergunta="O que você quer discutir com o Grok?")
async def grok_command(interaction: discord.Interaction, pergunta: str) -> None:
    bridge = interaction.client
    if not isinstance(bridge, GrokBridge):
        await interaction.response.send_message("🤖 Integração indisponível.", ephemeral=True)
        return
    await interaction.response.defer()
    try:
        answer = await bridge.answer(interaction.channel, pergunta)
        for index in range(0, len(answer), 1900):
            chunk = answer[index : index + 1900]
            await interaction.followup.send(
                ("🤖 " if index == 0 else "↪️ ") + chunk
            )
    except Exception as error:
        await interaction.followup.send(f"⚠️ Não consegui responder: {error}")


def required_secret(name: str) -> str:
    value = os.getenv(name, "").strip()
    if not value:
        raise SystemExit(f"Segredo ausente: configure {name} no ambiente local.")
    return value


async def main() -> None:
    client = GrokBridge(
        required_secret("DISCORD_BOT_TOKEN"),
        required_secret("XAI_API_KEY"),
    )
    client.tree.add_command(grok_command)
    await client.start(client.discord_token)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        pass
