# Linha da casa — MAI LAB

Leia isto **antes** de sugerir, gerar ou alterar código. Vale para Cursor,
VS Code + GitHub Copilot, Claude Code, Windsurf, Continue, Aider ou qualquer
outra ferramenta. Maicon e Ian usam as duas pontas (Cursor e Copilot). A
regra é a mesma.

Se este arquivo divergir de um chat antigo, **este arquivo vence**.

Mapa curto: [`CLAUDE.md`](./CLAUDE.md).
Produto: [`docs/produtos/caderninho.md`](./docs/produtos/caderninho.md).
Recorte atual: [`agentes/MEMORIA-VIVA.md`](./agentes/MEMORIA-VIVA.md).
Carlos (Grok): [`docs/operacao/BRIEFING-CARLOS-SISTEMA-MAI-LAB.md`](./docs/operacao/BRIEFING-CARLOS-SISTEMA-MAI-LAB.md).

---

## 0. Quem somos e o que isto é

MAI LAB CORP. Dois sócios: **Maicon** (Diretor / CEO) e **Ian** (Co-Diretor / CO_CEO).
Não é SaaS. Não é produto pago para fora — ainda. Primeiro usuário somos nós.

O app em `apps/caderninho/` é o **escritório** (nome na tela: **MAI LAB**).
GitHub é a pasta oficial do **código e das regras**.
O banco SQLite guarda **gente, tarefa, prazo, diário**.
Discord é **papo**. Não é fonte de verdade.

IA sugere. Humano decide merge, dinheiro, contrato, publicação.

Um Grok só: **Carlos**. Sem time de onze bots. Sem API xAI.

---

## 1. O que nunca fazer

- Inventar cliente, métrica, validação, “o cliente quer”, Oracle, Redis, Jarvis.
- Trocar a pilha (não entra: Spring, n8n, Postgres, Vercel, NextCRM copiado, WhatsApp fingido).
- Commitar `.env`, senha, token, `dev.db`, `uploads/`, `backups/`.
- Escrever senha no chat, no diário, na News ou no PR.
- Merge na `main` direto. Sempre branch + Pull Request.
- Auto-merge. Nível 0: a IA não mergeia, não publica, não gasta, não assina contrato.
- Criar cliente a partir de texto digitado no projeto. Cliente só entra pela ficha.
- Completar lista vazia com fantasia. Lista vazia é honesta.
- Fingir canal que a casa não usa (WhatsApp, e-mail em massa, telefone, NF-e, estoque, folha).
- Despejar o repositório inteiro no prompt.
- Tratar `apps/caderninho/AGENTS.md` como mapa do produto — o Next 16 recria aquele arquivo sozinho.

---

## 2. Ferramentas (quem faz o quê)

| Quem | Onde | Faz |
|---|---|---|
| Maicon, Ian | Cursor e/ou VS Code + Copilot | Pedem, revisam, mergeiam, decidem dinheiro |
| Cursor (agente) | neste repo | Escreve código, testa, commit **se o humano pedir** |
| Copilot (VS Code) | arquivo aberto | Completa, edita o arquivo, segue **este** `AGENTS.md` |
| Carlos (Grok Bot) | Discord + tela MAI LAB | Papo, analisa, faz a tarefa, escreve diário. **Não** commit/push/merge |
| GitHub | `mvicxn/MAILAB-WORKSPACE` | Código, Issues, PRs, histórico |

Copilot no VS Code: este repo já aponta as instruções em
`.github/copilot-instructions.md` e `.vscode/settings.json`.
Se o Copilot do Ian não puxar sozinho, no VS Code: *Chat > Configure Instructions*
e escolha `AGENTS.md`.

Cursor: regras em `.cursor/rules/linha-da-casa.mdc` (sempre on) + este arquivo.

---

## 3. Git (não se perder na pasta)

O trabalho mora no **repo aninhado**:

```text
/home/mm-lab-corp/MAILAB-WORKSPACE/          ← pasta do PC; ignore para commit
  mailab-workspace/                         ← ESTE é o git oficial
    .git/
    AGENTS.md                               ← você está aqui
    apps/caderninho/                        ← o escritório
```

Comandos:

