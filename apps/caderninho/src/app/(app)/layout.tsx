import { redirect } from "next/navigation";

import { Shell } from "@/components/Shell";
import { usuarioAtual } from "@/lib/auth";
import { concluida } from "@/lib/datas";
import { whereMesa } from "@/lib/equipe";
import { contarNewsNovas } from "@/lib/news";
import { rotinaMailabLigada } from "@/lib/grok-ponte";
import { prisma } from "@/lib/prisma";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await usuarioAtual(prisma);
  if (!user) {
    redirect("/entrar");
  }
  const [pessoas, projetos, campo, rotina, newsNovas] = await Promise.all([
    prisma.user.findMany({
      where: { ...whereMesa, NOT: { id: user.id } },
      orderBy: [{ tipo: "asc" }, { nome: "asc" }],
      select: { id: true, nome: true, funcao: true, tipo: true },
    }),
    prisma.projeto.findMany({
      where: { deletedAt: null, empresaId: "mai" },
      orderBy: { updatedAt: "desc" },
      take: 8,
      select: { id: true, nome: true },
    }),
    prisma.tarefa.findMany({
      where: { acionadoAt: { not: null }, NOT: { status: "concluida" }, deletedAt: null },
      include: { assignee: true },
      orderBy: { acionadoAt: "desc" },
      take: 6,
    }),
    rotinaMailabLigada(),
    contarNewsNovas(user.id),
  ]);
  const emCampo = campo
    .filter((t) => t.assignee.tipo === "ia" && !concluida(t.status))
    .map((t) => ({ id: t.id, titulo: t.titulo, nome: t.assignee.nome }));

  return (
    <Shell
      nome={user.nome}
      funcao={user.funcao}
      euId={user.id}
      pessoas={pessoas}
      projetos={projetos}
      rotina={rotina}
      emCampo={emCampo}
      newsNovas={newsNovas}
    >
      {children}
    </Shell>
  );
}
