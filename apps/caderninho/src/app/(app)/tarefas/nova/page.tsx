import Link from "next/link";

import { FormTarefa } from "@/components/FormTarefa";
import { Pagina } from "@/components/Pagina";
import { usuarioAtual } from "@/lib/auth";
import { whereMesa } from "@/lib/equipe";
import { prisma } from "@/lib/prisma";

export default async function NovaTarefaPage({
  searchParams,
}: {
  searchParams: Promise<{ projeto?: string }>;
}) {
  const user = await usuarioAtual(prisma);
  const { projeto } = await searchParams;
  const [gente, projetos] = await Promise.all([
    prisma.user.findMany({ where: whereMesa, orderBy: [{ tipo: "asc" }, { nome: "asc" }] }),
    prisma.projeto.findMany({ where: { deletedAt: null }, orderBy: { nome: "asc" }, select: { id: true, nome: true } }),
  ]);
  const voltar = projeto ? `/projetos/${projeto}` : "/tarefas";

  return (
    <Pagina
      kicker="Mesa"
      titulo="Nova tarefa"
      texto="Um dono. Uma entrega. Se for o Carlos, ele entra em campo."
      acao={
        <Link href={voltar} className="btn-ghost">
          Voltar
        </Link>
      }
    >
      <FormTarefa
        users={gente}
        projetos={projetos}
        projetoId={projeto}
        euId={user?.id}
        voltar={voltar}
        abertoInicio
      />
    </Pagina>
  );
}
