import type { ReactNode } from "react";

export function Pagina({
  kicker,
  titulo,
  texto,
  acao,
  children,
  largo,
}: {
  kicker: string;
  titulo: string;
  texto?: string;
  acao?: ReactNode;
  children: ReactNode;
  largo?: boolean;
}) {
  return (
    <main className={`grid gap-8 ${largo ? "" : "mx-auto w-full max-w-5xl"}`}>
      <header className="pagina-topo">
        <div className="min-w-0">
          <p className="kicker">{kicker}</p>
          <h1 className="display mt-3 text-4xl leading-[0.95] sm:text-5xl">{titulo}</h1>
          {texto ? <p className="mt-3 max-w-xl leading-relaxed text-[var(--mute)]">{texto}</p> : null}
        </div>
        {acao ? <div className="pagina-acao">{acao}</div> : null}
      </header>
      {children}
    </main>
  );
}
