import fs from "node:fs/promises";
import path from "node:path";

import { idSeguro } from "@/lib/autorizar";
import { prisma } from "@/lib/prisma";

const MAX = 12 * 1024 * 1024;

export function nomeSeguro(nome: string) {
  const base = path.basename(nome).replace(/[^a-zA-Z0-9._-]/g, "_") || "arquivo";
  return base.slice(0, 80);
}

export async function guardarAnexo(tarefaId: string, nome: string, bytes: Buffer) {
  if (!idSeguro(tarefaId)) {
    throw new Error("tarefa inválida");
  }
  if (bytes.length > MAX) {
    throw new Error("arquivo grande demais (máx 12 MB)");
  }
  const tarefa = await prisma.tarefa.findFirst({ where: { id: tarefaId, deletedAt: null } });
  if (!tarefa) {
    throw new Error("tarefa não existe");
  }
  const dir = path.join(process.cwd(), "uploads", "tarefas", tarefaId);
  await fs.mkdir(dir, { recursive: true });
  const filename = `${Date.now()}-${nomeSeguro(nome)}`;
  const rel = path.join("uploads", "tarefas", tarefaId, filename);
  const full = path.join(process.cwd(), rel);
  const raiz = path.join(process.cwd(), "uploads", "tarefas", tarefaId);
  if (!full.startsWith(raiz)) {
    throw new Error("caminho recusado");
  }
  await fs.writeFile(full, bytes);
  return prisma.arquivo.create({
    data: { tarefaId, nome: nomeSeguro(nome), caminho: rel },
  });
}

export function caminhoArquivoSeguro(rel: string) {
  const full = path.resolve(process.cwd(), rel);
  const raiz = path.resolve(process.cwd(), "uploads");
  if (!full.startsWith(raiz + path.sep) && full !== raiz) {
    return null;
  }
  return full;
}
