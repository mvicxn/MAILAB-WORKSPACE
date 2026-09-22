"use client";

import { useState } from "react";

import { acordarPlantao, salvarRotinaMailab } from "@/app/actions";

export function Contratar({ mailabLigada }: { mailabLigada: boolean }) {
  const [plantao, setPlantao] = useState("");
  const [rotina, setRotina] = useState("");

  return (
    <section className="grid gap-6">
      <div className="panel grid gap-4 p-7">
        <p className="kicker">Pendência</p>
        <h2 className="display text-2xl">Ligação do Carlos</h2>
        <p className="text-sm leading-relaxed text-[var(--mute)]">
          O Carlos só acorda neste computador se a rotina MAI LAB estiver colada aqui. São dois dados
          que ele devolve quando a rotina é criada: o endereço e a chave. Não é a rotina do Discord.
        </p>
        <p className="flex items-center gap-2 text-sm">
          <span className={`live ${mailabLigada ? "" : "off"}`} />
          {mailabLigada ? "Ligada neste computador." : "Ainda falta ligar neste PC."}
        </p>
        <form
          className="grid gap-3"
          action={async (data) => {
            setRotina("Guardando…");
            const r = await salvarRotinaMailab(data);
            setRotina(r.ok ? "Ligação gravada neste PC." : r.erro);
          }}
        >
          <label className="grid gap-1.5 text-sm">
            Endereço da rotina
            <input name="url" type="url" required className="field" autoComplete="off" placeholder="https://…" />
          </label>
          <label className="grid gap-1.5 text-sm">
            Chave
            <input name="key" type="password" required className="field" autoComplete="off" />
          </label>
          <button type="submit" className="btn w-fit">
            Guardar ligação
          </button>
        </form>
        {rotina ? <p className="text-sm text-[var(--mute)]">{rotina}</p> : null}
      </div>

      <form
        className="panel grid gap-3 p-7"
        action={async () => {
          setPlantao("Acionando o Carlos…");
          const r = await acordarPlantao();
          if (!r.ok) {
            setPlantao(r.erro);
            return;
          }
          const aviso = r.resultados[0];
          setPlantao(
            aviso?.ok
              ? "Carlos avisado. Ele abre Hoje e trabalha o que está no nome dele."
              : (aviso?.erro ?? "Não acordou."),
          );
        }}
      >
        <h2 className="display text-2xl">Acordar agora</h2>
        <p className="text-sm text-[var(--mute)]">
          Manda o Carlos abrir o escritório e pegar o que já está no nome dele. Só funciona com a
          ligação acima.
        </p>
        <button type="submit" className="btn w-fit">
          Acionar o Carlos
        </button>
        {plantao ? <p className="text-sm text-[var(--mute)]">{plantao}</p> : null}
      </form>
    </section>
  );
}
