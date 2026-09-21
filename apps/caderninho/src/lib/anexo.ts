import fs from "node:fs/promises";
import path from "node:path";

import { prisma } from "@/lib/prisma";

export async function guardarAnexo(tarefaId: string, nome: string, bytes: Buffer) {
  const dir = path.join(process.cwd(), "uploads", "tarefas", tarefaId);
  await fs.mkdir(dir, { recursive: true });
  const safe = nome.replace(/[^a-zA-Z0-9._-]/g, "_") || "arquivo";
  const filename = `${Date.now()}-${safe}`;
  const rel = path.join("uploads", "tarefas", tarefaId, filename);
  await fs.writeFile(path.join(process.cwd(), rel), bytes);
  return prisma.arquivo.create({
    data: { tarefaId, nome, caminho: rel },
  });
}
