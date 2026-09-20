import asyncio
import os
from typing import List, Optional

import aiohttp
import discord
from discord import app_commands

from pack import AGENTS, choose_agent, clip, load_pack
from repo_tools import TOOLS, run_tool


XAI_URL = "https://api.x.ai/v1/chat/completions"
MODEL = os.getenv("XAI_MODEL", "grok-4.1-fast")
MAX_HISTORY_MESSAGES = 8
MAX_HISTORY_CHARS = 240

MAX_TOOL_ROUNDS = 4

SYSTEM_PROMPT = """Você é um especialista da MAI, não um chatbot genérico.
Fale em português brasileiro simples. Assine no papel indicado.
Use o pacote e, se a pergunta for sobre o projeto, as ferramentas de Git.
Não invente arquivo, commit, cliente, métrica ou decisão: leia antes.
Peça só o trecho necessário. Não tente dump do repositório.
Nível 0: converse e sugira. Não faça merge, push, commit, delete ou
mudança real. Não diga que executou ação no GitHub ou Discord.
Se a regra for ambígua, proponha e peça consenso de Maicon e Ian.
Se não souber, diga que não sabe.
"""


class GrokBridge(discord.Client):
    def __init__(self, discord_token: str, xai_key: str) -> None:
        intents = discord.Intents.default()
        intents.message_content = True
        super().__init__(intents=intents)
        self.discord_token = discord_token
        self.xai_key = xai_key
        self.tree = app_commands.CommandTree(self)

    async def setup_hook(self) -> None:
        await self.tree.sync()

    async def on_ready(self) -> None:
        print(f"Grok conectado como {self.user}. Comando: /grok")

    async def on_message(self, message: discord.Message) -> None:
        if message.author.bot or self.user is None:
            return
        if self.user not in message.mentions:
            return
        question = message.clean_content.replace(f"@{self.user.name}", "").strip()
        if not question:
            await message.reply("🤖 Escreva a pergunta depois da menção. Ex.: `@Grok qa: isso quebra?`")
            return
        channel_name = message.channel.name if isinstance(message.channel, discord.TextChannel) else ""
        agent_id, cleaned = choose_agent(None, question, channel_name)
        async with message.channel.typing():
            answer = await self.answer(message.channel, cleaned, agent_id)
        await self.send_chunks(message.channel, answer, agent_id, message)

    async def answer(
        self,
        channel: discord.abc.Messageable,
        question: str,
        agent_id: str,
    ) -> str:
        history: List[dict] = []
        if isinstance(channel, discord.TextChannel):
            async for message in channel.history(
                limit=MAX_HISTORY_MESSAGES,
                oldest_first=False,
            ):
                if message.author.bot:
                    continue
                history.append(
                    {
                        "role": "user",
                        "content": clip(message.clean_content, MAX_HISTORY_CHARS),
                    }
                )
            history.reverse()

        pack = load_pack(agent_id, question)
        messages: List[dict] = [
            {"role": "system", "content": SYSTEM_PROMPT + "\n\nPACOTE:\n" + pack},
            *history,
            {"role": "user", "content": question},
        ]
        headers = {
            "Authorization": f"Bearer {self.xai_key}",
            "Content-Type": "application/json",
        }
        timeout = aiohttp.ClientTimeout(total=90)
        async with aiohttp.ClientSession(timeout=timeout) as session:
            for round_index in range(MAX_TOOL_ROUNDS + 1):
                payload = {
                    "model": MODEL,
                    "messages": messages,
                    "temperature": 0.3,
                }
                if round_index < MAX_TOOL_ROUNDS:
                    payload["tools"] = TOOLS
                async with session.post(XAI_URL, json=payload, headers=headers) as response:
                    if response.status >= 400:
                        detail = await response.text()
                        raise RuntimeError(
                            f"xAI retornou HTTP {response.status}: {detail[:300]}"
                        )
                    data = await response.json()
                message = data["choices"][0]["message"]
                tool_calls = message.get("tool_calls") or []
                if not tool_calls or round_index >= MAX_TOOL_ROUNDS:
                    return (message.get("content") or "Não consegui montar a resposta.").strip()
                messages.append(message)
                for call in tool_calls:
                    function = call.get("function") or {}
                    result = run_tool(
                        function.get("name") or "",
                        function.get("arguments") or {},
                    )
                    messages.append(
                        {
                            "role": "tool",
                            "tool_call_id": call.get("id") or "",
                            "name": function.get("name") or "",
                            "content": result,
                        }
                    )
        return "Não consegui terminar a leitura do repositório."

    async def send_chunks(
        self,
        channel: discord.abc.Messageable,
        answer: str,
        agent_id: str,
        reference: Optional[discord.Message] = None,
    ) -> None:
        meta = AGENTS[agent_id]
        chunks = [answer[index : index + 1900] for index in range(0, len(answer), 1900)]
        for index, chunk in enumerate(chunks):
            prefix = f"{meta['emoji']} **{meta['label']}**\n" if index == 0 else "↪️ "
            kwargs = {}
            if reference is not None and index == 0:
                kwargs["reference"] = reference
            await channel.send(f"{prefix}{chunk}", **kwargs)


agent_choices = [
    app_commands.Choice(name=f"{meta['emoji']} {meta['label']}", value=agent_id)
    for agent_id, meta in AGENTS.items()
]


@app_commands.command(name="grok", description="Chama um especialista da MAI")
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
        await interaction.response.send_message("🤖 Integração indisponível.", ephemeral=True)
        return
    channel_name = interaction.channel.name if isinstance(interaction.channel, discord.TextChannel) else ""
    agent_id, cleaned = choose_agent(agente, pergunta, channel_name)
    await interaction.response.defer()
    try:
        answer = await bridge.answer(interaction.channel, cleaned, agent_id)
        meta = AGENTS[agent_id]
        for index in range(0, len(answer), 1900):
            chunk = answer[index : index + 1900]
            prefix = f"{meta['emoji']} **{meta['label']}**\n" if index == 0 else "↪️ "
            await interaction.followup.send(prefix + chunk)
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
