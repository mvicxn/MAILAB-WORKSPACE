import Link from "next/link";

import { mudarStatusTarefa } from "@/app/actions";
import { formAction } from "@/lib/form-action";
import { Avatar } from "@/components/Avatar";
import { atrasada, COLUNAS, formatarPrazo, statusCanon } from "@/lib/datas";

type T = {
  id: string;
  titulo: string;
  status: string;
  prazo: Date | null;
  acionadoAt?: Date | null;
  assignee: { nome: string; tipo?: string };
  projeto?: { nome: string } | null;
};

export function CartaoTarefa({ t, mover = true }: { t: T; mover?: boolean }) {
  const col = statusCanon(t.status);
  const late = atrasada(t.status, t.prazo);
  return (
    <article className={`cartao ${late ? "pulse-late" : ""}`}>
      <Link href={`/tarefas/${t.id}`} className="block">
        <p className="font-medium leading-snug">{t.titulo}</p>
        <p className="mt-2 flex items-center gap-2 text-xs text-[var(--mute)]">
          <Avatar nome={t.assignee.nome} tipo={t.assignee.tipo} size={20} />
          <span>
            {t.assignee.nome}
            {` · ${formatarPrazo(t.prazo)}`}
            {late ? " · atraso" : ""}
          </span>
        </p>
        {t.acionadoAt ? <p className="mt-2"><span className="chip gold">Grok em campo</span></p> : null}
      </Link>
      {mover ? (
        <form action={formAction(mudarStatusTarefa)} className="mt-3 flex flex-wrap gap-1">
          <input type="hidden" name="id" value={t.id} />
          {COLUNAS.filter((c) => c.id !== col).map((c) => (
            <button key={c.id} name="status" value={c.id} className="pill">
              {c.label}
            </button>
          ))}
        </form>
      ) : null}
    </article>
  );
}
