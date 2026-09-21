import { notFound } from "next/navigation";

import { atualizarCliente, excluirCliente, impactoCliente } from "@/app/actions";
import { CamposCliente } from "@/components/CamposCliente";
import { formAction } from "@/lib/form-action";
import { Excluir } from "@/components/Excluir";
import { lerExtra } from "@/lib/cliente-extra";
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
    <div className="grid max-w-2xl gap-6">
      <form action={formAction(atualizarCliente)} className="panel grid gap-4 p-7">
        <p className="kicker">Ficha</p>
        <input type="hidden" name="id" value={cliente.id} />
        <CamposCliente
          valores={{
            nome: cliente.nome,
            tipo: cliente.tipo,
            status: cliente.status,
            contato: cliente.contato,
            proximo: cliente.proximo,
            tags: cliente.tags.map((x) => x.tag.nome).join(", "),
            notas: cliente.notas,
            extra: lerExtra(cliente.extra),
          }}
        />
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
