import Link from "next/link";

import { Board } from "@/components/Board";
import { CartaoTarefa } from "@/components/CartaoTarefa";
import { Pagina } from "@/components/Pagina";
import { COLUNAS, statusCanon } from "@/lib/datas";
import { prisma } from "@/lib/prisma";

export default async function TarefasPage() {
  const tarefas = await prisma.tarefa.findMany({
    where: { deletedAt: null },
    include: { assignee: true, projeto: true },
    orderBy: [{ prazo: "asc" }, { updatedAt: "desc" }],
  });
  const por = Object.fromEntries(
    COLUNAS.map((c) => [c.id, tarefas.filter((t) => statusCanon(t.status) === c.id)]),
  ) as Record<string, typeof tarefas>;

  return (
    <Pagina
      kicker="Mesa"
      titulo="Tarefas"
      texto="Um quadro. Três colunas. Pedido novo abre numa página só dele."
      acao={
        <Link href="/tarefas/nova" className="btn">
          Nova tarefa
        </Link>
      }
      largo
    >
      <Board
        tres
        colunas={COLUNAS.map((c) => ({
          id: c.id,
          label: c.label,
          count: por[c.id].length,
          vazio: c.id === "a_fazer" ? "Nada na fila." : c.id === "pendente" ? "Ninguém em curso." : "Ainda sem feito.",
          children: por[c.id].map((t) => <CartaoTarefa key={t.id} t={t} />),
        }))}
      />
    </Pagina>
  );
}
