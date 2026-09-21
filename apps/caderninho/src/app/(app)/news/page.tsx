import Link from "next/link";
import { after } from "next/server";

import { Pagina } from "@/components/Pagina";
import { Relato } from "@/components/Relato";
import { Vazio } from "@/components/Vazio";
import { usuarioAtual } from "@/lib/auth";
import { formatarQuandoCheio } from "@/lib/datas";
import { ehHumano } from "@/lib/equipe";
import { sincronizarGitNews } from "@/lib/git-news";
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
  const git = await sincronizarGitNews();
  const brutos = await listarNews(prateleira);
  const itens = brutos.map((n) => jsonNews(n, user?.id));

  if (user && ehHumano(user.papel, user.tipo)) {
    after(() => {
      void marcarNewsDaMesa(user.id);
    });
  }

  return (
    <Pagina
      kicker="Alinhamento"
      titulo="News"
      texto="Commits desta casa e o que o Carlos viu no mundo. Sem X. Lista vazia é honesta."
    >
      <nav className="tabs">
        {FILTROS.map(([id, label]) => {
          const on = (prateleira ?? "") === id;
          return (
            <Link key={label} href={id ? `/news?p=${id}` : "/news"} className={`tab ${on ? "on" : ""}`}>
              {label}
            </Link>
          );
        })}
      </nav>

      {git.erro ? <p className="text-sm text-[var(--mute)]">{git.erro}</p> : null}

      {itens.length === 0 ? (
        <Vazio
          titulo="Ainda sem news."
          texto={
            prateleira === "git"
              ? "Quando houver commit nesta pasta, cai aqui. Se a pasta não for Git, avisa em cima."
              : "Quando o Carlos postar o mundo, cai nesta prateleira."
          }
        />
      ) : (
        <div className="grid gap-4">
          {itens.map((n) => {
            const miolo = (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="chip gold">{rotuloPrateleira(n.prateleira)}</span>
                  {n.novo ? <span className="chip">Novo</span> : null}
                  <span className="text-xs text-[var(--mute)]">{formatarQuandoCheio(new Date(n.createdAt))}</span>
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
                className="panel block p-7 no-underline text-inherit"
              >
                {miolo}
              </a>
            ) : (
              <article key={n.id} className="panel p-7">
                {miolo}
              </article>
            );
          })}
        </div>
      )}
    </Pagina>
  );
}
