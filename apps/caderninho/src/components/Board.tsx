import type { ReactNode } from "react";

export function Board({
  colunas,
  tres,
}: {
  colunas: { id: string; label: string; count: number; children: ReactNode; vazio?: string }[];
  tres?: boolean;
}) {
  return (
    <section className={`board ${tres ? "tres" : ""}`}>
      {colunas.map((c) => (
        <div key={c.id} className="coluna-board panel">
          <div className="col-head">
            <h2 className="display text-2xl">{c.label}</h2>
            <span className="text-sm text-[var(--mute)]">{c.count}</span>
          </div>
          <div className="coluna-lista">
            {c.count === 0 ? <p className="text-sm text-[var(--mute)]">{c.vazio ?? "Vazio."}</p> : c.children}
          </div>
        </div>
      ))}
    </section>
  );
}
