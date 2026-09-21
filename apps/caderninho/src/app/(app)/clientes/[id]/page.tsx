import Link from "next/link";
import { notFound } from "next/navigation";

import { Relato } from "@/components/Relato";
import { Vazio } from "@/components/Vazio";
import { haQuanto } from "@/lib/datas";
import { prisma } from "@/lib/prisma";

export default async function ClientePessoaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cliente = await prisma.cliente.findUnique({
    where: { id },
    include: {
      projetos: { where: { deletedAt: null }, orderBy: { updatedAt: "desc" } },
      tarefas: { where: { deletedAt: null }, include: { assignee: true }, orderBy: { updatedAt: "desc" }, take: 8 },
      tags: { include: { tag: true } },
      atividades: { include: { user: true }, orderBy: { createdAt: "desc" }, take: 20 },
      eventos: { where: { deletedAt: null }, orderBy: { inicio: "desc" }, take: 8 },
    },
  });
  if (!cliente || cliente.deletedAt) {
    notFound();
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="grid gap-8">
        {cliente.proximo ? (
          <p className="text-lg">
            <span className="text-[var(--gold)]">Próximo. </span>
            {cliente.proximo}
          </p>
        ) : null}
        {cliente.tags.length ? (
          <div className="flex flex-wrap gap-1">
            {cliente.tags.map((x) => (
              <span key={x.tagId} className="chip gold">
                {x.tag.nome}
              </span>
            ))}
          </div>
        ) : null}
        {cliente.notas.trim() ? (
          <section className="panel p-7">
            <p className="kicker">Notas</p>
            <div className="mt-3">
              <Relato texto={cliente.notas} />
            </div>
          </section>
        ) : null}
        <section className="grid gap-3">
          <h2 className="display text-3xl">Movimento</h2>
          {cliente.atividades.length === 0 ? (
            <p className="text-sm text-[var(--mute)]">Ainda sem movimento nesta ficha.</p>
          ) : (
            cliente.atividades.map((a) => (
              <article key={a.id} className="panel p-5">
                <p className="text-xs text-[var(--mute)]">
                  {a.user.nome} · {haQuanto(a.createdAt)}
                </p>
                <p className="mt-1">{a.texto}</p>
              </article>
            ))
          )}
        </section>
      </div>
      <aside className="grid gap-6 lg:sticky lg:top-8 lg:self-start">
        <section className="grid gap-2">
          <h2 className="display text-2xl">Projetos</h2>
          {cliente.projetos.length === 0 ? (
            <Vazio titulo="Nenhum projeto." texto="Abra uma mesa e ligue esta pessoa." />
          ) : (
            cliente.projetos.map((p) => (
              <Link key={p.id} href={`/projetos/${p.id}`} className="link-card">
                {p.nome}
              </Link>
            ))
          )}
        </section>
        <section className="grid gap-2">
          <h2 className="display text-2xl">Tarefas</h2>
          {cliente.tarefas.length === 0 ? (
            <p className="text-sm text-[var(--mute)]">Nenhuma tarefa ligada.</p>
          ) : (
            cliente.tarefas.map((t) => (
              <Link key={t.id} href={`/tarefas/${t.id}`} className="link-card">
                {t.titulo} · {t.assignee.nome}
              </Link>
            ))
          )}
        </section>
        <section className="grid gap-2">
          <h2 className="display text-2xl">Agenda</h2>
          {cliente.eventos.length === 0 ? (
            <p className="text-sm text-[var(--mute)]">Nenhum evento ligado.</p>
          ) : (
            cliente.eventos.map((e) => (
              <Link key={e.id} href="/agenda" className="link-card">
                {e.titulo}
              </Link>
            ))
          )}
        </section>
      </aside>
    </div>
  );
}
