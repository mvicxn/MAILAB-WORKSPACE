"use client";

import { useEffect, useState } from "react";

type Item = { id: number; texto: string; tipo: "ok" | "erro" };

export function toast(texto: string, tipo: "ok" | "erro" = "ok") {
  window.dispatchEvent(new CustomEvent("mai-toast", { detail: { texto, tipo } }));
}

export function Toaster() {
  const [itens, setItens] = useState<Item[]>([]);
  useEffect(() => {
    function on(e: Event) {
      const d = (e as CustomEvent).detail as { texto: string; tipo?: "ok" | "erro" };
      const id = Date.now() + Math.random();
      setItens((x) => [...x, { id, texto: d.texto, tipo: d.tipo === "erro" ? "erro" : "ok" }]);
      window.setTimeout(() => setItens((x) => x.filter((i) => i.id !== id)), 3400);
    }
    window.addEventListener("mai-toast", on);
    return () => window.removeEventListener("mai-toast", on);
  }, []);
  if (itens.length === 0) {
    return null;
  }
  return (
    <div className="toasts" role="status">
      {itens.map((i) => (
        <p key={i.id} className={`toast ${i.tipo}`}>
          {i.texto}
        </p>
      ))}
    </div>
  );
}
