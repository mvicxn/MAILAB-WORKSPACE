import { Contratar } from "@/app/(app)/equipe/Contratar";
import { Pagina } from "@/components/Pagina";
import { usuarioAtual } from "@/lib/auth";
import { ehHumano } from "@/lib/equipe";
import { rotinaMailabLigada } from "@/lib/grok-ponte";
import { prisma } from "@/lib/prisma";

export default async function PontePage() {
  const user = await usuarioAtual(prisma);
  const socio = user ? ehHumano(user.papel, user.tipo) : false;
  const mailabLigada = socio ? await rotinaMailabLigada() : false;

  return (
    <Pagina
      kicker="Máquina"
      titulo="Ponte"
      texto="POST to e Key da rotina MAI LAB. Distinta do Discord. Sem isto, o Carlos não acorda."
    >
      {socio ? (
        <Contratar mailabLigada={mailabLigada} />
      ) : (
        <p className="text-[var(--mute)]">Só sócio cola a ponte neste computador.</p>
      )}
    </Pagina>
  );
}
