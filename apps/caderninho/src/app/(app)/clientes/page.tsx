import Link from "next/link";

import { Pagina } from "@/components/Pagina";
import { Vazio } from "@/components/Vazio";
import { ehHumano } from "@/lib/equipe";
import { usuarioAtual } from "@/lib/auth";
import { lerExtra, resumoFicha } from "@/lib/cliente-extra";
import { ORDEM_STATUS_CLIENTE, STATUS_CLIENTE } from "@/lib/datas";
import { prisma } from "@/lib/prisma";

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ s?: string }>;
}) {
  const user = await usuarioAtual(prisma);
  const socio = user ? ehHumano(user.papel, user.tipo) : false;
  const { s } = await searchParams;
  const filtro = s && STATUS_CLIENTE[s] ? s : "";
  const [clientes, totais] = await Promise.all([
    prisma.cliente.findMany({
      where: { deletedAt: null, ...(filtro ? { status: filtro } : {}) },
      include: { projetos: { where: { deletedAt: null } }, tags: { include: { tag: true } } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.cliente.groupBy({
      by: ["status"],
      where: { deletedAt: null },
      _count: { _all: true },
    }),
  ]);
  const porStatus = Object.fromEntries(totais.map((x) => [x.status, x._count._all]));

  return (
    <Pagina
      kicker="Pessoas"
      titulo="Clientes"
      texto="Gente real. Prospecção, conversa e cliente fechado. Lista vazia é honesta."
      acao={
        socio ? (
          <Link href="/clientes/novo" className="btn">
            Nova ficha
          </Link>
        ) : null
      }
    >
      <nav className="tabs">
        <Link href="/clientes" className={`tab ${filtro === "" ? "on" : ""}`}>
          Todas
        </Link>
        {ORDEM_STATUS_CLIENTE.map((id) => (
          <Link key={id} href={`/clientes?s=${id}`} className={`tab ${filtro === id ? "on" : ""}`}>
            {STATUS_CLIENTE[id]}
            {porStatus[id] ? ` ${porStatus[id]}` : ""}
          </Link>
        ))}
      </nav>
      {clientes.length === 0 ? (
        <Vazio
          titulo={filtro ? "Ninguém neste status." : "Ninguém na lista."}
          texto="Quando existir conversa de verdade, entra aqui."
          href={socio ? "/clientes/novo" : undefined}
          acao={socio ? "Abrir ficha" : undefined}
        />
      ) : (
        <section className="grid gap-3">
          {clientes.map((c) => {
            const extra = lerExtra(c.extra);
            const resumo = resumoFicha(extra);
            return (
              <Link key={c.id} href={`/clientes/${c.id}`} className="link-card">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{c.nome}</p>
                    <p className="mt-1 text-sm text-[var(--mute)]">
                      {resumo ? `${resumo} · ` : ""}
                      {c.contato || extra.email || extra.telefone || "Sem contato"}
                      {` · ${c.projetos.length} projeto`}
                      {c.proximo ? ` · ${c.proximo}` : ""}
                    </p>
                    {c.tags.length ? (
                      <p className="mt-2 flex flex-wrap gap-1">
                        {c.tags.map((x) => (
                          <span key={x.tagId} className="chip gold">
                            {x.tag.nome}
                          </span>
                        ))}
                      </p>
                    ) : null}
                  </div>
                  <span className="chip">{STATUS_CLIENTE[c.status] ?? c.status}</span>
                </div>
              </Link>
            );
          })}
        </section>
      )}
    </Pagina>
  );
}
