"use client";

import { MessageSquare, Send, X } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";

import { carregarChat, enviarChat } from "@/app/actions";
import { Avatar } from "@/components/Avatar";
import { Relato } from "@/components/Relato";

type Pessoa = { id: string; nome: string; funcao: string; tipo: string };
type Msg = {
  id: string;
  autorId: string;
  papel: string;
  texto: string;
  autor: { nome: string };
};

export function ChatMesa({
  euId,
  pessoas,
}: {
  euId: string;
  pessoas: Pessoa[];
}) {
  const [aberto, setAberto] = useState(false);
  const [quem, setQuem] = useState<Pessoa | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [texto, setTexto] = useState("");
  const [erro, setErro] = useState("");
  const [pending, start] = useTransition();
  const fim = useRef<HTMLDivElement>(null);
  const socios = pessoas.filter((p) => p.tipo === "humano");
  const time = pessoas.filter((p) => p.tipo !== "humano");

  useEffect(() => {
    if (!aberto || !quem) {
      return;
    }
    const id = quem.id;
    let viva = true;
    async function puxar() {
      const c = await carregarChat(id);
      if (viva && c) {
        setMsgs(c.mensagens);
      }
    }
    void puxar();
    const t = setInterval(() => void puxar(), 4000);
    return () => {
      viva = false;
      clearInterval(t);
    };
  }, [aberto, quem]);

  useEffect(() => {
    fim.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs.length, aberto]);

  function mandar() {
    if (!quem || !texto.trim()) {
      return;
    }
    const envio = texto;
    setTexto("");
    start(async () => {
      setErro("");
      const r = await enviarChat(quem.id, envio);
      if (!r.ok) {
        setErro(r.erro);
      }
      if (r.conversa) {
        setMsgs(r.conversa.mensagens);
      }
    });
  }

  function lista(grupo: Pessoa[], label: string) {
    if (grupo.length === 0) {
      return null;
    }
    return (
      <div className="mb-4">
        <p className="px-2 pb-2 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[var(--gold)]">
          {label}
        </p>
        {grupo.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => {
              setQuem(p);
              setMsgs([]);
            }}
            className={`mb-1 flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left ${
              quem?.id === p.id ? "bg-[var(--panel-2)]" : "text-[var(--mute)]"
            }`}
          >
            <Avatar nome={p.nome} tipo={p.tipo} size={26} />
            <span className="min-w-0">
              <span className="block truncate text-xs font-medium text-[var(--ink)]">{p.nome}</span>
              <span className="block truncate text-[0.65rem]">{p.funcao}</span>
            </span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <>
      <button type="button" className="icon-btn" title="Chat" onClick={() => setAberto((v) => !v)}>
        <MessageSquare size={16} />
      </button>
      {aberto ? (
        <aside className="fixed bottom-5 left-3 z-40 flex h-[min(40rem,calc(100vh-4rem))] w-[min(42rem,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--panel)] shadow-[var(--shadow)] lg:left-[17.5rem]">
          <header className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4">
            <div>
              <p className="kicker">Mesa</p>
              <p className="mt-1 text-sm font-semibold">
                {quem ? `${quem.nome} · ${quem.funcao}` : "Sócios e Grok"}
              </p>
            </div>
            <button type="button" className="icon-btn" onClick={() => setAberto(false)}>
              <X size={14} />
            </button>
          </header>
          <div className="flex min-h-0 flex-1">
            <nav className="w-[11.5rem] shrink-0 overflow-y-auto border-r border-[var(--line)] p-3">
              {lista(socios, "Sócios")}
              {lista(time, "Grok")}
            </nav>
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-4">
                {!quem ? (
                  <p className="text-sm text-[var(--mute)]">
                    Ian, Maicon e o time Grok. Conversa não cria tarefa. Trabalho entra no pedido.
                  </p>
                ) : msgs.length === 0 ? (
                  <p className="text-sm text-[var(--mute)]">Primeira mensagem desta conversa.</p>
                ) : (
                  msgs.map((m) => (
                    <div key={m.id} className={`chat-bubble ${m.autorId === euId ? "me" : "bot"}`}>
                      {m.autorId !== euId ? (
                        <p className="mb-1 text-[0.65rem] opacity-70">{m.autor.nome}</p>
                      ) : null}
                      {m.papel === "ia" ? <Relato texto={m.texto} /> : m.texto}
                    </div>
                  ))
                )}
                {pending ? <p className="text-xs text-[var(--gold)]">Grok pensando…</p> : null}
                <div ref={fim} />
              </div>
              {erro ? <p className="px-4 text-xs text-[var(--danger)]">{erro}</p> : null}
              <form
                className="flex gap-2 border-t border-[var(--line)] p-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  mandar();
                }}
              >
                <input
                  className="field"
                  value={texto}
                  disabled={!quem || pending}
                  placeholder={quem ? `Falar com ${quem.nome}` : "Escolha alguém"}
                  onChange={(e) => setTexto(e.target.value)}
                />
                <button type="submit" className="btn px-3" disabled={!quem || pending}>
                  <Send size={16} />
                </button>
              </form>
            </div>
          </div>
        </aside>
      ) : null}
    </>
  );
}
