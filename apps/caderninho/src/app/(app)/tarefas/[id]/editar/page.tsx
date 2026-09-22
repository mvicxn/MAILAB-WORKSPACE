import { notFound } from "next/navigation";

import { atualizarTarefa, excluirTarefa } from "@/app/actions";
import { formAction } from "@/lib/form-action";
import { Excluir } from "@/components/Excluir";
import { paraInputData, statusCanon } from "@/lib/datas";
import { whereMesa } from "@/lib/equipe";
import { prisma } from "@/lib/prisma";

export default async function TarefaEditarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [tarefa, users, projetos] = await Promise.all([
    prisma.tarefa.findUnique({ where: { id } }),
    prisma.user.findMany({ where: whereMesa, orderBy: [{ tipo: "asc" }, { nome: "asc" }] }),
    prisma.projeto.findMany({ where: { deletedAt: null }, orderBy: { nome: "asc" } }),
  ]);
  if (!tarefa || tarefa.deletedAt) {
    notFound();
  }

  return (
    <div className="grid max-w-xl gap-6">
      <form action={formAction(atualizarTarefa)} className="panel grid gap-4 p-7">
        <p className="kicker">Ficha</p>
        <input type="hidden" name="id" value={tarefa.id} />
        <label className="campo">
          Título
          <input name="titulo" required defaultValue={tarefa.titulo} className="field" />
        </label>
        <label className="campo">
          Notas
          <textarea name="descricao" rows={5} defaultValue={tarefa.descricao} className="field" />
        </label>
        <label className="campo">
          Dono
          <select name="assigneeId" className="field" defaultValue={tarefa.assigneeId}>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nome}
              </option>
            ))}
          </select>
        </label>
        <label className="campo">
          Prazo
          <input name="prazo" type="date" defaultValue={paraInputData(tarefa.prazo)} className="field" />
        </label>
        <label className="campo">
          Projeto
          <select name="projetoId" className="field" defaultValue={tarefa.projetoId ?? ""}>
            <option value="">Sem projeto</option>
            {projetos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>
        </label>
        <input type="hidden" name="status" value={statusCanon(tarefa.status)} />
        <button type="submit" className="btn w-fit">
          Salvar
        </button>
      </form>
      <Excluir id={tarefa.id} pergunta={`Excluir tarefa ${tarefa.titulo}?`} action={excluirTarefa} />
    </div>
  );
}
