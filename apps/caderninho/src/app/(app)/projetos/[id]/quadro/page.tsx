import { notFound } from "next/navigation";

import { QuadroVivo } from "@/components/QuadroVivo";
import { prisma } from "@/lib/prisma";

export default async function ProjetoQuadroPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const projeto = await prisma.projeto.findUnique({
    where: { id },
    select: { quadroId: true, deletedAt: true },
  });
  if (!projeto || projeto.deletedAt) {
    notFound();
  }
  const quadro = await prisma.quadro.findUnique({ where: { sala: projeto.quadroId } });

  return (
    <div className="grid gap-3">
      <p className="text-sm text-[var(--mute)]">Rascunho compartilhado. Design e sócio no mesmo espaço.</p>
      <QuadroVivo sala={projeto.quadroId} snapshotInicial={quadro?.snapshot ?? ""} />
    </div>
  );
}
