import fs from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

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
  const { id } = await params;
  const arquivo = await prisma.arquivo.findUnique({ where: { id } });
  if (!arquivo) {
    return NextResponse.json({ erro: "sumiu" }, { status: 404 });
  }
  const full = path.join(process.cwd(), arquivo.caminho);
  const data = await fs.readFile(full);
  return new NextResponse(data, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${arquivo.nome}"`,
    },
  });
}
