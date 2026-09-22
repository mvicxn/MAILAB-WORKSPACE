import { notFound } from "next/navigation";

import { mudarStatusTarefa, registrarTrabalho } from "@/app/actions";
import { formAction } from "@/lib/form-action";
import { Acionar } from "@/components/Acionar";
import { Avatar } from "@/components/Avatar";
import { DiarioVivo } from "@/components/DiarioVivo";
import { Relato } from "@/components/Relato";
import { usuarioAtual } from "@/lib/auth";
import { COLUNAS, formatarPrazo, statusCanon } from "@/lib/datas";
import { ehHumano } from "@/lib/equipe";
import { prisma } from "@/lib/prisma";

export default async function TarefaDiarioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [user, tarefa] = await Promise.all([
    usuarioAtual(prisma),
    prisma.tarefa.findUnique({
      where: { id },
      include: {
        assignee: true,
        atualizacoes: { include: { autor: true }, orderBy: { createdAt: "desc" } },
      },
    }),
  ]);
  if (!tarefa || tarefa.deletedAt) {
    notFound();
  }
  const socio = user ? ehHumano(user.papel, user.tipo) : false;
  const grokVivo = tarefa.assignee.tipo === "ia" && Boolean(tarefa.acionadoAt) && statusCanon(tarefa.status) !== "concluida";

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20.5rem]">
      <div className="grid gap-6">
        {tarefa.descricao.trim() ? (
          <section className="panel p-7">
            <p className="kicker">Notas</p>
            <div className="mt-3">
              <Relato texto={tarefa.descricao} />
            </div>
          </section>
        ) : null}

        <section className="grid gap-4">
          <h2 className="display text-3xl">Diário</h2>
          <form action={formAction(registrarTrabalho)} className="panel grid gap-3 p-6">
            <input type="hidden" name="tarefaId" value={tarefa.id} />
            <textarea name="texto" required rows={5} placeholder="O que ficou pronto. Markdown vale." className="field" />
            <button type="submit" className="btn w-fit">
              Registrar entrega
            </button>
          </form>
          <DiarioVivo
            tarefaId={tarefa.id}
            vivo={grokVivo}
            inicial={tarefa.atualizacoes.map((i) => ({
              id: i.id,
              texto: i.texto,
              createdAt: i.createdAt.toISOString(),
              autor: { nome: i.autor.nome, tipo: i.autor.tipo },
            }))}
          />
        </section>
      </div>

      <aside className="grid gap-4 lg:sticky lg:top-8 lg:self-start">
        <section className="panel grid gap-4 p-6">
          <p className="flex items-center gap-2 text-sm">
            <Avatar nome={tarefa.assignee.nome} tipo={tarefa.assignee.tipo} size={28} />
            <span>
              <span className="block font-medium">{tarefa.assignee.nome}</span>
              <span className="text-[var(--mute)]">
                {tarefa.assignee.tipo === "ia" ? "Grok" : "Sócio"} · {formatarPrazo(tarefa.prazo)}
              </span>
            </span>
          </p>
          {grokVivo ? (
            <p className="flex items-center gap-2 text-xs text-[var(--gold)]">
              <span className="live" /> Em campo
            </p>
          ) : null}
          <form action={formAction(mudarStatusTarefa)} className="flex flex-wrap gap-2">
            <input type="hidden" name="id" value={tarefa.id} />
            {COLUNAS.map((c) => (
              <button
                key={c.id}
                name="status"
                value={c.id}
                className={statusCanon(tarefa.status) === c.id ? "btn" : "btn-ghost"}
              >
                {c.label}
              </button>
            ))}
          </form>
        </section>
        {socio && tarefa.assignee.tipo === "ia" ? <Acionar tarefaId={tarefa.id} nome={tarefa.assignee.nome} grande /> : null}
      </aside>
    </div>
  );
}
