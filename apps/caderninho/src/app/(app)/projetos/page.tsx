import Link from "next/link";

import { Pagina } from "@/components/Pagina";
import { Vazio } from "@/components/Vazio";
import { LABEL_COMERCIAL, concluida, formatarPrazo } from "@/lib/datas";
import { prisma } from "@/lib/prisma";

export default async function ProjetosPage() {
  const projetos = await prisma.projeto.findMany({
    where: { deletedAt: null },
    include: { cliente: true, tarefas: { where: { deletedAt: null } } },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <Pagina
      kicker="Casa"
      titulo="Projetos"
      texto="Cada mesa é um recinto. Quadro, arquivo e comercial ficam em páginas próprias."
      acao={
        <Link href="/projetos/novo" className="btn">
          Abrir projeto
        </Link>
      }
      largo
    >
      {projetos.length === 0 ? (
        <Vazio
          titulo="Nenhuma mesa aberta."
          texto="Abra o primeiro projeto. Interno da casa ou conversa com gente de verdade."
          href="/projetos/novo"
          acao="Abrir projeto"
        />
      ) : (
        <section className="grid gap-4 sm:grid-cols-2">
          {projetos.map((p) => {
            const abertas = p.tarefas.filter((t) => !concluida(t.status)).length;
            const grok = p.tarefas.filter((t) => t.acionadoAt && !concluida(t.status)).length;
            return (
              <Link key={p.id} href={`/projetos/${p.id}`} className="link-card flex min-h-[12rem] flex-col">
                <p className="kicker">{p.cliente?.nome ?? "Interno"}</p>
                <p className="display mt-3 text-3xl">{p.nome}</p>
                {(p.valor ?? "").trim() ? <p className="mt-3 text-lg">{p.valor}</p> : null}
                <p className="mt-auto pt-6 text-sm text-[var(--mute)]">
                  {p.prazo ? `${formatarPrazo(p.prazo)} · ` : ""}
                  {abertas} em aberto
                  {(p.proximo ?? "").trim() ? ` · ${p.proximo}` : ""}
                </p>
                <div className="mt-3 flex gap-2">
                  <span className="chip gold">{LABEL_COMERCIAL[p.comercial] ?? p.comercial}</span>
                  {grok ? <span className="chip">Grok em campo</span> : null}
                </div>
              </Link>
            );
          })}
        </section>
      )}
    </Pagina>
  );
}
