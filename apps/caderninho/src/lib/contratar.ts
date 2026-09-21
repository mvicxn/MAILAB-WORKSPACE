import { randomBytes } from "node:crypto";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { hashSenha } from "@/lib/auth";
import { CARGOS } from "@/lib/equipe";
import { prisma } from "@/lib/prisma";

export type ChaveFuncionario = {
  ficha: string;
  nome: string;
  email: string;
  funcao: string;
  senha: string;
  novo: boolean;
};

function senhaCurta() {
  return randomBytes(5).toString("base64url");
}

export function pastaSegredoMai() {
  return path.join(os.homedir(), ".config", "mai");
}

export async function gravarFuncionariosEnv(pessoas: ChaveFuncionario[]) {
  const dir = pastaSegredoMai();
  await fs.mkdir(dir, { recursive: true, mode: 0o700 });
  const dest = path.join(dir, "funcionarios.env");
  const linhas = [
    "# MAI LAB — senhas dos funcionários. Fora do Git. Permissão 600.",
    "# Cada Grok Bot entra no site com e-mail + senha, como gente.",
    `# gerado ${new Date().toISOString()}`,
    "MAI_ESCRITORIO_URL=http://127.0.0.1:3000",
    "",
  ];
  for (const p of pessoas) {
    const ficha = p.ficha.toUpperCase();
    linhas.push(`# ${p.nome} · ${p.funcao}`);
    linhas.push(`MAI_EMAIL_${ficha}=${p.email}`);
    linhas.push(`MAI_SENHA_${ficha}=${p.senha}`);
    linhas.push("");
  }
  await fs.writeFile(dest, linhas.join("\n"), { mode: 0o600 });
  return dest;
}

export async function contratarTimeNoBanco() {
  const pessoas: ChaveFuncionario[] = [];

  for (const cargo of CARGOS) {
    const senha = senhaCurta();
    const existente = await prisma.user.findUnique({
      where: { email: cargo.email },
    });
    if (existente) {
      await prisma.user.update({
        where: { id: existente.id },
        data: {
          nome: cargo.nome,
          login: cargo.ficha,
          papel: cargo.papel,
          funcao: cargo.funcao,
          ficha: cargo.ficha,
          tipo: "ia",
          ativo: true,
        },
      });
      pessoas.push({
        ficha: cargo.ficha,
        nome: cargo.nome,
        email: cargo.email,
        funcao: cargo.funcao,
        senha: "",
        novo: false,
      });
      continue;
    }
    await prisma.user.create({
      data: {
        nome: cargo.nome,
        login: cargo.ficha,
        email: cargo.email,
        senhaHash: await hashSenha(senha),
        papel: cargo.papel,
        funcao: cargo.funcao,
        ficha: cargo.ficha,
        tipo: "ia",
        ativo: true,
      },
    });
    pessoas.push({
      ficha: cargo.ficha,
      nome: cargo.nome,
      email: cargo.email,
      funcao: cargo.funcao,
      senha,
      novo: true,
    });
  }

  const interno = await prisma.projeto.findFirst({
    where: { nome: "MAI interno" },
  });
  if (!interno) {
    await prisma.projeto.create({
      data: {
        nome: "MAI interno",
        descricao: "Trabalho da casa. Não é cliente de fora.",
        status: "aberto",
      },
    });
  }

  const arquivo =
    pessoas.some((p) => p.novo) ? await gravarFuncionariosEnv(pessoas.filter((p) => p.novo)) : "";
  return { pessoas, arquivo };
}
