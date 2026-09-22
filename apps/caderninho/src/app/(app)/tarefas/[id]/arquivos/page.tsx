import { notFound } from "next/navigation";

import { anexarArquivo } from "@/app/actions";
import { formAction } from "@/lib/form-action";
import { Vazio } from "@/components/Vazio";
import { prisma } from "@/lib/prisma";

export default async function TarefaArquivosPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tarefa = await prisma.tarefa.findUnique({
    where: { id },
    include: { arquivos: { orderBy: { createdAt: "desc" } } },
  });
  if (!tarefa || tarefa.deletedAt) {
    notFound();
  }

  return (
    <div className="grid max-w-3xl gap-6">
      <form action={formAction(anexarArquivo)} className="panel grid gap-4 p-7">
        <p className="kicker">Anexar</p>
        <input type="hidden" name="tarefaId" value={tarefa.id} />
        <input name="arquivo" type="file" required />
        <button type="submit" className="btn w-fit">
          Guardar arquivo
        </button>
      </form>
      {tarefa.arquivos.length === 0 ? (
        <Vazio titulo="Nenhum arquivo." texto="Anexe acima. O arquivo fica no diário desta tarefa." />
      ) : (
        <section className="grid gap-3 sm:grid-cols-2">
          {tarefa.arquivos.map((arq) => {
            const foto = /\.(png|jpe?g|gif|webp|svg)$/i.test(arq.nome);
            return (
              <a key={arq.id} href={`/api/arquivos/${arq.id}`} className="panel block p-5">
                {foto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={`/api/arquivos/${arq.id}`} alt={arq.nome} className="mb-3 max-h-40 rounded-xl" />
                ) : null}
                <span className="text-sm font-medium">{arq.nome}</span>
              </a>
            );
          })}
        </section>
      )}
    </div>
  );
}
