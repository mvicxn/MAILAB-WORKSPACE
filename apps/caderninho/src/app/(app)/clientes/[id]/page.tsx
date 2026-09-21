import Link from "next/link";
import { notFound } from "next/navigation";

import { atualizarCliente } from "@/app/actions";
import { Relato } from "@/components/Relato";
import { haQuanto, STATUS_CLIENTE } from "@/lib/datas";
import { prisma } from "@/lib/prisma";

export default async function ClientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cliente = await prisma.cliente.findUnique({
    where: { id },
    include: {
      projetos: { orderBy: { updatedAt: "desc" } },
      tarefas: { include: { assignee: true }, orderBy: { updatedAt: "desc" }, take: 8 },
      tags: { include: { tag: true } },
      atividades: { include: { user: true }, orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
  if (!cliente) {
    notFound();
  }

  return (
    <main className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="grid gap-6">
        <div>
          <p className="kicker">{STATUS_CLIENTE[cliente.status] ?? cliente.status}</p>
          <h1 className="display mt-2 text-5xl">{cliente.nome}</h1>
          {cliente.contato ? <p className="mt-3 text-[var(--mute)]">{cliente.contato}</p> : null}
          {cliente.proximo ? (
            <p className="mt-3">
              <span className="text-[var(--gold)]">Próximo. </span>
              {cliente.proximo}
            </p>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-1">
            {cliente.tags.map((x) => (
              <span key={x.tagId} className="chip gold">
                {x.tag.nome}
              </span>
            ))}
          </div>
        </div>

        {cliente.notas.trim() ? (
          <section className="panel p-6">
            <p className="kicker">Notas</p>
            <div className="mt-3">
              <Relato texto={cliente.notas} />
            </div>
          </section>
        ) : null}

        <section className="grid gap-3">
          <h2 className="display text-3xl">Timeline</h2>
          {cliente.atividades.length === 0 ? (
            <p className="text-sm text-[var(--mute)]">Ainda sem movimento nesta ficha.</p>
          ) : (
            cliente.atividades.map((a) => (
              <article key={a.id} className="panel p-4">
                <p className="text-xs text-[var(--mute)]">
                  {a.user.nome} · {haQuanto(a.createdAt)}
                </p>
                <p className="mt-1">{a.texto}</p>
              </article>
            ))
          )}
        </section>
      </div>

      <aside className="grid gap-4 lg:sticky lg:top-8 lg:self-start">
        <form action={atualizarCliente} className="panel grid gap-3 p-5">
          <p className="kicker">Ficha</p>
          <input type="hidden" name="id" value={cliente.id} />
          <input name="nome" required defaultValue={cliente.nome} className="field" />
          <select name="tipo" className="field" defaultValue={cliente.tipo}>
            <option value="lead">Prospecto</option>
            <option value="cliente">Cliente</option>
          </select>
          <select name="status" className="field" defaultValue={cliente.status}>
            <option value="conversando">Em conversa</option>
            <option value="proposta">Proposta</option>
            <option value="fechou">Fechado</option>
            <option value="ativo">Ativo</option>
            <option value="morreu">Encerrado</option>
          </select>
          <input name="contato" defaultValue={cliente.contato} placeholder="Contato" className="field" />
          <input name="proximo" defaultValue={cliente.proximo} placeholder="Próximo passo" className="field" />
          <input
            name="tags"
            defaultValue={cliente.tags.map((x) => x.tag.nome).join(", ")}
            placeholder="Tags"
            className="field"
          />
          <textarea name="notas" rows={4} defaultValue={cliente.notas} className="field" />
          <button type="submit" className="btn w-fit">
            Salvar
          </button>
        </form>

        <section className="grid gap-2">
          <h2 className="display text-2xl">Projetos</h2>
          {cliente.projetos.length === 0 ? (
            <p className="text-sm text-[var(--mute)]">Nenhum projeto ligado.</p>
          ) : (
            cliente.projetos.map((p) => (
              <Link key={p.id} href={`/projetos/${p.id}`} className="link-card">
                {p.nome}
              </Link>
            ))
          )}
        </section>
      </aside>
    </main>
  );
}
