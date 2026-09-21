"use client";

import { useEffect, useState } from "react";

import { carregarDiario } from "@/app/actions";
import { Avatar } from "@/components/Avatar";
import { Relato } from "@/components/Relato";

type Item = {
  id: string;
  texto: string;
  createdAt: string;
  autor: { nome: string; tipo: string };
};

export function DiarioVivo({
  tarefaId,
  inicial,
  vivo = false,
}: {
  tarefaId: string;
  inicial: { id: string; texto: string; createdAt: string; autor: { nome: string; tipo: string } }[];
  vivo?: boolean;
}) {
  const [itens, setItens] = useState<Item[]>(inicial);

  useEffect(() => {
    if (!vivo) {
      return;
    }
    const t = window.setInterval(async () => {
      const r = await carregarDiario(tarefaId);
      if (r) {
        setItens(r.map((i) => ({ ...i, createdAt: new Date(i.createdAt).toISOString() })));
      }
    }, 5000);
    return () => window.clearInterval(t);
  }, [tarefaId, vivo]);

  if (itens.length === 0) {
    return <p className="text-sm text-[var(--mute)]">Ainda sem registro. O Grok escreve aqui.</p>;
  }

  return (
    <div className="grid gap-3">
      {vivo ? <p className="flex items-center gap-2 text-xs text-[var(--gold)]"><span className="live" /> Esperando entrega</p> : null}
      {itens.map((item) => (
        <article key={item.id} className="panel p-6">
          <p className="flex items-center gap-2 text-sm text-[var(--mute)]">
            <Avatar nome={item.autor.nome} tipo={item.autor.tipo} size={22} />
            {item.autor.nome} · {new Date(item.createdAt).toLocaleString("pt-BR")}
          </p>
          <div className="mt-4">
            <Relato texto={item.texto} />
          </div>
        </article>
      ))}
    </div>
  );
}
