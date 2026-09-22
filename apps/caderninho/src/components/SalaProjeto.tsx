"use client";

import Link from "next/link";

import { Sala } from "@/components/Sala";
import { formatarPrazo, LABEL_COMERCIAL } from "@/lib/datas";

export function SalaProjeto({
  id,
  nome,
  cliente,
  comercial,
  valor,
  prazo,
  proximo,
}: {
  id: string;
  nome: string;
  cliente: string;
  comercial: string;
  valor: string;
  prazo: Date | null;
  proximo: string;
}) {
  return (
    <header className="grid gap-6">
      <div>
        <p className="kicker">
          <Link href="/projetos" className="text-[var(--gold)]">
            Projetos
          </Link>
          {` · ${cliente}`}
        </p>
        <h1 className="display mt-3 text-4xl sm:text-5xl">{nome}</h1>
        {proximo.trim() ? (
          <p className="mt-3 max-w-2xl text-[var(--mute)]">
            <span className="text-[var(--gold)]">Próximo. </span>
            {proximo}
          </p>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="chip gold">{LABEL_COMERCIAL[comercial] ?? comercial}</span>
          {valor.trim() ? <span className="chip">{valor}</span> : null}
          {prazo ? <span className="chip">{formatarPrazo(prazo)}</span> : null}
        </div>
      </div>
      <Sala
        base={`/projetos/${id}`}
        itens={[
          ["Mesa", ""],
          ["Quadro", "/quadro"],
          ["Arquivos", "/arquivos"],
          ["Comercial", "/comercial"],
        ]}
      />
    </header>
  );
}
