"use client";

import { useState, useTransition } from "react";

import { toast } from "@/components/Toast";

export function Excluir({
  pergunta,
  impacto,
  action,
  id,
  label = "Excluir",
}: {
  pergunta: string;
  impacto?: string;
  action: (data: FormData) => Promise<{ erro?: string } | void>;
  id: string;
  label?: string;
}) {
  const [aberto, setAberto] = useState(false);
  const [pending, start] = useTransition();
  return (
    <>
      <button type="button" className="btn-ghost text-sm text-[var(--danger)]" onClick={() => setAberto(true)}>
        {label}
      </button>
      {aberto ? (
        <div className="drawer-bg" onClick={() => setAberto(false)}>
          <div className="drawer panel p-5" onClick={(e) => e.stopPropagation()}>
            <p className="display text-2xl">{pergunta}</p>
            {impacto ? <p className="mt-3 text-sm text-[var(--mute)]">{impacto}</p> : null}
            <p className="mt-2 text-sm text-[var(--mute)]">Vai para a lixeira da casa. Dá para restaurar se precisar.</p>
            <div className="mt-5 flex gap-2">
              <form
                action={(fd) => {
                  fd.set("id", id);
                  start(async () => {
                    const r = await action(fd);
                    if (r && "erro" in r && r.erro) {
                      toast(r.erro, "erro");
                      return;
                    }
                    toast("Excluído.");
                    setAberto(false);
                  });
                }}
              >
                <button type="submit" className="btn" disabled={pending}>
                  {pending ? "Excluindo…" : "Excluir"}
                </button>
              </form>
              <button type="button" className="btn-ghost" onClick={() => setAberto(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
