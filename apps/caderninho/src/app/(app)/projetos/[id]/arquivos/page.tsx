import { notFound } from "next/navigation";

import { Vazio } from "@/components/Vazio";
import { prisma } from "@/lib/prisma";

export default async function ProjetoArquivosPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const projeto = await prisma.projeto.findUnique({
    where: { id },
    include: {
      tarefas: {
        where: { deletedAt: null },
        include: { arquivos: { orderBy: { createdAt: "desc" } } },
      },
    },
  });
  if (!projeto || projeto.deletedAt) {
    notFound();
  }
  const arquivos = projeto.tarefas.flatMap((t) => t.arquivos.map((a) => ({ ...a, tarefa: t.titulo })));

  if (arquivos.length === 0) {
    return (
      <Vazio
        titulo="Ainda sem arquivo."
        texto="Anexe dentro da tarefa. O arquivo mora no diário de quem está fazendo."
      />
    );
  }

  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {arquivos.map((arq) => {
        const foto = /\.(png|jpe?g|gif|webp|svg)$/i.test(arq.nome);
        return (
          <a key={arq.id} href={`/api/arquivos/${arq.id}`} className="panel block p-4">
            {foto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={`/api/arquivos/${arq.id}`} alt={arq.nome} className="mb-3 max-h-48 w-full rounded-xl object-cover" />
            ) : null}
            <p className="text-sm font-medium">{arq.nome}</p>
            <p className="mt-1 text-xs text-[var(--mute)]">{arq.tarefa}</p>
          </a>
        );
      })}
    </section>
  );
}
