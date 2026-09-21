import Link from "next/link";

import { Acionar } from "@/components/Acionar";
import { Avatar } from "@/components/Avatar";
import { Ponto } from "@/components/Ponto";
import { Pagina } from "@/components/Pagina";
import { usuarioAtual } from "@/lib/auth";
import { CARLOS, ehHumano, whereMesa } from "@/lib/equipe";
import { rotinaMailabLigada } from "@/lib/grok-ponte";
import { estadoPresenca, rotuloPresenca } from "@/lib/presenca";
import { prisma } from "@/lib/prisma";

export default async function EquipePage() {
  const user = await usuarioAtual(prisma);
  const gente = await prisma.user.findMany({
    where: whereMesa,
    orderBy: [{ tipo: "asc" }, { nome: "asc" }],
  });
  const socio = user ? ehHumano(user.papel, user.tipo) : false;
  const mailabLigada = socio ? await rotinaMailabLigada() : false;
  const socios = gente.filter((p) => p.tipo === "humano");
  const carlos = gente.find((p) => p.ficha === CARLOS.ficha);
  const campo = carlos
    ? await prisma.tarefa.findFirst({
        where: { assigneeId: carlos.id, acionadoAt: { not: null }, deletedAt: null, NOT: { status: "concluida" } },
      })
    : null;

  return (
    <Pagina
      kicker="Estúdio"
      titulo="Equipe"
      texto="Dois sócios. Um Grok: Carlos. Ligação, backup e lixeira ficam em Manutenção."
      acao={
        socio ? (
          <Link href="/manutencao" className="btn-ghost">
            Manutenção
          </Link>
        ) : null
      }
    >
      <p className="flex items-center gap-2 text-sm">
        <span className={`live ${mailabLigada ? "" : "off"}`} />
        {mailabLigada ? "Carlos ligado neste computador." : "Carlos ainda sem ligação neste PC."}
      </p>

      <section className="grid gap-4">
        <h2 className="display text-3xl">Sócios</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {socios.map((p) => {
            const estado = estadoPresenca(p.vistoAt);
            return (
              <div key={p.id} className="panel flex items-center gap-4 p-6">
                <span className="relative inline-flex">
                  <Avatar nome={p.nome} size={52} />
                  <span className="absolute right-0 bottom-0">
                    <Ponto estado={estado} size={12} />
                  </span>
                </span>
                <div>
                  <p className="font-medium">{p.nome}</p>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--mute)]">
                    {p.funcao} · {rotuloPresenca(estado)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4">
        <h2 className="display text-3xl">Grok</h2>
        {carlos ? (
          <div className="panel grid max-w-xl gap-5 p-6">
            <div className="flex items-start gap-4">
              <span className="relative inline-flex">
                <Avatar nome={carlos.nome} tipo="ia" size={52} />
                <span className="absolute right-0 bottom-0">
                  <Ponto
                    estado={estadoPresenca(null, {
                      ia: true,
                      emCampo: Boolean(campo),
                      rotina: mailabLigada,
                    })}
                    size={12}
                  />
                </span>
              </span>
              <div>
                <p className="font-medium">{carlos.nome}</p>
                <p className="mt-1 text-sm text-[var(--mute)]">
                  {CARLOS.email} ·{" "}
                  {rotuloPresenca(
                    estadoPresenca(null, { ia: true, emCampo: Boolean(campo), rotina: mailabLigada }),
                  )}
                </p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-[var(--mute)]">{CARLOS.mesa}</p>
            {socio ? <Acionar userId={carlos.id} nome={carlos.nome} /> : null}
          </div>
        ) : (
          <p className="text-sm text-[var(--mute)]">Carlos ainda não está no banco. Abra Entrar de novo.</p>
        )}
      </section>
    </Pagina>
  );
}
