import Link from "next/link";

import { criarProjeto } from "@/app/actions";
import { Reveal } from "@/components/Reveal";
import { prisma } from "@/lib/prisma";
import { COMERCIAL, LABEL_COMERCIAL, concluida, formatarPrazo } from "@/lib/datas";

export default async function ProjetosPage() {
  const projetos = await prisma.projeto.findMany({
    include: { cliente: true, tarefas: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <main className="mx-auto grid max-w-6xl gap-10">
      <Reveal>
        <p className="kicker">Dinheiro</p>
        <h1 className="display mt-3 text-5xl sm:text-6xl">Projetos</h1>
        <p className="mt-4 max-w-xl text-[var(--mute)]">
          Cada mesa tem valor, prazo, quadro e o Grok. Abre, pede, cobra a entrega.
        </p>
      </Reveal>

      <form action={criarProjeto} className="panel grid gap-4 p-6">
        <p className="kicker">Abrir</p>
        <input name="nome" required placeholder="Nome do projeto" className="field" />
        <div className="grid gap-3 sm:grid-cols-3">
          <input name="cliente" placeholder="Cliente (vazio = interno)" className="field" />
          <input name="valor" placeholder="Valor combinado" className="field" />
          <input name="prazo" type="date" className="field" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <select name="comercial" className="field" defaultValue="interno">
            {COMERCIAL.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
          <input name="proximo" placeholder="Próximo passo que move o dinheiro" className="field" />
        </div>
        <input name="tags" placeholder="Tags, separadas por vírgula" className="field" />
        <textarea name="descricao" rows={2} placeholder="O que vamos entregar, em uma linha" className="field" />
        <button type="submit" className="btn w-fit">
          Abrir projeto
        </button>
      </form>

      <section className="grid gap-4 sm:grid-cols-2">
        {projetos.length === 0 ? (
          <p className="text-[var(--mute)]">Nenhum projeto. Abra o primeiro acima.</p>
        ) : (
          projetos.map((p) => {
            const abertas = p.tarefas.filter((t) => !concluida(t.status)).length;
            const grok = p.tarefas.filter((t) => t.acionadoAt && !concluida(t.status)).length;
            return (
              <Link key={p.id} href={`/projetos/${p.id}`} className="link-card flex min-h-[11rem] flex-col">
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
          })
        )}
      </section>
    </main>
  );
}
