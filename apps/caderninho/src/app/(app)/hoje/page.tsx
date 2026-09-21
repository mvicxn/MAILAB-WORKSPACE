import Link from "next/link";

import { FormTarefa } from "@/components/FormTarefa";
import { LinhaTarefa } from "@/components/LinhaTarefa";
import { Relato } from "@/components/Relato";
import { Reveal } from "@/components/Reveal";
import { usuarioAtual } from "@/lib/auth";
import { atrasada, chaveDia, concluida, haQuanto, hojeExtenso, saudacao } from "@/lib/datas";
import { prisma } from "@/lib/prisma";

export default async function HojePage() {
  const user = await usuarioAtual(prisma);
  const [tarefas, gente, projetos, entregas, atividades] = await Promise.all([
    prisma.tarefa.findMany({
      include: { assignee: true, projeto: true },
      orderBy: [{ prazo: "asc" }, { updatedAt: "desc" }],
    }),
    prisma.user.findMany({ where: { ativo: true }, orderBy: [{ tipo: "asc" }, { nome: "asc" }] }),
    prisma.projeto.findMany({ orderBy: { nome: "asc" } }),
    prisma.atualizacao.findMany({
      include: { autor: true, tarefa: { include: { projeto: true } } },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.atividade.findMany({
      include: { user: true, cliente: true, projeto: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);
  const minhas = user
    ? tarefas.filter((t) => t.assigneeId === user.id && !concluida(t.status))
    : [];
  const atrasos = tarefas.filter((t) => atrasada(t.status, t.prazo));
  const campo = tarefas.filter((t) => t.assignee.tipo === "ia" && t.acionadoAt && !concluida(t.status));
  const casa = tarefas.filter(
    (t) => !concluida(t.status) && (!user || t.assigneeId !== user.id) && !campo.some((c) => c.id === t.id),
  );

  const hojeChave = chaveDia(new Date());
  const agendaHoje = tarefas.filter((t) => t.prazo && chaveDia(t.prazo) === hojeChave && !concluida(t.status));

  return (
    <main className="mx-auto grid max-w-6xl gap-8">
      <Reveal>
        <p className="kicker">{hojeExtenso()}</p>
        <h1 className="display mt-3 text-5xl leading-[0.95] sm:text-6xl">
          {`${saudacao()}${user ? `, ${user.nome.split(" ")[0]}` : ""}.`}
        </h1>
      </Reveal>

      <FormTarefa users={gente} projetos={projetos} euId={user?.id} voltar="/hoje" />

      <div className="grid gap-3 sm:grid-cols-4">
        <Link href="/pipeline" className="panel stat">
          <p className="kicker">Pipeline</p>
          <p className="mt-2 text-sm text-[var(--mute)]">Onde o dinheiro está</p>
        </Link>
        <Link href="/agenda" className="panel stat">
          <p className="kicker">Agenda</p>
          <p className="n-stat mt-2">{agendaHoje.length}</p>
        </Link>
        <Link href="/clientes" className="panel stat">
          <p className="kicker">Clientes</p>
          <p className="mt-2 text-sm text-[var(--mute)]">Pessoas reais</p>
        </Link>
        <Link href="/relatorio" className="panel stat">
          <p className="kicker">Números</p>
          <p className="mt-2 text-sm text-[var(--mute)]">O que a casa tem</p>
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="grid gap-8">
          {agendaHoje.length > 0 ? (
            <section className="grid gap-3">
              <h2 className="display text-3xl">Hoje na agenda</h2>
              {agendaHoje.map((t) => (
                <LinhaTarefa key={t.id} t={t} />
              ))}
            </section>
          ) : null}

          {atrasos.length > 0 ? (
            <section className="grid gap-3">
              <h2 className="display text-3xl">Atraso</h2>
              {atrasos.map((t) => (
                <LinhaTarefa key={t.id} t={t} latePulse />
              ))}
            </section>
          ) : null}

          <section className="grid gap-3">
            <div className="flex items-baseline justify-between">
              <h2 className="display text-3xl">Sua mesa</h2>
              <span className="text-sm text-[var(--mute)]">{minhas.length}</span>
            </div>
            {minhas.length === 0 ? (
              <div className="panel p-8">
                <p className="display text-2xl">Mesa limpa.</p>
                <p className="mt-2 text-sm text-[var(--mute)]">
                  Peça acima, ou abra um projeto e coloque o Grok para trabalhar.
                </p>
              </div>
            ) : (
              minhas.map((t) => <LinhaTarefa key={t.id} t={t} />)
            )}
          </section>

          {casa.length > 0 ? (
            <section className="grid gap-3">
              <h2 className="display text-3xl">Casa</h2>
              {casa.slice(0, 8).map((t) => (
                <LinhaTarefa key={t.id} t={t} />
              ))}
            </section>
          ) : null}
        </div>

        <aside className="grid gap-6 lg:sticky lg:top-8 lg:self-start">
          <section className="panel p-6">
            <p className="kicker">Grok</p>
            <h2 className="display mt-2 text-2xl">Em campo</h2>
            {campo.length === 0 ? (
              <p className="mt-3 text-sm text-[var(--mute)]">
                Ninguém em campo. No pedido, escolha um Grok. Ele recebe o briefing e escreve no diário.
              </p>
            ) : (
              <div className="mt-4 grid gap-2">
                {campo.map((t) => (
                  <Link key={t.id} href={`/tarefas/${t.id}`} className="flex items-start justify-between gap-2 rounded-xl py-2">
                    <span>
                      <span className="block font-medium">{t.assignee.nome}</span>
                      <span className="text-sm text-[var(--mute)]">{t.titulo}</span>
                    </span>
                    <span className="live mt-2" />
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="grid gap-3">
            <h2 className="display text-2xl">Movimento</h2>
            {atividades.length === 0 ? (
              <p className="text-sm text-[var(--mute)]">O escritório ainda não registrou trilha.</p>
            ) : (
              atividades.map((a) => (
                <article key={a.id} className="panel p-4">
                  <p className="text-xs text-[var(--mute)]">
                    {a.user.nome} · {haQuanto(a.createdAt)}
                    {a.cliente ? ` · ${a.cliente.nome}` : ""}
                    {a.projeto ? ` · ${a.projeto.nome}` : ""}
                  </p>
                  <p className="mt-1 text-sm">{a.texto}</p>
                </article>
              ))
            )}
          </section>

          <section className="grid gap-3">
            <h2 className="display text-2xl">Entregas</h2>
            {entregas.length === 0 ? (
              <p className="text-sm text-[var(--mute)]">Quando o time registrar, aparece aqui.</p>
            ) : (
              entregas.map((item) => (
                <Link key={item.id} href={`/tarefas/${item.tarefaId}`} className="panel block p-5">
                  <p className="text-xs text-[var(--mute)]">
                    {item.autor.nome}
                    {item.tarefa.projeto ? ` · ${item.tarefa.projeto.nome}` : ""} · {haQuanto(item.createdAt)}
                  </p>
                  <p className="mt-1 text-sm font-medium">{item.tarefa.titulo}</p>
                  <div className="mt-2 max-h-24 overflow-hidden text-sm text-[var(--mute)]">
                    <Relato texto={item.texto} />
                  </div>
                </Link>
              ))
            )}
          </section>
        </aside>
      </div>
    </main>
  );
}
