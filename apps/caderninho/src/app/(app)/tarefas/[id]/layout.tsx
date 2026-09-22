import Link from "next/link";
import { notFound } from "next/navigation";

import { Sala } from "@/components/Sala";
import { atrasada, formatarPrazo, STATUS_TAREFA, statusCanon } from "@/lib/datas";
import { prisma } from "@/lib/prisma";

export default async function TarefaLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tarefa = await prisma.tarefa.findUnique({
    where: { id },
    include: { assignee: true, projeto: true },
  });
  if (!tarefa || tarefa.deletedAt) {
    notFound();
  }
  const late = atrasada(tarefa.status, tarefa.prazo);

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-6">
      <header className="grid gap-5">
        <div>
          <p className="text-sm text-[var(--mute)]">
            {tarefa.projeto ? (
              <Link href={`/projetos/${tarefa.projeto.id}`} className="text-[var(--gold)]">
                {tarefa.projeto.nome}
              </Link>
            ) : (
              "Interno"
            )}
            {tarefa.projeto?.valor ? ` · ${tarefa.projeto.valor}` : ""}
            {late ? " · atraso" : ""}
          </p>
          <h1 className="display mt-3 text-4xl sm:text-5xl">{tarefa.titulo}</h1>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className={`chip ${late ? "late" : ""}`}>
              {late ? "Atraso" : STATUS_TAREFA[statusCanon(tarefa.status)]}
            </span>
            <span className="chip">{tarefa.assignee.nome}</span>
            <span className="chip">{formatarPrazo(tarefa.prazo)}</span>
          </div>
        </div>
        <Sala
          base={`/tarefas/${id}`}
          itens={[
            ["Diário", ""],
            ["Arquivos", "/arquivos"],
            ["Editar", "/editar"],
          ]}
        />
      </header>
      {children}
    </div>
  );
}
