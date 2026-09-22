import Link from "next/link";

import { Pagina } from "@/components/Pagina";
import { COMERCIAL, LABEL_COMERCIAL, STATUS_CLIENTE, atrasada, concluida } from "@/lib/datas";
import { prisma } from "@/lib/prisma";

export default async function RelatorioPage() {
  const [clientes, projetos, tarefas, atividades] = await Promise.all([
    prisma.cliente.findMany({ where: { deletedAt: null } }),
    prisma.projeto.findMany({ where: { deletedAt: null } }),
    prisma.tarefa.findMany({ where: { deletedAt: null }, include: { assignee: true } }),
    prisma.atividade.count({
      where: { createdAt: { gte: new Date(Date.now() - 7 * 86400000) } },
    }),
  ]);
  const atrasos = tarefas.filter((t) => atrasada(t.status, t.prazo)).length;
  const abertas = tarefas.filter((t) => !concluida(t.status)).length;
  const grok = tarefas.filter((t) => t.assignee.tipo === "ia" && t.acionadoAt && !concluida(t.status)).length;
  const fechados = projetos.filter((p) => p.comercial === "fechado").length;

  return (
    <Pagina kicker="Números" titulo="Relatório" texto="O que a casa tem hoje. Sem métrica inventada.">
      <section className="grid gap-3 sm:grid-cols-3">
        <Link href="/clientes" className="panel stat">
          <p className="kicker">Pessoas</p>
          <p className="n-stat mt-3">{clientes.length}</p>
        </Link>
        <Link href="/pipeline" className="panel stat">
          <p className="kicker">Fechado</p>
          <p className="n-stat mt-3">{fechados}</p>
        </Link>
        <Link href="/tarefas" className="panel stat">
          <p className="kicker">Tarefas abertas</p>
          <p className="n-stat mt-3">{abertas}</p>
        </Link>
        <div className="panel stat">
          <p className="kicker">Atraso</p>
          <p className="n-stat mt-3">{atrasos}</p>
        </div>
        <div className="panel stat">
          <p className="kicker">Grok em campo</p>
          <p className="n-stat mt-3">{grok}</p>
        </div>
        <div className="panel stat">
          <p className="kicker">Movimento 7 dias</p>
          <p className="n-stat mt-3">{atividades}</p>
        </div>
      </section>
      <section className="grid gap-6 sm:grid-cols-2">
        <div className="panel p-7">
          <h2 className="display text-2xl">Pipeline</h2>
          <ul className="mt-5 grid gap-3 text-sm">
            {COMERCIAL.map((c) => (
              <li key={c.id} className="flex justify-between">
                <span>{LABEL_COMERCIAL[c.id]}</span>
                <span>{projetos.filter((p) => p.comercial === c.id).length}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="panel p-7">
          <h2 className="display text-2xl">Clientes</h2>
          <ul className="mt-5 grid gap-3 text-sm">
            {Object.entries(STATUS_CLIENTE).map(([id, label]) => (
              <li key={id} className="flex justify-between">
                <span>{label}</span>
                <span>{clientes.filter((c) => c.status === id).length}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </Pagina>
  );
}
