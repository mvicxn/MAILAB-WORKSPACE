import Link from "next/link";

import { Pagina } from "@/components/Pagina";
import { Vazio } from "@/components/Vazio";
import { usuarioAtual } from "@/lib/auth";
import { listarAvisos } from "@/lib/avisos";
import { prisma } from "@/lib/prisma";

const NIVEL: Record<string, string> = {
  urgente: "Urgente",
  atencao: "Atenção",
  info: "Mesa",
};

export default async function AvisosPage() {
  const user = await usuarioAtual(prisma);
  const avisos = user ? await listarAvisos(user) : [];

  return (
    <Pagina
      kicker="Dia"
      titulo="Avisos"
      texto="O que pede olho: tarefa no seu nome, atraso, risco de prazo, news e o Carlos."
    >
      {avisos.length === 0 ? (
        <Vazio titulo="Nada pendente." texto="Quando alguém te designar, o prazo apertar ou o Git postar, cai aqui." />
      ) : (
        <section className="grid gap-3">
          {avisos.map((a) => (
            <Link key={a.id} href={a.href} className={`link-card ${a.nivel === "urgente" ? "pulse-late" : ""}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{a.titulo}</p>
                  <p className="mt-1 text-sm text-[var(--mute)]">{a.texto}</p>
                </div>
                <span className={`chip ${a.nivel === "urgente" ? "late" : a.nivel === "atencao" ? "warn" : ""}`}>
                  {NIVEL[a.nivel] ?? a.nivel}
                </span>
              </div>
            </Link>
          ))}
        </section>
      )}
    </Pagina>
  );
}
