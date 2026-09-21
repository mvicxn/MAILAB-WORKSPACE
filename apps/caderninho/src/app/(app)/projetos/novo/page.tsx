import Link from "next/link";

import { criarProjeto } from "@/app/actions";
import { formAction } from "@/lib/form-action";
import { Pagina } from "@/components/Pagina";
import { vivo } from "@/lib/casa";
import { COMERCIAL } from "@/lib/datas";
import { prisma } from "@/lib/prisma";

export default async function NovoProjetoPage() {
  const clientes = await prisma.cliente.findMany({
    where: vivo,
    orderBy: { nome: "asc" },
    select: { id: true, nome: true, status: true },
  });

  return (
    <Pagina
      kicker="Casa"
      titulo="Abrir projeto"
      texto="Uma mesa. Escolha a pessoa já cadastrada, ou deixe interno. Valor e prazo, se já combinou."
      acao={
        <Link href="/projetos" className="btn-ghost">
          Voltar
        </Link>
      }
    >
      <form action={formAction(criarProjeto)} className="panel grid gap-4 p-8">
        <label className="campo">
          Nome
          <input name="nome" required placeholder="Nome do projeto" className="field" />
        </label>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="campo">
            Cliente
            <select name="clienteId" className="field" defaultValue="">
              <option value="">Interno — sem cliente</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
            <span className="mt-1 text-xs text-[var(--mute)]">
              {clientes.length
                ? "Só entra quem já tem ficha. Falta alguém? Abra a pessoa primeiro."
                : "Nenhuma ficha ainda. Abra o cliente antes, se não for interno."}
            </span>
          </label>
          <label className="campo">
            Valor
            <input name="valor" placeholder="Combinado" className="field" />
          </label>
          <label className="campo">
            Prazo
            <input name="prazo" type="date" className="field" />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="campo">
            Comercial
            <select name="comercial" className="field" defaultValue="interno">
              {COMERCIAL.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <label className="campo">
            Próximo passo
            <input name="proximo" placeholder="O que move o dinheiro" className="field" />
          </label>
        </div>
        <label className="campo">
          Tags
          <input name="tags" placeholder="Separadas por vírgula" className="field" />
        </label>
        <label className="campo">
          Entrega
          <textarea name="descricao" rows={4} placeholder="O que vamos entregar" className="field" />
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" className="btn w-fit">
            Abrir projeto
          </button>
          <Link href="/clientes/novo" className="text-sm text-[var(--gold)]">
            Nova ficha de cliente
          </Link>
        </div>
      </form>
    </Pagina>
  );
}
