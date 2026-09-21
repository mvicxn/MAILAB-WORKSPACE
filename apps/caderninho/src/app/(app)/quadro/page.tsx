import Link from "next/link";

import { QuadroVivo } from "@/components/QuadroVivo";
import { prisma } from "@/lib/prisma";

export default async function QuadroPage({
  searchParams,
}: {
  searchParams: Promise<{ sala?: string }>;
}) {
  const { sala: salaParam } = await searchParams;
  const sala = salaParam || "geral";
  const [quadro, projeto] = await Promise.all([
    prisma.quadro.findUnique({ where: { sala } }),
    prisma.projeto.findUnique({ where: { quadroId: sala } }),
  ]);

  return (
    <main className="grid h-full gap-3">
      <div className="flex flex-wrap items-end justify-between gap-3 px-1">
        <div>
          {projeto ? (
            <p className="text-sm">
              <Link href={`/projetos/${projeto.id}`} className="text-[var(--accent)]">
                {projeto.nome}
              </Link>
            </p>
          ) : (
            <p className="kicker">Casa</p>
          )}
          <h1 className="display mt-1 text-3xl">Quadro</h1>
        </div>
        <p className="text-sm text-[var(--mute)]">Rascunho compartilhado. Design e sócio no mesmo espaço.</p>
      </div>
      <QuadroVivo sala={sala} snapshotInicial={quadro?.snapshot ?? ""} />
    </main>
  );
}
