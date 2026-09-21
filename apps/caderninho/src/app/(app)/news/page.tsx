import Link from "next/link";
import { after } from "next/server";

import { Relato } from "@/components/Relato";
import { Reveal } from "@/components/Reveal";
import { usuarioAtual } from "@/lib/auth";
import { haQuanto } from "@/lib/datas";
import { ehHumano } from "@/lib/equipe";
import { jsonNews, listarNews, marcarNewsDaMesa, prateleiraCanon, rotuloPrateleira } from "@/lib/news";
import { prisma } from "@/lib/prisma";

const FILTROS = [
  ["", "Todas"],
  ["git", "Nosso Git"],
  ["mundo", "Mundo"],
] as const;

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ p?: string }>;
}) {
  const user = await usuarioAtual(prisma);
  const { p } = await searchParams;
  const prateleira = prateleiraCanon(p ?? "");
  const brutos = await listarNews(prateleira);
  const itens = brutos.map((n) => jsonNews(n, user?.id));

  if (user && ehHumano(user.papel, user.tipo)) {
    after(() => {
      void marcarNewsDaMesa(user.id);
    });
  }

  return (
    <main className="mx-auto grid max-w-3xl gap-8">
      <Reveal>
        <p className="kicker">Alinhamento</p>
        <h1 className="display mt-3 text-5xl sm:text-6xl">News</h1>
        <p className="mt-4 max-w-xl text-[var(--mute)]">
          O que o Carlos viu no Git e no mundo. Sem X. Lista vazia é honesta.
        </p>
      </Reveal>

      <nav className="flex flex-wrap gap-2">
        {FILTROS.map(([id, label]) => {
          const on = (prateleira ?? "") === id;
          return (
            <Link key={label} href={id ? `/news?p=${id}` : "/news"} className={`chip ${on ? "gold" : ""}`}>
              {label}
            </Link>
          );
        })}
      </nav>

      {itens.length === 0 ? (
        <p className="text-[var(--mute)]">Ainda não tem news nesta prateleira.</p>
      ) : (
        <div className="grid gap-3">
          {itens.map((n) => {
            const miolo = (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="chip gold">{rotuloPrateleira(n.prateleira)}</span>
                  {n.novo ? <span className="chip">Novo</span> : null}
                  <span className="text-xs text-[var(--mute)]">{haQuanto(new Date(n.createdAt))}</span>
                  {n.fonte ? <span className="text-xs text-[var(--mute)]">{n.fonte}</span> : null}
                </div>
                <h2 className="display mt-3 text-2xl">{n.titulo}</h2>
                <div className="mt-3 text-sm leading-relaxed text-[var(--mute)]">
                  <Relato texto={n.corpo} />
                </div>
                {n.lidoPor.length ? (
                  <p className="mt-3 text-xs text-[var(--mute)]">Lido: {n.lidoPor.join(", ")}</p>
                ) : null}
              </>
            );
            return n.link ? (
              <a
                key={n.id}
                href={n.link}
                target="_blank"
                rel="noreferrer"
                className="panel block p-5 no-underline text-inherit"
              >
                {miolo}
              </a>
            ) : (
              <article key={n.id} className="panel p-5">
                {miolo}
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
