"use client";

import { useMemo, useState } from "react";

import { criarTarefa } from "@/app/actions";
import { formAction } from "@/lib/form-action";
import { Avatar } from "@/components/Avatar";

type Pessoa = { id: string; nome: string; funcao: string; tipo: string };
type Nomeado = { id: string; nome: string };

export function PedidoBar({
  users,
  projetos = [],
  projetoId,
  clienteId,
  euId,
  voltar = "/hoje",
}: {
  users: Pessoa[];
  projetos?: Nomeado[];
  projetoId?: string;
  clienteId?: string;
  euId?: string;
  voltar?: string;
}) {
  const gente = useMemo(
    () =>
      [...users].sort((a, b) => {
        if (a.tipo === b.tipo) {
          return a.nome.localeCompare(b.nome, "pt");
        }
        return a.tipo === "humano" ? -1 : 1;
      }),
    [users],
  );
  const interno = projetos.find((p) => p.nome === "MAI interno");
  const [aberto, setAberto] = useState(false);
  const [quem, setQuem] = useState(euId ?? gente[0]?.id ?? "");
  const dono = gente.find((u) => u.id === quem);

  return (
    <form action={formAction(criarTarefa)} className="panel overflow-hidden">
      {projetoId ? <input type="hidden" name="projetoId" value={projetoId} /> : null}
      {clienteId ? <input type="hidden" name="clienteId" value={clienteId} /> : null}
      <input type="hidden" name="voltar" value={voltar} />
      <input type="hidden" name="assigneeId" value={quem} />
      <input
        name="titulo"
        required
        className="pedido-titulo field"
        placeholder="Pedir ao estúdio…"
        onFocus={() => setAberto(true)}
      />
      {aberto ? (
        <div className="grid gap-4 border-t border-[var(--line)] p-5">
          <div className="flex flex-wrap gap-1.5">
            {gente.map((u) => (
              <button
                key={u.id}
                type="button"
                className={`pessoa ${quem === u.id ? "on" : ""}`}
                onClick={() => setQuem(u.id)}
              >
                <Avatar nome={u.nome} tipo={u.tipo} size={22} />
                {u.nome}
              </button>
            ))}
          </div>
          <div className={`grid gap-3 ${projetoId ? "sm:grid-cols-1" : "sm:grid-cols-2"}`}>
            <label className="grid gap-1.5 text-xs tracking-wide text-[var(--mute)]">
              Prazo
              <input name="prazo" type="date" className="field" />
            </label>
            {!projetoId ? (
              <label className="grid gap-1.5 text-xs tracking-wide text-[var(--mute)]">
                Projeto
                <select name="projetoId" className="field" defaultValue={interno?.id ?? ""}>
                  {projetos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
          </div>
          <textarea name="descricao" rows={2} className="field" placeholder="Contexto, se precisar" />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-[var(--mute)]">
              {dono?.tipo === "ia"
                ? `${dono.nome} é Grok. Entra em campo e devolve no diário.`
                : "Um dono. Uma entrega."}
            </p>
            <button type="submit" className="btn">
              Pôr na mesa
            </button>
          </div>
        </div>
      ) : null}
    </form>
  );
}
