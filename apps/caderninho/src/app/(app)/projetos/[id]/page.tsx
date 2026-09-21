import Link from "next/link";
import { redirect } from "next/navigation";

import { LinhaTarefa } from "@/components/LinhaTarefa";
import { Vazio } from "@/components/Vazio";
import { prisma } from "@/lib/prisma";

export default async function ProjetoMesaPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ aba?: string }>;
}) {
  const { id } = await params;
  const { aba } = await searchParams;
  if (aba === "quadro") {
    redirect(`/projetos/${id}/quadro`);
  }
  if (aba === "arquivos") {
    redirect(`/projetos/${id}/arquivos`);
  }
  if (aba === "comercial") {
    redirect(`/projetos/${id}/comercial`);
  }

  const projeto = await prisma.projeto.findUnique({
    where: { id },
    select: { id: true, deletedAt: true },
  });
  if (!projeto || projeto.deletedAt) {
    redirect("/projetos");
  }
  const tarefas = await prisma.tarefa.findMany({
    where: { projetoId: id, deletedAt: null },
    include: { assignee: true, projeto: true },
    orderBy: [{ updatedAt: "desc" }],
  });

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl text-sm leading-relaxed text-[var(--mute)]">
          Pedidos desta mesa. Quadro de desenho, arquivos e números ficam nas salas ao lado.
        </p>
        <Link href={`/tarefas/nova?projeto=${id}`} className="btn">
          Pedir nesta mesa
        </Link>
      </div>
      {tarefas.length === 0 ? (
        <Vazio
          titulo="Mesa quieta."
          texto="Ainda não tem pedido neste projeto."
          href={`/tarefas/nova?projeto=${id}`}
          acao="Pedir agora"
        />
      ) : (
        <div className="grid gap-3">
          {tarefas.map((t) => (
            <LinhaTarefa key={t.id} t={t} />
          ))}
        </div>
      )}
    </div>
  );
}
