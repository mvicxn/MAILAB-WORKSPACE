"use client";

import { useState } from "react";

import { acordarNaTarefa } from "@/app/actions";

export function AcordarTarefa({ tarefaId, nome }: { tarefaId: string; nome: string }) {
  const [msg, setMsg] = useState("");

  return (
    <details className="panel p-5">
      <summary className="cursor-pointer text-sm text-[var(--mute)]">Despacho interno</summary>
      <form
        className="mt-3"
        action={async (formData) => {
          setMsg("Enviado.");
          const r = await acordarNaTarefa(formData);
          setMsg(r.ok ? `${nome} notificado fora da ficha pública.` : r.erro);
        }}
      >
        <input type="hidden" name="tarefaId" value={tarefaId} />
        <button type="submit" className="btn-ghost text-xs">
          Notificar {nome}
        </button>
        {msg ? <p className="mt-2 text-sm text-[var(--mute)]">{msg}</p> : null}
      </form>
    </details>
  );
}
