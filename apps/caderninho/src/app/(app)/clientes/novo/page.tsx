import Link from "next/link";
import { redirect } from "next/navigation";

import { criarCliente } from "@/app/actions";
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
      texto="Gente real. Sem nome inventado."
      acao={
        <Link href="/clientes" className="btn-ghost">
          Voltar
        </Link>
      }
    >
      <form action={formAction(criarCliente)} className="panel grid gap-4 p-8">
        <label className="campo">
          Nome
          <input name="nome" required placeholder="Nome" className="field" />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="campo">
            Contato
            <input name="contato" placeholder="Telefone ou e-mail" className="field" />
          </label>
          <label className="campo">
            Status
            <select name="status" className="field" defaultValue="conversando">
              <option value="conversando">Em conversa</option>
              <option value="proposta">Proposta</option>
              <option value="fechou">Fechado</option>
              <option value="ativo">Ativo</option>
              <option value="morreu">Encerrado</option>
            </select>
          </label>
        </div>
        <label className="campo">
          Próximo passo
          <input name="proximo" placeholder="Próximo passo" className="field" />
        </label>
        <label className="campo">
          Tags
          <input name="tags" placeholder="Separadas por vírgula" className="field" />
        </label>
        <label className="campo">
          Notas
          <textarea name="notas" rows={4} placeholder="Notas" className="field" />
        </label>
        <input type="hidden" name="tipo" value="lead" />
        <button type="submit" className="btn w-fit">
          Guardar pessoa
        </button>
      </form>
    </Pagina>
  );
}