```bash
git -C /home/mm-lab-corp/MAILAB-WORKSPACE/mailab-workspace status
```

- Remote: `https://github.com/mvicxn/MAILAB-WORKSPACE.git` (o antigo `mailab-workspace` redireciona).
- Não commitar no git pai, se existir. Sempre `mailab-workspace`.
- Branch por assunto. PR para `main`. Título e corpo em português simples.
- Commit: `feat:` / `fix:` / `docs:` — o **porquê**, não lista de arquivos.
- Não usar `git commit --amend` em commit já enviado. Não `--no-verify`. Não force-push em `main`.
- Identidade de commit: se o git reclamar de user, passar `GIT_AUTHOR_NAME` / `GIT_AUTHOR_EMAIL` no comando. **Não** rodar `git config`.
- Secrets: `~/.config/mai/` (socios.env, funcionarios.env, mailab.env, escritorio.env, discord.env) e `apps/caderninho/.env`. Fora do Git.

Nível 0 no Git (Carlos e qualquer bot): ler, sugerir, avisar. Sem commit, push, merge, delete, `.env`.

---

## 4. Pilha (não trocar)

- Next.js 16 App Router + React 19 + TypeScript + Tailwind 4 + Prisma 6 + SQLite.
- Cookie JWT `mai`. Login na tela `/entrar`.
- Node desta casa: `$HOME/.local/node/bin` (não assumir node global).
- Timezone: `America/Sao_Paulo`. Datas em `src/lib/datas.ts`.
- Dev:

```bash
export PATH="$HOME/.local/node/bin:$PATH"
cd /home/mm-lab-corp/MAILAB-WORKSPACE/mailab-workspace/apps/caderninho
npm run dev
```

Portas: site `:3000` · quadro ao vivo `:5858` · worker Cursor da casa `:5859`.

- Local: `http://localhost:3000`
- Ian na mesma rede: olhar o IP que o Next imprime (muda). Túnel Cloudflare (`trycloudflare.com`) quando precisar de fora. **Não é Vercel.**
- Testes: `npm test` em `apps/caderninho` (casa, carlos, news-form).
- Schema: depois de mudar `prisma/schema.prisma`, migration em `prisma/migrations/` + `npx prisma generate`. SQLite. Sem `db push` silencioso em produção — aqui só tem este PC.

---

## 5. Pessoas no sistema

| Nome | Login | E-mail | Papel | Tipo |
|---|---|---|---|---|
| Maicon | `adminmm` | (no banco) | `CEO` | `humano` |
| Ian | `adminian` | (no banco) | `CO_CEO` | `humano` |
| Carlos | `carlos` | `carlos@mai.local` | `IA_CEO` | `ia` · ficha `ceo` |

Senha **só no PC** (`~/.config/mai/socios.env` e `funcionarios.env`). Nunca copiar para o Git, PR, News ou chat.

Permissões (`src/lib/equipe.ts`, `src/lib/autorizar.ts`):

- Só humano escreve **cliente** e faz **backup**.
- Humano ou Carlos criam tarefa.
- Projeto: humano (ou ficha `ceo`).
- Excluir é lixeira (`deletedAt`). Restaurar em **Manutenção**.

---

## 6. Telas (menu real)

`src/components/Shell.tsx`

**Dia:** Hoje `/hoje` · Avisos `/avisos` · Tarefas `/tarefas` · Agenda `/agenda`  
**Casa:** Pipeline `/pipeline` · Projetos `/projetos` · Clientes `/clientes`  
**Sala:** News `/news` · Equipe `/equipe` · Manutenção `/manutencao` · Números `/relatorio`

`/ponte` **redireciona** para `/manutencao`. Não recrie a tela Ponte.

Áreas complexas têm página própria, não modal:

- Cliente: lista, `/clientes/novo`, `/clientes/[id]` (pessoa), `/clientes/[id]/ficha`
- Projeto: lista, `/projetos/novo`, `/projetos/[id]` (mesa), quadro, arquivos, comercial
- Tarefa: quadro, `/tarefas/nova`, `/tarefas/[id]` (diário), editar, arquivos

Ctrl+K: paleta (`Paleta.tsx`) busca cliente/tarefa/projeto/evento/news.

