import asyncio
import getpass
import os
from dataclasses import dataclass
from typing import Dict, Optional, Tuple

import discord


@dataclass(frozen=True)
class ChannelSpec:
    name: str
    topic: str
    guide: str


@dataclass(frozen=True)
class CategorySpec:
    name: str
    channels: Tuple[ChannelSpec, ...]
    private: bool = False


STRUCTURE: Tuple[CategorySpec, ...] = (
    CategorySpec(
        "🚪 INÍCIO",
        (
            ChannelSpec(
                "👋・boas-vindas",
                "Apresentação da MAI e orientação para quem está chegando.",
                "👋 **Bem-vindo à MAI!**\n\n"
                "A MAI cria produtos digitais simples, rápidos e úteis.\n\n"
                "🧭 Comece por `🧭・comece-aqui`.\n"
                "📜 Leia `📜・regras`.\n"
                "📢 Acompanhe `📢・anuncios`.\n\n"
                "💡 Dúvidas sobre onde publicar? Pergunte aqui.",
            ),
            ChannelSpec(
                "📜・regras",
                "Regras de convivência, segurança e organização da MAI.",
                "📜 **Regras básicas da MAI**\n\n"
                "1. Seja claro, respeitoso e objetivo.\n"
                "2. Não envie senhas, tokens, chaves ou dados pessoais.\n"
                "3. Decisões importantes devem ser registradas no GitHub.\n"
                "4. Não altere a MAI Central sem aviso e consenso quando necessário.\n"
                "5. Use threads para assuntos específicos.\n"
                "6. Avise quando uma tarefa estiver bloqueada.\n\n"
                "🔐 Segurança vem antes da velocidade.",
            ),
            ChannelSpec(
                "🧭・comece-aqui",
                "Mapa rápido: onde conversar, registrar decisões e acompanhar tarefas.",
                "🧭 **Como usar a MAI**\n\n"
                "💡 Ideia ou problema: `💡・ideias`.\n"
                "📦 Produto: `💡・produto`.\n"
                "🧠 Decisão: `🧠・decisoes` e depois GitHub.\n"
                "💻 Código: GitHub, branch e Pull Request.\n"
                "🐞 Erro: `🐞・bugs`.\n"
                "🤝 Cliente: `🤝・clientes`.\n"
                "📚 Aprendizado: `📚・aprendizados`.\n\n"
                "📌 O Discord conversa; o GitHub guarda a versão oficial.",
            ),
            ChannelSpec(
                "📢・anuncios",
                "Comunicados oficiais, mudanças importantes e avisos da MAI.",
                "📢 Este canal é para comunicados importantes. "
                "Use os canais específicos para discussões.",
            ),
        ),
    ),
    CategorySpec(
        "👑 DIREÇÃO",
        (
            ChannelSpec(
                "📣・ceo",
                "Visão, decisões finais, prioridades e direção geral da MAI.",
                "📣 **CEO / Direção**\n\n"
                "Use este espaço para alinhar visão, prioridades e decisões finais.\n"
                "Toda decisão relevante deve apontar para a documentação oficial.",
            ),
            ChannelSpec(
                "🗺️・planejamento",
                "Roadmap, metas, prazos, prioridades e próximos passos.",
                "🗺️ **Planejamento**\n\n"
                "📅 Objetivo:\n🎯 Prioridade:\n👤 Responsável:\n⏰ Prazo:\n🚧 Bloqueios:\n"
                "✅ Critério de conclusão:",
            ),
            ChannelSpec(
                "🧠・decisoes",
                "Registro resumido de decisões e links para sua versão oficial no GitHub.",
                "🧠 **Registro de decisão**\n\n"
                "📅 Data:\n🎯 Decisão:\n❓ Problema:\n✅ Escolha:\n💡 Motivo:\n"
                "👤 Aprovadores:\n🔁 Data de revisão:\n🔗 Link no GitHub:",
            ),
            ChannelSpec(
                "💡・ideias",
                "Hipóteses de negócio que ainda precisam ser investigadas e validadas.",
                "💡 **Nova ideia**\n\n"
                "👥 Cliente possível:\n😣 Problema:\n✨ Solução imaginada:\n"
                "💰 Como pode gerar dinheiro:\n🔎 Como validar:\n📊 Evidência:\n"
                "🚦 Status: hipótese / validando / aprovada / pausada",
            ),
            ChannelSpec(
                "📚・aprendizados",
                "Erros, descobertas, feedbacks e conhecimento reutilizável pela equipe e pelas IAs.",
                "📚 **Aprendizado**\n\n"
                "🔍 O que aconteceu:\n💡 O que aprendemos:\n🔁 O que muda:\n"
                "🤖 Como treinar ou atualizar as IAs:\n🔗 Referência:",
            ),
            ChannelSpec(
                "📡・status-da-mai",
                "Estado rápido dos produtos, projetos, incidentes e prioridades atuais.",
                "📡 **Legenda de status**\n\n"
                "🟢 Funcionando\n🟡 Atenção necessária\n🔴 Problema crítico\n"
                "🔵 Em desenvolvimento\n⚪ Pausado\n\n"
                "Atualize esta mensagem quando o estado geral mudar.",
            ),
        ),
    ),
    CategorySpec(
        "💡 PRODUTO",
        (
            ChannelSpec(
                "💡・produto",
                "Problemas reais, clientes, proposta de valor e definição do MVP.",
                "💡 **Produto**\n\n"
                "Descreva o problema antes da solução.\n"
                "👥 Para quem é?\n😣 Qual dor existe?\n💰 Alguém pagaria?\n"
                "📦 Qual é o menor MVP útil?\n🚫 O que ficará fora?",
            ),
            ChannelSpec(
                "🔎・pesquisa-de-mercado",
                "Entrevistas, concorrentes, demanda, alternativas e validação.",
                "🔎 **Pesquisa**\n\n"
                "Separe fato, hipótese e opinião.\n"
                "👤 Fonte:\n📌 Evidência:\n🏁 Conclusão:\n❓ Dúvida restante:",
            ),
        ),
    ),
    CategorySpec(
        "💻 DESENVOLVIMENTO",
        (
            ChannelSpec(
                "⚙️・backend",
                "APIs, banco de dados, regras, integrações e automações.",
                "⚙️ Fale de APIs, dados, integrações e regras. "
                "Código oficial deve estar no GitHub, em branch e Pull Request.",
            ),
            ChannelSpec(
                "🖥️・frontend",
                "Telas, componentes, experiência e comportamento visual.",
                "🖥️ Fale de telas, fluxos e experiência. "
                "Inclua screenshot quando ajudar a explicar.",
            ),
            ChannelSpec(
                "🐞・bugs",
                "Registro, investigação, prioridade e correção de problemas.",
                "🐞 **Novo bug**\n\n"
                "📍 Onde aconteceu:\n🔁 Como reproduzir:\n😕 Resultado atual:\n"
                "✅ Resultado esperado:\n🔥 Prioridade:\n📸 Evidência:\n👤 Responsável:",
            ),
            ChannelSpec(
                "🔀・pull-requests",
                "Acompanhamento de branches, revisões e Pull Requests do GitHub.",
                "🔀 **Checklist de PR**\n\n"
                "☑ Problema explicado\n☑ Como testar\n☑ Testes executados\n"
                "☑ Riscos informados\n☑ Revisão solicitada\n☑ Segurança avaliada quando necessário",
            ),
        ),
    ),
    CategorySpec(
        "🎨 DESIGN",
        (
            ChannelSpec(
                "🎨・design",
                "Identidade visual, wireframes, UX, UI e decisões de interface.",
                "🎨 Compartilhe referências, wireframes, fluxos e decisões visuais. "
                "Explique qual problema de usuário o design resolve.",
            ),
            ChannelSpec(
                "✨・criativos",
                "Artes, vídeos, anúncios, imagens e materiais de campanha.",
                "✨ Inclua objetivo, público, formato, mensagem e versão aprovada.",
            ),
        ),
    ),
    CategorySpec(
        "📣 MARKETING",
        (
            ChannelSpec(
                "📈・trafego",
                "Campanhas, anúncios, canais, públicos, orçamento e métricas.",
                "📈 **Campanha**\n\n"
                "🎯 Objetivo:\n👥 Público:\n📣 Canal:\n💰 Orçamento:\n"
                "📊 Métrica:\n🧪 Teste:\n✅ Resultado:",
            ),
            ChannelSpec(
                "✍️・copy",
                "Textos de venda, landing pages, anúncios, e-mails e mensagens.",
                "✍️ Inclua público, objetivo, oferta, tom de voz e chamada para ação.",
            ),
        ),
    ),
    CategorySpec(
        "💰 FINANCEIRO",
        (
            ChannelSpec(
                "💰・financeiro",
                "Preços, custos, margem, receita, caixa e viabilidade.",
                "💰 Não publique dados bancários ou senhas. "
                "Use este canal para hipóteses, cálculos e decisões financeiras.",
            ),
        ),
    ),
    CategorySpec(
        "🛠️ OPERAÇÕES",
        (
            ChannelSpec(
                "🧪・qa",
                "Testes, qualidade, fluxos, erros e critérios de aprovação.",
                "🧪 **Teste**\n\n"
                "🎯 Fluxo:\n🧾 Cenário:\n▶️ Passos:\n✅ Esperado:\n"
                "📌 Obtido:\n📸 Evidência:\n🏁 Resultado:",
            ),
            ChannelSpec(
                "🛡️・seguranca",
                "Acessos, permissões, privacidade, LGPD e riscos técnicos.",
                "🛡️ Nunca cole segredos aqui. "
                "Registre o tipo de risco, impacto e correção sem expor credenciais.",
            ),
            ChannelSpec(
                "🤝・clientes",
                "Entrega, onboarding, suporte, feedback e satisfação.",
                "🤝 **Cliente**\n\n"
                "👤 Cliente/projeto:\n📌 Situação:\n✅ Próxima ação:\n"
                "👥 Responsável:\n⏰ Prazo:\n🔒 Não publique dados sensíveis.",
            ),
            ChannelSpec(
                "📥・novos-clientes",
                "Entrada de oportunidades comerciais e informações iniciais de clientes.",
                "📥 Registre apenas o necessário. "
                "Leve requisitos completos e dados sensíveis para o local apropriado.",
            ),
            ChannelSpec(
                "🛠️・suporte",
                "Acompanhamento de solicitações, dúvidas e manutenção pós-entrega.",
                "🛠️ Registre impacto, cliente afetado, prioridade e responsável.",
            ),
        ),
    ),
    CategorySpec(
        "⚙️ AUTOMAÇÕES",
        (
            ChannelSpec(
                "🔔・github-alertas",
                "Notificações de commits, Pull Requests, issues e revisões do GitHub.",
                "🔔 Canal automático. Discussões devem continuar no GitHub ou no canal correto.",
            ),
            ChannelSpec(
                "🤖・ia-relatorios",
                "Relatórios, revisões, sugestões e alertas produzidos pelos bots da MAI.",
                "🤖 Toda IA deve indicar fatos, hipóteses, riscos e nível de confiança.",
            ),
            ChannelSpec(
                "🚨・incidentes",
                "Problemas críticos de produto, cliente, segurança ou operação.",
                "🚨 **Incidente**\n\n"
                "⏰ Início:\n💥 Impacto:\n🧯 Contenção:\n👤 Responsável:\n"
                "🔍 Causa provável:\n✅ Próxima atualização:",
            ),
            ChannelSpec(
                "📊・metricas",
                "Métricas de produto, vendas, marketing, qualidade e operação.",
                "📊 Registre período, fonte, número, comparação e decisão tomada.",
            ),
        ),
    ),
    CategorySpec(
        "🗄️ ARQUIVO",
        (
            ChannelSpec(
                "📦・produtos-pausados",
                "Produtos e ideias pausados, mantendo histórico e motivo da pausa.",
                "📦 Informe motivo, data e condição para retomar.",
            ),
            ChannelSpec(
                "🏁・produtos-encerrados",
                "Produtos encerrados e decisões finais sem apagar aprendizados.",
                "🏁 Informe o que foi encerrado, por quê e qual aprendizado ficou.",
            ),
        ),
    ),
    CategorySpec(
        "🔐 DIREÇÃO PRIVADA",
        (
            ChannelSpec(
                "🔐・decisoes-privadas",
                "Decisões estratégicas e informações restritas aos sócios.",
                "🔐 Área restrita. Não coloque senhas ou tokens; use um gerenciador de senhas.",
            ),
            ChannelSpec(
                "💵・negociacoes",
                "Negociações, contratos e assuntos comerciais confidenciais.",
                "💵 Registre o mínimo necessário e proteja documentos confidenciais.",
            ),
            ChannelSpec(
                "⚠️・riscos-e-crises",
                "Riscos estratégicos e crises que exigem decisão dos sócios.",
                "⚠️ Registre fatos, impacto, opções e decisão. Evite especulação.",
            ),
        ),
        private=True,
    ),
)

