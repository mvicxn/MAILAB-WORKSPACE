import { notFound } from "next/navigation";

import { SalaProjeto } from "@/components/SalaProjeto";
import { prisma } from "@/lib/prisma";

export default async function ProjetoLayout({
  children,
  params,
}: {
  children: React.ReactNode;
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

  return (
    <div className="grid gap-6">
      <SalaProjeto
        id={projeto.id}
        nome={projeto.nome}
        cliente={projeto.cliente?.nome ?? "Interno"}
        comercial={projeto.comercial}
        valor={projeto.valor ?? ""}
        prazo={projeto.prazo}
        proximo={projeto.proximo ?? ""}
      />
      {children}
    </div>
  );
}