Login: `/entrar`. Sem lista de nomes na tela.

---

## 7. Estados (não inventar outro sem migrar)

**Tarefa** `statusCanon`: `a_fazer` | `pendente` | `concluida`  
(legado aceito: `aberta`/`andamento`/`feita` → canon)

**Projeto status:** `aberto` | `pausado` | `concluido`  
**Projeto comercial:** `interno` | `conversa` | `proposta` | `fechado`

**Cliente tipo:** `lead` (Prospecto) | `cliente`  
**Cliente status:** `prospeccao` | `conversando` | `proposta` | `fechou` | `ativo` | `pausado` | `morreu`  
Default ao criar: status `prospeccao`, tipo `lead`.

**News prateleira:** `git` | `mundo`

Filtro de query viva: `vivo = { deletedAt: null, empresaId: "mai" }` em `src/lib/casa.ts`. Empresa fixa `"mai"`. Não inventar multi-tenant.

---

## 8. Ficha de cliente (extra JSON)

Colunas da tabela: nome, tipo, status, contato, notas, proximo, extra, tags.

`extra` é JSON (`src/lib/cliente-extra.ts`):

`empresa` · `cargo` · `email` · `telefone` · `whatsapp` · `cidade` · `origem` · `documento`

Formulário: `CamposCliente.tsx`. Usar nos dois sítios (novo e ficha).  
Projeto **escolhe** `clienteId` no `<select>`. Opção vazia = interno. Não criar cliente por nome.

---

## 9. Carlos, webhook, News, presença

Rotina MAI LAB (não é a rotina Discord):

- Sócio cola **endereço** + **chave** em Manutenção.
- Grava em `~/.config/mai/mailab.env` (`MAI_LAB_WEBHOOK_URL`, `MAI_LAB_WEBHOOK_KEY`).
- Código: `src/lib/grok-ponte.ts`. Origem do POST: `mai-lab` (tarefa) ou `mai-lab-chat` (chat).

APIs da mesa (Carlos autentica como ele mesmo):

- `POST /api/mesa/entrega` — diário + arquivo
- `POST /api/mesa/chat` — resposta de conversa
- `POST /api/mesa/news` — prateleira git|mundo
- `POST /api/mesa/cursor` — pede código ao worker `:5859`

News Git: ao abrir `/news`, `sincronizarGitNews()` lê `git log` da pasta e cria itens `fonte = "git <shortsha>"`. Não duplicar. Autor: Carlos.

Presença: `User.vistoAt`. Client `pulso()` a cada 25s no Shell. Chat mostra Online / Ausente / Offline. Carlos: Na mesa (rotina ligada) / Em campo (`acionadoAt`) / Offline.

Avisos: `src/lib/avisos.ts` — atraso, risco (prazo ≤ 48h), tarefa no nome, news não lida, Grok em campo, rotina down, prospecção sem contato ou sem próximo passo.

Movimento: `formatarQuando` / `formatarQuandoCheio` (data + hora + relativo). Não só “47 min”.

---

## 10. Como acrescentar função (passo a passo)

1. Ler `apps/caderninho/prisma/schema.prisma` e `src/app/actions.ts`.
2. Preferir **estender tela** existente. Menu só muda se for primeiro nível de verdade.
3. Server Action em `actions.ts`. Form usa `formAction(...)`.
4. Toda ação de negócio chama `trilha()` (`src/lib/trilha.ts`) — atividade + auditoria (quem, o quê, quando, IP).
5. Query com `vivo` / `deletedAt: null`. Soft-delete, nunca `DELETE` duro de cliente/projeto/tarefa.
6. UI em **português simples**. Classes já existem em `globals.css`: `panel`, `chip`, `chip gold`, `chip late`, `chip warn`, `field`, `campo`, `btn`, `btn-ghost`, `link-card`, `kicker`, `display`, `rail-link`, `live`, `ponto`.
7. Componentes: `Pagina`, `Vazio`, `Sala`, `Avatar`, `Ponto`, `LinhaTarefa`, `Relato` (markdown), `Excluir`.
8. Revalidate: `revalidateCasa()` já cobre Hoje, projetos, pipeline, agenda, clientes, relatorio, equipe, news, avisos, manutencao.
9. Se UI mudou: **verificar no browser** o fluxo (não só screenshot). Login `/entrar`, depois a tela. Conferir regressão nas telas que leem o mesmo estado.
10. Atualizar este `AGENTS.md` + `CLAUDE.md` + `docs/produtos/caderninho.md` se o menu, estado ou regra mudou.
11. Commit só se o humano pediu. Subir no Git (`push`) se o humano pediu — neste pedido atual, **subir**.

