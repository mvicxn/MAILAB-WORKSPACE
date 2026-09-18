import asyncio
import getpass
import os
from typing import Dict, Tuple

import discord


STRUCTURE: Dict[str, Tuple[Tuple[str, str], ...]] = {
    "🧭 DIREÇÃO": (
        ("📣・ceo", "Visão, decisões finais, prioridades e direção geral da MAI."),
        ("🗺️・planejamento", "Roadmap, metas, prazos, prioridades e próximos passos."),
    ),
    "💡 PRODUTO": (
        ("💡・produto", "Ideias, problemas reais, público-alvo e propostas de produto."),
        ("🔎・pesquisa-de-mercado", "Entrevistas, concorrentes, demanda e validação de ideias."),
    ),
    "💻 DESENVOLVIMENTO": (
        ("⚙️・backend", "APIs, banco de dados, regras, integrações e automações."),
        ("🖥️・frontend", "Telas, componentes, experiência e comportamento visual."),
        ("🐞・bugs", "Registro, investigação, prioridade e correção de problemas."),
    ),
    "🎨 DESIGN": (
        ("🎨・design", "Identidade visual, wireframes, UX, UI e decisões de interface."),
        ("✨・criativos", "Artes, vídeos, anúncios, imagens e materiais de campanha."),
    ),
    "📣 MARKETING": (
        ("📈・trafego", "Campanhas, anúncios, canais, públicos, orçamento e métricas."),
        ("✍️・copy", "Textos de venda, landing pages, anúncios, e-mails e mensagens."),
    ),
    "💰 FINANCEIRO": (
        ("💰・financeiro", "Preços, custos, margem, receita, caixa e viabilidade."),
    ),
    "🛠️ OPERAÇÕES": (
        ("🧪・qa", "Testes, qualidade, fluxos, erros e critérios de aprovação."),
        ("🛡️・seguranca", "Acessos, permissões, privacidade, LGPD e riscos técnicos."),
        ("🤝・clientes", "Entrega, onboarding, suporte, feedback e satisfação."),
    ),
}

ROLES = (
    "👑・Sócios",
    "🧭・CEO",
    "💡・Produto",
    "💻・Dev",
    "🎨・Design",
    "📣・Marketing",
    "💰・Financeiro",
    "🧪・QA",
    "🛡️・Segurança",
    "🛠️・Operações",
)


class ServerOrganizer(discord.Client):
    def __init__(self, token: str) -> None:
        super().__init__(intents=discord.Intents.default())
        self.token = token

    async def on_ready(self) -> None:
        try:
            guild = await self.choose_guild()
            await self.create_roles(guild)
            await self.create_structure(guild)
            print(f"\nEstrutura da MAI configurada em: {guild.name}")
            print("Categorias e canais existentes foram reaproveitados.")
            print("Você já pode abrir o Discord e conferir o servidor.")
        finally:
            await self.close()

    async def choose_guild(self) -> discord.Guild:
        guilds = list(self.guilds)
        if not guilds:
            raise RuntimeError(
                "O bot não está em nenhum servidor. Adicione-o ao servidor da MAI primeiro."
            )

        if len(guilds) == 1:
            return guilds[0]

        print("O bot está em mais de um servidor:")
        for index, guild in enumerate(guilds, start=1):
            print(f"{index}. {guild.name} ({guild.id})")

        choice = input("Digite o número do servidor da MAI: ").strip()
        try:
            selected = guilds[int(choice) - 1]
        except (ValueError, IndexError) as error:
            raise RuntimeError("Escolha de servidor inválida.") from error
        return selected

    async def create_roles(self, guild: discord.Guild) -> None:
        existing = {role.name for role in guild.roles}
        for role_name in ROLES:
            if role_name not in existing:
                await guild.create_role(
                    name=role_name,
                    reason="Estrutura inicial da MAI",
                )
                print(f"Cargo criado: {role_name}")

    async def create_structure(self, guild: discord.Guild) -> None:
        categories = {category.name: category for category in guild.categories}
        for category_name, channel_specs in STRUCTURE.items():
            category = categories.get(category_name)
            if category is None:
                category = await guild.create_category(
                    category_name,
                    reason="Estrutura inicial da MAI",
                )
                print(f"Categoria criada: {category_name}")

            for channel_name, topic in channel_specs:
                channel = discord.utils.get(category.text_channels, name=channel_name)
                if channel is None:
                    channel = await guild.create_text_channel(
                        channel_name,
                        category=category,
                        topic=topic,
                        reason="Estrutura inicial da MAI",
                    )
                    print(f"Canal criado: {channel_name} em {category_name}")
                elif channel.topic != topic:
                    await channel.edit(
                        topic=topic,
                        reason="Atualização das descrições da estrutura da MAI",
                    )
                    print(f"Descrição atualizada: {channel_name}")


def read_token() -> str:
    token = os.environ.get("DISCORD_BOT_TOKEN")
    if not token:
        token = getpass.getpass("Cole o token do bot (não será exibido): ").strip()
    if not token:
        raise RuntimeError("Token vazio. O organizador não foi executado.")
    return token


async def main() -> None:
    token = read_token()
    client = ServerOrganizer(token)
    try:
        await client.start(token)
    except discord.LoginFailure as error:
        raise RuntimeError(
            "O Discord rejeitou o token. Gere um novo token no Developer Portal."
        ) from error
    except discord.Forbidden as error:
        raise RuntimeError(
            "O bot não tem permissão suficiente ou não está no servidor correto."
        ) from error


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nExecução interrompida.")
    except RuntimeError as error:
        raise SystemExit(f"Erro: {error}") from error
