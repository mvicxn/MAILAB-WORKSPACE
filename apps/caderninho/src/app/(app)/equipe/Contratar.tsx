"use client";

import { useState } from "react";

import { acordarPlantao, salvarRotinaMailab } from "@/app/actions";

export function Contratar({ mailabLigada }: { mailabLigada: boolean }) {
  const [plantao, setPlantao] = useState("");
  const [rotina, setRotina] = useState("");

  return (
    <section className="grid gap-6">
      <div className="panel grid gap-4 p-7">
        <p className="kicker">Grok Bot</p>
        <h2 className="display text-2xl">Rotina MAI LAB</h2>
        <p className="text-sm leading-relaxed text-[var(--mute)]">
          Esta é a ponte do escritório. Distinta da rotina Discord. Cole o POST to e a key que o
          Carlos devolveu da rotina MAI LAB. Sem ela, o Carlos não acorda.
        </p>
        <p className="flex items-center gap-2 text-sm">
          <span className={`live ${mailabLigada ? "" : "off"}`} />
          {mailabLigada ? "Ligada neste computador." : "Ainda não está ligada."}
        </p>
        <form
          className="grid gap-3"
          action={async (data) => {
            setRotina("Guardando…");
            const r = await salvarRotinaMailab(data);
            setRotina(r.ok ? "Rotina MAI LAB gravada." : r.erro);
          }}
        >
          <label className="grid gap-1.5 text-sm">
            POST to
            <input name="url" type="url" required className="field" autoComplete="off" />
          </label>
          <label className="grid gap-1.5 text-sm">
            Key
            <input name="key" type="password" required className="field" autoComplete="off" />
          </label>
          <button type="submit" className="btn w-fit">
            Guardar rotina
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
          setPlantao(aviso?.ok ? "Carlos avisado. Ele abre Hoje e trabalha o que está no nome dele." : aviso?.erro ?? "Não acordou.");
        }}
      >
        <h2 className="display text-2xl">Plantão</h2>
        <p className="text-sm text-[var(--mute)]">Acorda o Carlos. Ele abre Hoje e trabalha o que está no nome dele.</p>
        <button type="submit" className="btn w-fit">
          Acionar o Carlos
        </button>
        {plantao ? <p className="text-sm text-[var(--mute)]">{plantao}</p> : null}
      </form>
    </section>
  );
}
