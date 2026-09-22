import Link from "next/link";
import { redirect } from "next/navigation";

import { criarCliente } from "@/app/actions";
import { CamposCliente } from "@/components/CamposCliente";
import { formAction } from "@/lib/form-action";
import { Pagina } from "@/components/Pagina";
import { usuarioAtual } from "@/lib/auth";
import { ehHumano } from "@/lib/equipe";
import { prisma } from "@/lib/prisma";

export default async function NovoClientePage() {
  const user = await usuarioAtual(prisma);
  if (!user || !ehHumano(user.papel, user.tipo)) {
    redirect("/clientes");
  }

  return (
    <Pagina
      kicker="Pessoas"
      titulo="Nova ficha"
      texto="Gente real. Prospecção entra aqui. Sem nome inventado."
      acao={
        <Link href="/clientes" className="btn-ghost">
          Voltar
        </Link>
      }
    >
      <form action={formAction(criarCliente)} className="panel grid gap-4 p-8">
        <CamposCliente />
        <button type="submit" className="btn w-fit">
          Guardar pessoa
        </button>
      </form>
    </Pagina>
  );
}
