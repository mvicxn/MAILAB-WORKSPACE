# MAI LAB — leia isto antes de mudar código

Escritório da MAI LAB CORP (Maicon + Ian). Não é SaaS. Não inventar
cliente, métrica, Oracle, Redis, Jarvis, API xAI, Spring, n8n, Postgres.

Produto: `apps/caderninho/` (nome na tela: MAI LAB).
Mapa do produto: `docs/produtos/caderninho.md`.
Memória curta: `agentes/MEMORIA-VIVA.md`.

## Pilha (não trocar)

Next.js 16 App Router + React 19 + TS + Tailwind 4 + Prisma 6 + SQLite.
Sobe com `npm run dev` em `apps/caderninho` (:3000 + quadro :5858 + Cursor :5859).
Segredos em `~/.config/mai/` e `apps/caderninho/.env`. Nunca no Git.

## MVP no ar

Menu: Hoje, Pipeline, Projetos, Clientes, Agenda, Equipe, Números.
Tarefa: `a_fazer` | `pendente` | `concluida`.
Projeto comercial: `interno` | `conversa` | `proposta` | `fechado`.
Grok entra pela tela (cargo + senha). Webhook origem `mai-lab` / `mai-lab-chat`.
Entrega: `POST /api/mesa/entrega`. Chat: `POST /api/mesa/chat`.
Dev pede código: `POST /api/mesa/cursor` → worker local :5859.

## Como acrescentar função

1. Ler `prisma/schema.prisma` e `src/app/actions.ts` antes de criar arquivo.
2. Preferir estender tela existente. Menu só muda se for primeiro nível.
3. Toda ação de negócio chama `trilha()` (`src/lib/trilha.ts`).
4. UI em português simples. Visual já existe (`globals.css`, Shell, panel/chip/field).
5. Não fingir WhatsApp, e-mail, telefone, estoque, NF-e, financeiro completo.
6. Sem commit de `.env`, senha, banco SQLite.

Humanos: Maicon `adminmm`, Ian `adminian` (senha só no PC).
IA: login = ficha em `src/lib/equipe.ts`. Só humano escreve cliente e backup.
Sócio decide merge, dinheiro, contrato. Cursor/Claude escreve código.
