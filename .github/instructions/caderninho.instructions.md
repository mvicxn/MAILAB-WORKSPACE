---
applyTo: "apps/caderninho/**"
---

Trabalho no escritório MAI LAB. Siga `AGENTS.md` na raiz.

- Schema: `apps/caderninho/prisma/schema.prisma`
- Ações: `apps/caderninho/src/app/actions.ts`
- Menu: `apps/caderninho/src/components/Shell.tsx`
- Datas/status: `apps/caderninho/src/lib/datas.ts`
- Trilha: `apps/caderninho/src/lib/trilha.ts`
- Não inventar cliente. Select de `clienteId`. extra JSON em `cliente-extra.ts`.
- Status cliente inclui `prospeccao`. Tarefa: `a_fazer|pendente|concluida`.
- `/ponte` redireciona para `/manutencao`.
- Soft-delete `deletedAt`. Empresa `"mai"`. Timezone `America/Sao_Paulo`.
- UI: `panel` `field` `chip` `btn` `Pagina` `Vazio`. Português.
- Depois de UI: o humano verifica no browser. Você descreve o que testar.
