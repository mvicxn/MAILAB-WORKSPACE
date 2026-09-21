import { notFound } from "next/navigation";

import { atualizarCliente, excluirCliente, impactoCliente } from "@/app/actions";
import { formAction } from "@/lib/form-action";
import { Excluir } from "@/components/Excluir";
import { prisma } from "@/lib/prisma";

export default async function ClienteFichaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cliente = await prisma.cliente.findUnique({
    where: { id },
    include: { tags: { include: { tag: true } } },
  });
  if (!cliente || cliente.deletedAt) {
    notFound();
  }
  const impacto = await impactoCliente(cliente.id);

  return (
    <div className="grid max-w-xl gap-6">
      <form action={formAction(atualizarCliente)} className="panel grid gap-4 p-7">
        <p className="kicker">Ficha</p>
        <input type="hidden" name="id" value={cliente.id} />
        <label className="campo">
          Nome
          <input name="nome" required defaultValue={cliente.nome} className="field" />
        </label>
        <label className="campo">
          Tipo
          <select name="tipo" className="field" defaultValue={cliente.tipo}>
            <option value="lead">Prospecto</option>
            <option value="cliente">Cliente</option>
          </select>
        </label>
        <label className="campo">
          Status
          <select name="status" className="field" defaultValue={cliente.status}>
            <option value="conversando">Em conversa</option>
            <option value="proposta">Proposta</option>
            <option value="fechou">Fechado</option>
            <option value="ativo">Ativo</option>
            <option value="morreu">Encerrado</option>
          </select>
        </label>
        <label className="campo">
          Contato
          <input name="contato" defaultValue={cliente.contato} placeholder="Telefone ou e-mail" className="field" />
        </label>
        <label className="campo">
          Próximo passo
          <input name="proximo" defaultValue={cliente.proximo} className="field" />
        </label>
        <label className="campo">
          Tags
          <input
            name="tags"
            defaultValue={cliente.tags.map((x) => x.tag.nome).join(", ")}
            placeholder="Separadas por vírgula"
            className="field"
          />
        </label>
        <label className="campo">
          Notas
          <textarea name="notas" rows={5} defaultValue={cliente.notas} className="field" />
        </label>
        <button type="submit" className="btn w-fit">
          Salvar
        </button>
      </form>
      <Excluir
        id={cliente.id}
        pergunta={`Excluir cliente ${cliente.nome}?`}
        impacto={`Tem ${impacto.tarefas} tarefas, ${impacto.eventos} eventos e ${impacto.projetos} projetos ligados.`}
        action={excluirCliente}
      />
    </div>
  );
}
