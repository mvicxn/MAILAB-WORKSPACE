import fs from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

import { userIdDaSessao } from "@/lib/auth";
import { fazerBackupLocal, pastaBackup } from "@/lib/backup";
import { ehHumano } from "@/lib/equipe";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const userId = await userIdDaSessao();
  if (!userId) {
    return NextResponse.json({ erro: "nao" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !ehHumano(user.papel, user.tipo)) {
    return NextResponse.json({ erro: "nao" }, { status: 403 });
  }
  const nome = await fazerBackupLocal();
  const data = await fs.readFile(path.join(pastaBackup(), nome));
  return new NextResponse(data, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${nome}"`,
    },
  });
}
