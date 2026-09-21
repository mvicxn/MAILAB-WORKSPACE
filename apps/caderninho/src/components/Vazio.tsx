import Link from "next/link";
import type { ReactNode } from "react";

export function Vazio({
  titulo,
  texto,
  href,
  acao,
  extra,
}: {
  titulo: string;
  texto: string;
  href?: string;
  acao?: string;
  extra?: ReactNode;
}) {
  return (
    <div className="vazio">
      <p className="display text-3xl">{titulo}</p>
      <p className="mt-2 max-w-md text-[var(--mute)]">{texto}</p>
      {href && acao ? (
        <Link href={href} className="btn mt-6 w-fit">
          {acao}
        </Link>
      ) : null}
      {extra}
    </div>
  );
}
