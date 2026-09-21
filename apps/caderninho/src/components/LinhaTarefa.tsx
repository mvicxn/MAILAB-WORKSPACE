import Link from "next/link";

import { Avatar } from "@/components/Avatar";
import { atrasada, formatarPrazo, STATUS_TAREFA, statusCanon } from "@/lib/datas";

type T = {
  id: string;
  titulo: string;
  status: string;
  prazo: Date | null;
  acionadoAt?: Date | null;
  assignee: { nome: string; tipo?: string };
  projeto?: { nome: string } | null;
};

export function LinhaTarefa({ t, latePulse = false }: { t: T; latePulse?: boolean }) {
  const late = atrasada(t.status, t.prazo);
  return (
    <Link href={`/tarefas/${t.id}`} className={`link-card ${late && latePulse ? "pulse-late" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium leading-snug">{t.titulo}</p>
          <p className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-[var(--mute)]">
            <Avatar nome={t.assignee.nome} tipo={t.assignee.tipo} size={22} />
            {t.assignee.nome}
            {t.projeto ? ` · ${t.projeto.nome}` : ""}
            {` · ${formatarPrazo(t.prazo)}`}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className={`chip ${late ? "late" : ""}`}>{late ? "Atraso" : STATUS_TAREFA[statusCanon(t.status)]}</span>
          {t.acionadoAt ? <span className="chip gold">Grok em campo</span> : null}
        </div>
      </div>
    </Link>
  );
}
