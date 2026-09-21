import fs from "node:fs/promises";

import { NextResponse } from "next/server";

import { caminhoArquivoSeguro, nomeSeguro } from "@/lib/anexo";
import { userIdDaSessao } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await userIdDaSessao();
  if (!userId) {
    return NextResponse.json({ erro: "nao" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.ativo) {
    return NextResponse.json({ erro: "nao" }, { status: 401 });
  }
  const { id } = await params;
  const arquivo = await prisma.arquivo.findUnique({
    where: { id },
    include: { tarefa: true },
  });
  if (!arquivo || arquivo.tarefa.deletedAt) {
    return NextResponse.json({ erro: "sumiu" }, { status: 404 });
  }
  if (
    arquivo.tarefa.assigneeId !== userId &&
    arquivo.tarefa.criadorId !== userId &&
    user.tipo !== "humano" &&
    user.ficha !== "ceo"
  ) {
    return NextResponse.json({ erro: "nao" }, { status: 403 });
  }
  const full = caminhoArquivoSeguro(arquivo.caminho);
  if (!full) {
    return NextResponse.json({ erro: "caminho recusado" }, { status: 400 });
  }
  const data = await fs.readFile(full);
  const nome = nomeSeguro(arquivo.nome);
  return new NextResponse(data, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${nome}"`,
    },
  });
}
