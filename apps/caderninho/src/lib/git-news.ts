import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { promisify } from "node:util";

import { EMPRESA } from "@/lib/casa";
import { CARLOS } from "@/lib/equipe";
import { corpoNews, criarNews, tituloNews } from "@/lib/news";
import { prisma } from "@/lib/prisma";

const exec = promisify(execFile);

function acharGit(start: string) {
  let d = start;
  for (let i = 0; i < 8; i += 1) {
    if (existsSync(path.join(d, ".git"))) {
      return d;
    }
    const p = path.dirname(d);
    if (p === d) {
      break;
    }
    d = p;
  }
  return path.resolve(start, "../..");
}

function urlCommit(remote: string, hash: string) {
  const limpo = remote
    .trim()
    .replace(/\.git$/, "")
    .replace(/^git@github\.com:/, "https://github.com/")
    .replace(/^ssh:\/\/git@github\.com\//, "https://github.com/");
  if (!limpo.includes("github.com")) {
    return "";
  }
  return `${limpo}/commit/${hash}`;
}

export async function sincronizarGitNews() {
  const raiz = acharGit(process.cwd());
  let log = "";
  let remote = "";
  try {
    const r = await exec("git", ["-C", raiz, "log", "-25", "--pretty=format:%H%x09%h%x09%an%x09%cI%x09%s"], {
      timeout: 8000,
    });
    log = r.stdout.trim();
    const rem = await exec("git", ["-C", raiz, "remote", "get-url", "origin"], { timeout: 4000 });
    remote = rem.stdout.trim();
  } catch {
    return { ok: false as const, novos: 0, erro: "Este PC não leu o Git da pasta." };
  }
  if (!log) {
    return { ok: true as const, novos: 0, erro: "" };
  }
  const carlos = await prisma.user.findFirst({ where: { ficha: CARLOS.ficha, ativo: true } });
  if (!carlos) {
    return { ok: false as const, novos: 0, erro: "Carlos ainda não está no banco." };
  }
  const existentes = await prisma.news.findMany({
    where: { empresaId: EMPRESA, prateleira: "git" },
    select: { fonte: true },
  });
  const ja = new Set(existentes.map((n) => n.fonte));
  const linhas = log.split("\n").filter(Boolean).reverse();
  let novos = 0;
  for (const line of linhas) {
    const [hash, short, autor, iso, ...rest] = line.split("\t");
    if (!hash || !short) {
      continue;
    }
    const fonte = `git ${short}`;
    if (ja.has(fonte)) {
      continue;
    }
    const assunto = rest.join("\t").trim();
    const titulo = tituloNews(assunto);
    if (!titulo) {
      continue;
    }
    const quando = iso
      ? new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })
      : "";
    const corpo = corpoNews(
      `${autor || "commit"} · ${quando}\n\n${assunto}\n\nCommit ${short} no Git desta casa.`,
    );
    if (!corpo) {
      continue;
    }
    await criarNews({
      autorId: carlos.id,
      prateleira: "git",
      titulo,
      corpo,
      link: urlCommit(remote, hash),
      fonte,
    });
    ja.add(fonte);
    novos += 1;
  }
  return { ok: true as const, novos, erro: "" };
}
