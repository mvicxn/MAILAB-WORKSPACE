import Link from "next/link";

import { mudarComercial } from "@/app/actions";
import { COMERCIAL, LABEL_COMERCIAL, formatarPrazo } from "@/lib/datas";
import { prisma } from "@/lib/prisma";

export default async function PipelinePage() {
  const projetos = await prisma.projeto.findMany({
    include: { cliente: true, tags: { include: { tag: true } } },
    orderBy: { updatedAt: "desc" },
  });
  const por = Object.fromEntries(
    COMERCIAL.map((c) => [c.id, projetos.filter((p) => p.comercial === c.id)]),
  ) as Record<string, typeof projetos>;

  return (
    <main className="grid gap-6">
      <div>
        <p className="kicker">Comercial</p>
        <h1 className="display mt-2 text-5xl">Pipeline</h1>
        <p className="mt-3 max-w-xl text-[var(--mute)]">
          Onde o dinheiro está. Conversa, proposta, fechado. Interno é casa.
        </p>
      </div>
      <section className="grid gap-4 lg:grid-cols-4">
        {COMERCIAL.map((c) => (
          <div key={c.id} className="panel p-4">
            <div className="col-head">
              <h2 className="display text-2xl">{c.label}</h2>
              <span className="text-sm text-[var(--mute)]">{por[c.id].length}</span>
            </div>
            <div className="grid gap-2">
              {por[c.id].length === 0 ? (
                <p className="text-sm text-[var(--mute)]">Vazio.</p>
              ) : (
                por[c.id].map((p) => (
                  <article key={p.id} className="cartao">
                    <Link href={`/projetos/${p.id}`} className="block">
                      <p className="font-medium">{p.nome}</p>
                      <p className="mt-1 text-xs text-[var(--mute)]">
                        {p.cliente?.nome ?? "Interno"}
                        {(p.valor ?? "").trim() ? ` · ${p.valor}` : ""}
                        {p.prazo ? ` · ${formatarPrazo(p.prazo)}` : ""}
                      </p>
                    </Link>
                    <form action={mudarComercial} className="mt-3 flex flex-wrap gap-1">
                      <input type="hidden" name="id" value={p.id} />
                      {COMERCIAL.filter((x) => x.id !== p.comercial).map((x) => (
                        <button key={x.id} name="comercial" value={x.id} className="pill">
                          {LABEL_COMERCIAL[x.id]}
                        </button>
                      ))}
                    </form>
                  </article>
                ))
              )}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
