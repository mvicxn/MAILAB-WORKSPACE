import Link from "next/link";

import { Acionar } from "@/components/Acionar";
import { Avatar } from "@/components/Avatar";
import { Pagina } from "@/components/Pagina";
import { usuarioAtual } from "@/lib/auth";
import { CARLOS, ehHumano, whereMesa } from "@/lib/equipe";
import { rotinaMailabLigada } from "@/lib/grok-ponte";
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

  return (
    <Pagina
      kicker="Estúdio"
      titulo="Equipe"
      texto="Dois sócios. Um Grok: Carlos. A ponte da rotina fica numa sala só dela."
      acao={
        socio ? (
          <Link href="/ponte" className="btn-ghost">
            Abrir ponte
          </Link>
        ) : null
      }
    >
      <p className="flex items-center gap-2 text-sm">
        <span className={`live ${mailabLigada ? "" : "off"}`} />
        {mailabLigada ? "Rotina MAI LAB ligada neste computador." : "Rotina MAI LAB ainda não está neste PC."}
      </p>

      <section className="grid gap-4">
        <h2 className="display text-3xl">Sócios</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {socios.map((p) => (
            <div key={p.id} className="panel flex items-center gap-4 p-6">
              <Avatar nome={p.nome} size={52} />
              <div>
                <p className="font-medium">{p.nome}</p>
                <p className="mt-1 text-sm leading-relaxed text-[var(--mute)]">
                  {p.funcao} · decide dinheiro, contrato e merge
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4">
        <h2 className="display text-3xl">Grok</h2>
        {carlos ? (
          <div className="panel grid max-w-xl gap-5 p-6">
            <div className="flex items-start gap-4">
              <Avatar nome={carlos.nome} tipo="ia" size={52} />
              <div>
                <p className="font-medium">{carlos.nome}</p>
                <p className="mt-1 text-sm text-[var(--mute)]">{CARLOS.email}</p>
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
