import Link from "next/link";

import { diasDaAgenda, formatarPrazo, chaveDia, concluida } from "@/lib/datas";
import { prisma } from "@/lib/prisma";

export default async function AgendaPage() {
  const dias = diasDaAgenda(7);
  const inicio = dias[0];
  const fim = new Date(dias[dias.length - 1]);
  fim.setHours(23, 59, 59, 999);
  const [tarefas, projetos] = await Promise.all([
    prisma.tarefa.findMany({
      where: { prazo: { gte: inicio, lte: fim } },
      include: { assignee: true, projeto: true },
      orderBy: { prazo: "asc" },
    }),
    prisma.projeto.findMany({
      where: { prazo: { gte: inicio, lte: fim } },
      include: { cliente: true },
      orderBy: { prazo: "asc" },
    }),
  ]);

  return (
    <main className="mx-auto grid max-w-4xl gap-8">
      <div>
        <p className="kicker">Prazo</p>
        <h1 className="display mt-2 text-5xl">Agenda</h1>
        <p className="mt-3 text-[var(--mute)]">Sete dias. Tarefa e projeto com data.</p>
      </div>
      {dias.map((dia) => {
        const chave = chaveDia(dia);
        const ts = tarefas.filter((t) => t.prazo && chaveDia(t.prazo) === chave);
        const ps = projetos.filter((p) => p.prazo && chaveDia(p.prazo) === chave);
        const label = dia.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "short" });
        return (
          <section key={chave} className="grid gap-2">
            <h2 className="display text-2xl capitalize">{label}</h2>
            {ts.length === 0 && ps.length === 0 ? (
              <p className="text-sm text-[var(--mute)]">Nada neste dia.</p>
            ) : null}
            {ps.map((p) => (
              <Link key={p.id} href={`/projetos/${p.id}`} className="link-card">
                <p className="font-medium">{p.nome}</p>
                <p className="mt-1 text-sm text-[var(--mute)]">
                  Projeto · {p.cliente?.nome ?? "Interno"} · {formatarPrazo(p.prazo)}
                </p>
              </Link>
            ))}
            {ts.map((t) => (
              <Link key={t.id} href={`/tarefas/${t.id}`} className="link-card">
                <p className="font-medium">{t.titulo}</p>
                <p className="mt-1 text-sm text-[var(--mute)]">
                  {t.assignee.nome} · {t.projeto?.nome ?? "Interno"}
                  {concluida(t.status) ? " · feito" : ""}
                </p>
              </Link>
            ))}
          </section>
        );
      })}
    </main>
  );
}
