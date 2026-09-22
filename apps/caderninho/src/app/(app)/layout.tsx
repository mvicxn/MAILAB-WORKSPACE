import { redirect } from "next/navigation";

import { Shell } from "@/components/Shell";
import { usuarioAtual } from "@/lib/auth";
import { contarAvisos } from "@/lib/avisos";
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
  const [pessoas, projetos, campo, rotina, newsNovas, avisosNovos] = await Promise.all([
    prisma.user.findMany({
      where: { ...whereMesa, NOT: { id: user.id } },
      orderBy: [{ tipo: "asc" }, { nome: "asc" }],
      select: { id: true, nome: true, funcao: true, tipo: true, vistoAt: true },
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
    contarAvisos(user),
  ]);
  const emCampo = campo
    .filter((t) => t.assignee.tipo === "ia" && !concluida(t.status))
    .map((t) => ({ id: t.id, titulo: t.titulo, nome: t.assignee.nome, assigneeId: t.assigneeId }));

  return (
    <Shell
      nome={user.nome}
      funcao={user.funcao}
      euId={user.id}
      pessoas={pessoas.map((p) => ({ ...p, vistoAt: p.vistoAt?.toISOString() ?? null }))}
      projetos={projetos}
      rotina={rotina}
      emCampo={emCampo}
      newsNovas={newsNovas}
      avisosNovos={avisosNovos}
    >
      {children}
    </Shell>
  );
}