ROLES = (
    "👑・Sócios",
    "🤖・IA",
    "🧭・CEO",
    "💡・Produto",
    "💻・Dev",
    "🎨・Design",
    "📣・Marketing",
    "💰・Financeiro",
    "🧪・QA",
    "🛡️・Segurança",
    "🛠️・Operações",
    "👤・Colaborador",
    "👀・Leitor",
)

LEGACY_ROLE_NAMES = {
    "Sócios": "👑・Sócios",
    "CEO": "🧭・CEO",
    "Produto": "💡・Produto",
    "Dev": "💻・Dev",
    "Design": "🎨・Design",
    "Marketing": "📣・Marketing",
    "Financeiro": "💰・Financeiro",
    "QA": "🧪・QA",
    "Segurança": "🛡️・Segurança",
    "Operações": "🛠️・Operações",
}

LEGACY_CATEGORY_NAMES = {
    "Direção": "👑 DIREÇÃO",
    "🧭 DIREÇÃO": "👑 DIREÇÃO",
    "Produto": "💡 PRODUTO",
    "Desenvolvimento": "💻 DESENVOLVIMENTO",
    "Design": "🎨 DESIGN",
    "Marketing": "📣 MARKETING",
    "Financeiro": "💰 FINANCEIRO",
    "Operações": "🛠️ OPERAÇÕES",
}

