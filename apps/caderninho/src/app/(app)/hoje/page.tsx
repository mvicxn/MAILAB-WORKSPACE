import Link from "next/link";

import { LinhaTarefa } from "@/components/LinhaTarefa";
import { Pagina } from "@/components/Pagina";
import { Relato } from "@/components/Relato";
import { Vazio } from "@/components/Vazio";
import { usuarioAtual } from "@/lib/auth";
import { atrasada, chaveDia, concluida, formatarQuandoCheio, hojeExtenso, saudacao } from "@/lib/datas";
import { prisma } from "@/lib/prisma";

export default async function HojePage() {
  const user = await usuarioAtual(prisma);
  const [tarefas, entregas, atividades] = await Promise.all([
    prisma.tarefa.findMany({
      where: { deletedAt: null },
      include: { assignee: true, projeto: true },
      orderBy: [{ prazo: "asc" }, { updatedAt: "desc" }],
    }),
    prisma.atualizacao.findMany({
      include: { autor: true, tarefa: { include: { projeto: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.atividade.findMany({
      include: { user: true, cliente: true, projeto: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);
  const minhas = user ? tarefas.filter((t) => t.assigneeId === user.id && !concluida(t.status)) : [];
  const atrasos = tarefas.filter((t) => atrasada(t.status, t.prazo));
  const campo = tarefas.filter((t) => t.assignee.tipo === "ia" && t.acionadoAt && !concluida(t.status));
  const hojeChave = chaveDia(new Date());
  const agendaHoje = tarefas.filter((t) => t.prazo && chaveDia(t.prazo) === hojeChave && !concluida(t.status));

  return (
    <Pagina
      kicker={hojeExtenso()}
      titulo={`${saudacao()}${user ? `, ${user.nome.split(" ")[0]}` : ""}.`}
      texto="O dia da casa. Pedido novo mora em Tarefas. Cada projeto tem a própria mesa."
      acao={
        <Link href="/tarefas/nova" className="btn">
          Nova tarefa
        </Link>
      }
      largo
    >
      <div className="grid gap-3 sm:grid-cols-4">
        <Link href="/tarefas" className="panel stat">
          <p className="kicker">Sua mesa</p>
          <p className="n-stat mt-3">{minhas.length}</p>
        </Link>
        <Link href="/agenda" className="panel stat">
          <p className="kicker">Agenda hoje</p>
          <p className="n-stat mt-3">{agendaHoje.length}</p>
        </Link>
        <Link href="/avisos" className="panel stat">
          <p className="kicker">Atraso</p>
          <p className="n-stat mt-3">{atrasos.length}</p>
        </Link>
        <Link href="/equipe" className="panel stat">
          <p className="kicker">Grok em campo</p>
          <p className="n-stat mt-3">{campo.length}</p>
        </Link>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="grid gap-10">
          {atrasos.length > 0 ? (
            <section className="grid gap-4">
              <h2 className="display text-3xl">Atraso</h2>
              {atrasos.map((t) => (
                <LinhaTarefa key={t.id} t={t} latePulse />
              ))}
            </section>
          ) : null}

          <section className="grid gap-4">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="display text-3xl">Sua mesa</h2>
              <Link href="/tarefas" className="text-sm text-[var(--gold)]">
                Ver quadro
              </Link>
            </div>
            {minhas.length === 0 ? (
              <Vazio
                titulo="Mesa limpa."
                texto="Quando tiver pedido no seu nome, aparece aqui."
                href="/tarefas/nova"
                acao="Pedir agora"
              />
            ) : (
              minhas.map((t) => <LinhaTarefa key={t.id} t={t} />)
            )}
          </section>
        </div>

        <aside className="grid gap-6 lg:sticky lg:top-8 lg:self-start">
          <section className="panel p-7">
            <p className="kicker">Grok</p>
            <h2 className="display mt-2 text-2xl">Em campo</h2>
            {campo.length === 0 ? (
              <p className="mt-3 text-sm leading-relaxed text-[var(--mute)]">
                Ninguém em campo. Na tarefa nova, escolha o Carlos.
              </p>
            ) : (
              <div className="mt-5 grid gap-3">
                {campo.map((t) => (
                  <Link key={t.id} href={`/tarefas/${t.id}`} className="flex items-start justify-between gap-2">
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
              <p className="text-sm text-[var(--mute)]">Ainda sem trilha. A casa começa vazia.</p>
            ) : (
              atividades.map((a) => (
                <article key={a.id} className="panel p-5">
                  <p className="text-xs text-[var(--mute)]">
                    {a.user.nome} · {formatarQuandoCheio(a.createdAt)}
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
              <p className="text-sm text-[var(--mute)]">Quando o Carlos registrar, aparece aqui.</p>
            ) : (
              entregas.map((item) => (
                <Link key={item.id} href={`/tarefas/${item.tarefaId}`} className="panel block p-5">
                  <p className="text-xs text-[var(--mute)]">
                    {item.autor.nome}
                    {item.tarefa.projeto ? ` · ${item.tarefa.projeto.nome}` : ""} · {formatarQuandoCheio(item.createdAt)}
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
    </Pagina>
  );
}