Não copiar `referencia/` (NextCRM, Digiboard). Está no `.gitignore`. Inspiração visual no máximo; dados e stack da casa.

---

## 11. Mapa de arquivos (caderninho)

```text
apps/caderninho/
  prisma/schema.prisma          modelos
  prisma/migrations/            SQL na ordem
  prisma/dev.db                 NÃO sobe
  src/app/actions.ts            todas as mutações
  src/app/(app)/layout.tsx      Shell + pulso + avisos
  src/app/(app)/…               páginas por rota
  src/app/api/mesa/             Carlos
  src/components/Shell.tsx      menu
  src/lib/datas.ts              datas, status, comercial
  src/lib/equipe.ts             Carlos + permissões
  src/lib/autorizar.ts          assert*
  src/lib/auth.ts               JWT cookie mai
  src/lib/trilha.ts             atividade + auditoria
  src/lib/grok-ponte.ts         webhook
  src/lib/git-news.ts           git log → News
  src/lib/avisos.ts             central
  src/lib/presenca.ts           online
  src/lib/cliente-extra.ts      extra JSON
  src/app/globals.css           visual
  server/quadro.mjs             :5858
  server/cursor-casa.mjs        :5859
```

Raiz do monorepo (não misturar com o escritório):

- `agentes/` — fichas do Grok no Discord (Carlos escolhe um especialista)
- `grok-bridge/` — rotina Discord (distinta da rotina MAI LAB do escritório)
- `docs/` — produto, operação, integração
- `discord-organizer/`, `video-transcriber/` — ferramentas à parte

---

## 12. Linguagem e visual

- Português do Brasil, frase curta, uma ideia. Sem relatório de emoji.
- Na cabeça: fato vs chute. No texto: “o que a gente já viu” vs “o que eu acho”.
- Código: TypeScript estrito do projeto. Sem `any` novo. Sem lib extra sem pedido.
- Comentários só se o porquê não for óbvio. UI sem inglês de produto (ok `className`).
- Paleta já está no CSS (rail escuro, gold, panel). Não inventar tema paralelo.

---

## 13. Fora do MVP (não construir agora)

Automações, financeiro, estoque, NF-e, IA preenchendo ficha sozinha, API pública,
WhatsApp/e-mail reais, widgets arrastáveis, permissão por módulo na tela,
multi-tenant para outra empresa, time de vários Groks, construtor de campo.

`ModeloMensagem` e `CampoPersonalizado` existem no banco **sem tela**. Não ligue como produto.

Norte da empresa: os dois abrem Hoje e atualizam cliente/projeto/tarefa. Próximo passo não mora só no chat. Validar o primeiro produto com gente de verdade.

---

## 14. Checklist antes de entregar

- [ ] Não inventei cliente nem métrica.
- [ ] Não committei segredo nem SQLite.
- [ ] Schema + action + trilha + tela (se era caso de negócio).
- [ ] Português na UI. Status/canon existentes.
- [ ] Cliente de projeto veio de `<select>`, não de texto livre.
- [ ] Conferi no browser o fluxo que mudei.
- [ ] Atualizei `AGENTS.md` / `CLAUDE.md` se a regra da casa mudou.
- [ ] Branch + PR. Sócio mergeia.

---

## 15. Se você é o Copilot no arquivo aberto

Não refatore o app inteiro. Mude o arquivo (e o mínimo ao redor).
Se a tarefa pedir tela nova, leia `actions.ts` e o `schema` antes.
Se faltar dado no banco, **não invente linha** — pergunte ou deixe vazio.
Se o humano pedir “sobe no git”, commit + push na branch atual, sem force na main.