LEGACY_CHANNEL_NAMES = {
    "general": "💬・geral",
    "geral": "💬・geral",
    "ceo": "📣・ceo",
    "planejamento": "🗺️・planejamento",
    "produto": "💡・produto",
    "pesquisa-de-mercado": "🔎・pesquisa-de-mercado",
    "backend": "⚙️・backend",
    "frontend": "🖥️・frontend",
    "bugs": "🐞・bugs",
    "design": "🎨・design",
    "criativos": "✨・criativos",
    "trafego": "📈・trafego",
    "copy": "✍️・copy",
    "financeiro": "💰・financeiro",
    "qa": "🧪・qa",
    "seguranca": "🛡️・seguranca",
    "clientes": "🤝・clientes",
}


class ServerOrganizer(discord.Client):
    def __init__(self, token: str) -> None:
        super().__init__(intents=discord.Intents.default())
        self.token = token

    async def on_ready(self) -> None:
        try:
            guild = await self.choose_guild()
            await self.migrate_legacy_names(guild)
            roles = await self.create_roles(guild)
            await self.create_structure(guild, roles)
            await self.print_audit(guild)
            print(f"\nEstrutura completa da MAI configurada em: {guild.name}")
            print("Categorias, canais, descrições e guias foram criados/atualizados.")
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
            return guilds[int(choice) - 1]
        except (ValueError, IndexError) as error:
            raise RuntimeError("Escolha de servidor inválida.") from error

    async def migrate_legacy_names(self, guild: discord.Guild) -> None:
        role_names = {role.name for role in guild.roles}
        for role in list(guild.roles):
            old_name = role.name
            new_name = LEGACY_ROLE_NAMES.get(old_name)
            if not new_name:
                continue
            target = discord.utils.get(guild.roles, name=new_name)
            if target is None:
                await role.edit(name=new_name, reason="Atualização visual da MAI")
                role_names.remove(old_name)
                role_names.add(new_name)
                print(f"Cargo renomeado: {old_name} → {new_name}")
                continue
            moved_members = 0
            for member in list(role.members):
                if target not in member.roles:
                    await member.add_roles(
                        target,
                        reason="Unificação de cargos da MAI",
                    )
                await member.remove_roles(
                    role,
                    reason="Unificação de cargos da MAI",
                )
                moved_members += 1
            if not role.is_default() and not role.managed:
                await role.delete(reason="Remoção de cargo duplicado da MAI")
                print(
                    f"Cargo antigo removido: {old_name} "
                    f"(membros migrados: {moved_members})"
                )

        for category in guild.categories:
            old_name = category.name
            new_name = LEGACY_CATEGORY_NAMES.get(old_name)
            if not new_name:
                continue
            target = discord.utils.get(guild.categories, name=new_name)
            if target is None:
                await category.edit(name=new_name, reason="Atualização visual da MAI")
                print(f"Categoria renomeada: {old_name} → {new_name}")
            elif target.id != category.id and not category.channels:
                await category.delete(reason="Remoção de categoria duplicada da MAI")
                print(f"Categoria vazia removida: {old_name}")
            elif target.id != category.id:
                legacy_name = f"🗄️・{old_name.replace('🧭 ', '').lower()}-legado"
                await category.edit(name=legacy_name, reason="Organização de categoria legada")
                print(f"Categoria com conteúdo preservada como: {legacy_name}")
        for channel in guild.text_channels:
            new_name = LEGACY_CHANNEL_NAMES.get(channel.name)
            if new_name and new_name != channel.name:
                if discord.utils.get(guild.text_channels, name=new_name):
                    new_name = f"{new_name}-legado"
                await channel.edit(name=new_name, reason="Atualização visual da MAI")
                print(f"Canal renomeado: {channel.name} → {new_name}")

        for channel in guild.text_channels:
            if any(ord(character) > 127 for character in channel.name):
                continue
            new_name = f"💬・{channel.name.lower().replace(' ', '-')}"[:100]
            if new_name == channel.name:
                continue
            if discord.utils.get(guild.text_channels, name=new_name):
                new_name = f"{new_name}-legado"[:100]
            if not discord.utils.get(guild.text_channels, name=new_name):
                await channel.edit(
                    name=new_name,
                    reason="Padronização visual de canais da MAI",
                )
                print(f"Canal padronizado: {channel.name} → {new_name}")

    async def create_roles(self, guild: discord.Guild) -> Dict[str, discord.Role]:
        roles = {role.name: role for role in guild.roles}
        for role_name in ROLES:
            if role_name not in roles:
                roles[role_name] = await guild.create_role(
                    name=role_name,
                    reason="Estrutura completa da MAI",
                )
                print(f"Cargo criado: {role_name}")
        return roles

    async def find_category(
        self, guild: discord.Guild, spec: CategorySpec
    ) -> discord.CategoryChannel:
        category = discord.utils.get(guild.categories, name=spec.name)
        if category is None:
            category = await guild.create_category(
                spec.name,
                reason="Estrutura completa da MAI",
            )
            print(f"Categoria criada: {spec.name}")
        return category

    async def create_structure(
        self,
        guild: discord.Guild,
        roles: Dict[str, discord.Role],
    ) -> None:
        for spec in STRUCTURE:
            category = await self.find_category(guild, spec)
            if spec.private:
                await self.set_private_overwrite(category, roles)
            for channel_spec in spec.channels:
                channel = discord.utils.get(
                    category.text_channels,
                    name=channel_spec.name,
                )
                if channel is None:
                    channel = await guild.create_text_channel(
                        channel_spec.name,
                        category=category,
                        topic=channel_spec.topic,
                        reason="Estrutura completa da MAI",
                    )
                    print(f"Canal criado: {channel_spec.name}")
                elif channel.topic != channel_spec.topic:
                    await channel.edit(
                        topic=channel_spec.topic,
                        reason="Atualização das descrições da MAI",
                    )
                    print(f"Descrição atualizada: {channel_spec.name}")
                if spec.private:
                    await self.set_private_overwrite(channel, roles)
                await self.ensure_guide(channel, channel_spec.guide)

    async def set_private_overwrite(
        self,
        target: discord.abc.GuildChannel,
        roles: Dict[str, discord.Role],
    ) -> None:
        everyone = target.guild.default_role
        owners = roles.get("👑・Sócios")
        overwrite = {everyone: discord.PermissionOverwrite(view_channel=False)}
        if owners:
            overwrite[owners] = discord.PermissionOverwrite(view_channel=True)
        await target.edit(overwrites=overwrite)

    async def ensure_guide(
        self,
        channel: discord.TextChannel,
        guide: str,
    ) -> None:
        marker = "🤖 MAI-ORGANIZADOR — guia inicial"
        async for message in channel.history(limit=30, oldest_first=True):
            if marker in message.content:
                return
        await channel.send(f"{marker}\n\n{guide}")

    async def print_audit(self, guild: discord.Guild) -> None:
        role_names = [
            role.name
            for role in guild.roles
            if not role.is_default() and not role.managed
        ]
        channels = [channel.name for channel in guild.text_channels]
        categories = [category.name for category in guild.categories]
        print(
            "\nAuditoria final: "
            f"{len(guild.categories)} categorias, "
            f"{len(channels)} canais organizados, "
            f"{len(role_names)} cargos personalizados."
        )
        without_emoji = [
            name
            for name in role_names + channels + categories
            if not any(ord(character) > 127 for character in name)
        ]
        if without_emoji:
            print("Itens sem emoji ainda presentes: " + ", ".join(without_emoji))
        else:
            print("Auditoria visual: todos os cargos e canais organizados têm emoji.")


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
