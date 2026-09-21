import fs from "node:fs/promises";
import path from "node:path";

export function pastaBackup() {
  return path.join(process.cwd(), "backups");
}

export function arquivoBanco() {
  return path.join(process.cwd(), "prisma", "dev.db");
}

export async function fazerBackupLocal() {
  const dir = pastaBackup();
  await fs.mkdir(dir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const dest = path.join(dir, `mai-${stamp}.db`);
  await fs.copyFile(arquivoBanco(), dest);
  const files = (await fs.readdir(dir))
    .filter((name) => name.endsWith(".db"))
    .sort();
  while (files.length > 20) {
    const old = files.shift();
    if (old) {
      await fs.unlink(path.join(dir, old));
    }
  }
  return path.basename(dest);
}

export async function ultimoBackup() {
  try {
    const files = (await fs.readdir(pastaBackup()))
      .filter((name) => name.endsWith(".db"))
      .sort();
    return files.at(-1) ?? null;
  } catch {
    return null;
  }
}
