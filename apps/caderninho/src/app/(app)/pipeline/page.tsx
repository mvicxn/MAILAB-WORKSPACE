import Link from "next/link";

import { mudarComercial } from "@/app/actions";
import { Board } from "@/components/Board";
import { Pagina } from "@/components/Pagina";
import { formAction } from "@/lib/form-action";
import { COMERCIAL, LABEL_COMERCIAL, formatarPrazo } from "@/lib/datas";
import { prisma } from "@/lib/prisma";

export default async function PipelinePage() {
  const projetos = await prisma.projeto.findMany({
    where: { deletedAt: null },
    include: { cliente: true },
    orderBy: { updatedAt: "desc" },
  });
  const por = Object.fromEntries(
    COMERCIAL.map((c) => [c.id, projetos.filter((p) => p.comercial === c.id)]),
  ) as Record<string, typeof projetos>;

  return (
    <Pagina
      kicker="Comercial"
      titulo="Pipeline"
      texto="Onde o dinheiro está. Quatro colunas. O miolo de cada projeto abre na mesa dele."
      acao={
        <Link href="/projetos/novo" className="btn">
          Abrir projeto
        </Link>
      }
      largo
    >
      <Board
        colunas={COMERCIAL.map((c) => ({
          id: c.id,
          label: c.label,
          count: por[c.id].length,
          vazio: "Vazio.",
          children: por[c.id].map((p) => (
            <article key={p.id} className="cartao">
              <Link href={`/projetos/${p.id}`} className="block">
                <p className="font-medium">{p.nome}</p>
                <p className="mt-1 text-xs text-[var(--mute)]">
                  {p.cliente?.nome ?? "Interno"}
                  {(p.valor ?? "").trim() ? ` · ${p.valor}` : ""}
                  {p.prazo ? ` · ${formatarPrazo(p.prazo)}` : ""}
                </p>
              </Link>
              <form action={formAction(mudarComercial)} className="mt-3 flex flex-wrap gap-1">
                <input type="hidden" name="id" value={p.id} />
                {COMERCIAL.filter((x) => x.id !== p.comercial).map((x) => (
                  <button key={x.id} name="comercial" value={x.id} className="pill">
                    {LABEL_COMERCIAL[x.id]}
                  </button>
                ))}
              </form>
            </article>
          )),
        }))}
      />
    </Pagina>
  );
}
