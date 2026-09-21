import { notFound } from "next/navigation";

import { atualizarProjeto, excluirProjeto, impactoProjeto } from "@/app/actions";
import { formAction } from "@/lib/form-action";
import { Excluir } from "@/components/Excluir";
import { Relato } from "@/components/Relato";
import { COMERCIAL, paraInputData } from "@/lib/datas";
import { prisma } from "@/lib/prisma";

export default async function ProjetoComercialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const projeto = await prisma.projeto.findUnique({
    where: { id },
    include: { cliente: true },
  });
  if (!projeto || projeto.deletedAt) {
    notFound();
  }
  const impacto = await impactoProjeto(projeto.id);
  const interno = projeto.nome === "MAI interno";

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="panel p-7">
        <p className="kicker">Entrega</p>
        {projeto.descricao.trim() ? (
          <div className="mt-4 text-[var(--mute)]">
            <Relato texto={projeto.descricao} />
          </div>
        ) : (
          <p className="mt-4 text-sm text-[var(--mute)]">Ainda sem nota do que se cobra neste projeto.</p>
        )}
      </section>
      <form action={formAction(atualizarProjeto)} className="panel grid gap-4 p-7">
        <p className="kicker">Números</p>
        <input type="hidden" name="id" value={projeto.id} />
        <label className="campo">
          Nome
          <input name="nome" required defaultValue={projeto.nome} className="field" readOnly={interno} />
        </label>
        <label className="campo">
          O que vamos entregar
          <textarea name="descricao" rows={4} defaultValue={projeto.descricao} className="field" />
        </label>
        <label className="campo">
          Cliente
          <input name="cliente" defaultValue={projeto.cliente?.nome ?? ""} className="field" />
        </label>
        <label className="campo">
          Valor
          <input name="valor" defaultValue={projeto.valor ?? ""} className="field" />
        </label>
        <label className="campo">
          Prazo
          <input name="prazo" type="date" defaultValue={paraInputData(projeto.prazo)} className="field" />
        </label>
        <label className="campo">
          Comercial
          <select name="comercial" className="field" defaultValue={projeto.comercial ?? "interno"}>
            {COMERCIAL.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        <label className="campo">
          Próximo passo
          <input name="proximo" defaultValue={projeto.proximo ?? ""} className="field" />
        </label>
        <label className="campo">
          Status
          <select name="status" className="field" defaultValue={projeto.status}>
            <option value="aberto">Aberto</option>
            <option value="pausado">Pausado</option>
            <option value="concluido">Concluído</option>
          </select>
        </label>
        <button type="submit" className="btn w-fit">
          Guardar
        </button>
      </form>
      {interno ? (
        <p className="text-sm text-[var(--mute)]">O projeto interno da casa não sai.</p>
      ) : (
        <Excluir
          id={projeto.id}
          pergunta={`Excluir projeto ${projeto.nome}?`}
          impacto={`Tem ${impacto.tarefas} tarefas e ${impacto.eventos} eventos ligados. Eles ficam, sem este projeto.`}
          action={excluirProjeto}
        />
      )}
    </div>
  );
}
