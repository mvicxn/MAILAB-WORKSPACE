import Link from "next/link";

import { criarProjeto } from "@/app/actions";
import { formAction } from "@/lib/form-action";
import { Pagina } from "@/components/Pagina";
import { COMERCIAL } from "@/lib/datas";

export default function NovoProjetoPage() {
  return (
    <Pagina
      kicker="Casa"
      titulo="Abrir projeto"
      texto="Uma mesa. Um cliente, ou interno. Valor e prazo, se já combinou."
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
            <input name="cliente" placeholder="Vazio = interno" className="field" />
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
        <button type="submit" className="btn w-fit">
          Abrir projeto
        </button>
      </form>
    </Pagina>
  );
}
