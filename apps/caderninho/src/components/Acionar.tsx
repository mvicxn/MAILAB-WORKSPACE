"use client";

import { useState } from "react";

import { acordarFuncionario, acordarNaTarefa } from "@/app/actions";

export function Acionar({
  nome,
  tarefaId,
  userId,
  grande = false,
}: {
  nome: string;
  tarefaId?: string;
  userId?: string;
  grande?: boolean;
}) {
  const [msg, setMsg] = useState("");
  const [pendente, setPendente] = useState(false);

  return (
    <form
      className={grande ? "panel grid gap-3 p-6" : "grid gap-2"}
      action={async (data) => {
        setPendente(true);
        setMsg("Acionando o Grok…");
        const r = tarefaId ? await acordarNaTarefa(data) : await acordarFuncionario(data);
        setPendente(false);
        setMsg(r.ok ? `${nome} em campo. A entrega entra no diário.` : r.erro);
      }}
    >
      {tarefaId ? <input type="hidden" name="tarefaId" value={tarefaId} /> : null}
      {userId ? <input type="hidden" name="userId" value={userId} /> : null}
      {grande ? (
        <>
          <p className="kicker">Grok Bot</p>
          <h2 className="display text-2xl">Pôr {nome} para trabalhar</h2>
          <p className="text-sm text-[var(--mute)]">
            O Bot recebe o briefing desta ficha: projeto, valor, prazo, notas e o que já foi entregue.
            Ele devolve no diário. Código passa pelo Cursor desta casa.
          </p>
        </>
      ) : null}
      <button type="submit" className={grande ? "btn w-fit" : "btn-ghost text-sm"} disabled={pendente}>
        {pendente ? "Acionando…" : `Acionar ${nome}`}
      </button>
      {msg ? <p className="text-sm text-[var(--mute)]">{msg}</p> : null}
    </form>
  );
}
