"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { buscarGlobal } from "@/app/actions";

function digitando(el: EventTarget | null) {
  if (!(el instanceof HTMLElement)) {
    return false;
  }
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
}

export function Paleta({
  euId,
  onNovo,
}: {
  euId: string;
  onNovo: (tipo: "cliente" | "tarefa" | "evento" | "projeto") => void;
}) {
  const [aberto, setAberto] = useState(false);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Awaited<ReturnType<typeof buscarGlobal>> | null>(null);
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (digitando(e.target) && !(e.metaKey || e.ctrlKey)) {
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setAberto((v) => !v);
        return;
      }
      if (e.key === "Escape") {
        setAberto(false);
        return;
      }
      if (digitando(e.target)) {
        return;
      }
      if (e.key === "c" || e.key === "C") {
        e.preventDefault();
        onNovo("cliente");
      }
      if (e.key === "t" || e.key === "T") {
        e.preventDefault();
        onNovo("tarefa");
      }
      if (e.key === "e" || e.key === "E") {
        e.preventDefault();
        onNovo("evento");
      }
      if (e.key === "m" || e.key === "M") {
        router.push("/agenda?vista=mes");
      }
      if (e.key === "w" || e.key === "W") {
        router.push("/agenda?vista=semana");
      }
      if (e.key === "d" || e.key === "D") {
        router.push("/agenda?vista=dia");
      }
      if (e.key === "a" || e.key === "A") {
        router.push("/agenda?vista=agenda");
      }
      if (e.key === "/") {
        e.preventDefault();
        setAberto(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onNovo, router]);

  useEffect(() => {
    if (aberto) {
      input.current?.focus();
    } else {
      setQ("");
      setHits(null);
    }
  }, [aberto]);

  useEffect(() => {
    if (!aberto || q.trim().length < 1) {
      return;
    }
    const t = window.setTimeout(() => {
      void buscarGlobal(q).then(setHits);
    }, 160);
    return () => window.clearTimeout(t);
  }, [q, aberto]);

  const cmds = useMemo(
    () => [
      ["Novo cliente", () => onNovo("cliente")],
      ["Nova tarefa", () => onNovo("tarefa")],
      ["Novo projeto", () => onNovo("projeto")],
      ["Novo evento", () => onNovo("evento")],
      ["Hoje", () => router.push("/hoje")],
      ["Tarefas", () => router.push("/tarefas")],
      ["News", () => router.push("/news")],
      ["Calendário", () => router.push("/agenda")],
      ["Pipeline", () => router.push("/pipeline")],
      ["Clientes", () => router.push("/clientes")],
      ["Ponte", () => router.push("/ponte")],
    ],
    [onNovo, router],
  );

  if (!aberto) {
    return null;
  }

  return (
    <div className="drawer-bg" onClick={() => setAberto(false)}>
      <div className="paleta panel p-4" onClick={(e) => e.stopPropagation()}>
        <input
          ref={input}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar ou mandar… Ctrl+K"
          className="field"
        />
        <div className="mt-3 grid gap-1">
          {cmds
            .filter((c) => String(c[0]).toLowerCase().includes(q.toLowerCase()) || !q)
            .map(([label, go]) => (
              <button
                key={String(label)}
                type="button"
                className="paleta-item"
                onClick={() => {
                  setAberto(false);
                  (go as () => void)();
                }}
              >
                {String(label)}
              </button>
            ))}
        </div>
        {hits ? (
          <div className="mt-4 grid gap-3 text-sm">
            {hits.clientes.map((c) => (
              <button key={c.id} type="button" className="paleta-item" onClick={() => router.push(`/clientes/${c.id}`)}>
                Cliente · {c.nome}
              </button>
            ))}
            {hits.projetos.map((p) => (
              <button key={p.id} type="button" className="paleta-item" onClick={() => router.push(`/projetos/${p.id}`)}>
                Projeto · {p.nome}
              </button>
            ))}
            {hits.tarefas.map((t) => (
              <button key={t.id} type="button" className="paleta-item" onClick={() => router.push(`/tarefas/${t.id}`)}>
                Tarefa · {t.titulo}
              </button>
            ))}
            {hits.eventos.map((e) => (
              <button key={e.id} type="button" className="paleta-item" onClick={() => router.push(`/agenda?e=${e.id}`)}>
                Evento · {e.titulo}
              </button>
            ))}
            {hits.news?.map((n) => (
              <button key={n.id} type="button" className="paleta-item" onClick={() => router.push("/news")}>
                News · {n.titulo}
              </button>
            ))}
          </div>
        ) : null}
        <p className="mt-3 hidden text-[0.65rem] text-[var(--mute)]" data-eu={euId}>
          C cliente · T tarefa · E evento
        </p>
      </div>
    </div>
  );
}
