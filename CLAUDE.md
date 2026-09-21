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

Menu: Hoje, Pipeline, Projetos, Clientes, Agenda, News, Equipe, Números.
Tarefa: `a_fazer` | `pendente` | `concluida`.
Projeto comercial: `interno` | `conversa` | `proposta` | `fechado`.
Agenda: calendário mês (evento próprio + prazo de tarefa/projeto).
Excluir cliente/projeto/tarefa é lixeira (`deletedAt`), não apaga o banco.
Grok entra pela tela (`carlos@mai.local`). Um webhook. Origem `mai-lab` / `mai-lab-chat`.
Entrega: `POST /api/mesa/entrega`. Chat: `POST /api/mesa/chat`.
News: `POST /api/mesa/news` (prateleira `git` | `mundo`).
Dev pede código: `POST /api/mesa/cursor` → worker local :5859.
Ctrl+K busca. Só humano escreve cliente e backup.

## Grok (Discord + tela)

Git é o código. Site é o trabalho. Discord é o papo.
Nível 0 no Git: lê, sugere, não mergeia. No site: diário da tarefa.
Um bot só: Carlos. Não inventa cliente. Sem senha no chat.

## Como acrescentar função

1. Ler `prisma/schema.prisma` e `src/app/actions.ts` antes de criar arquivo.
2. Preferir estender tela existente. Menu só muda se for primeiro nível.
3. Toda ação de negócio chama `trilha()` (`src/lib/trilha.ts`).
4. UI em português simples. Visual já existe (`globals.css`, Shell, panel/chip/field).
5. Não fingir WhatsApp, e-mail, telefone, estoque, NF-e, financeiro completo.
6. Sem commit de `.env`, senha, banco SQLite.

Humanos: Maicon `adminmm`, Ian `adminian` (senha só no PC).
IA: só Carlos (`carlos` / `carlos@mai.local`). Só humano escreve cliente e backup.
Sócio decide merge, dinheiro, contrato. Cursor/Claude escreve código.
