import { randomBytes } from "node:crypto";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { hashSenha } from "@/lib/auth";
import { CARLOS, FICHA_CARLOS } from "@/lib/equipe";
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
    "# MAI LAB — senha do Carlos. Fora do Git. Permissão 600.",
    "# Um bot. Entra no site com e-mail + senha, como gente.",
    `# gerado ${new Date().toISOString()}`,
    "MAI_ESCRITORIO_URL=http://127.0.0.1:3000",
    "",
  ];
  for (const p of pessoas) {
    const ficha = p.ficha.toUpperCase();
    linhas.push(`# ${p.nome} · ${p.funcao}`);
    linhas.push(`MAI_EMAIL_CARLOS=${p.email}`);
    linhas.push(`MAI_SENHA_CARLOS=${p.senha}`);
    linhas.push(`MAI_EMAIL_${ficha}=${p.email}`);
    linhas.push(`MAI_SENHA_${ficha}=${p.senha}`);
    linhas.push("");
  }
  await fs.writeFile(dest, linhas.join("\n"), { mode: 0o600 });
  return dest;
}

export async function garantirCarlosNoBanco() {
  const senha = senhaCurta();
  const existente = await prisma.user.findFirst({
    where: {
      OR: [{ email: CARLOS.email }, { ficha: FICHA_CARLOS }, { login: "carlos" }, { login: FICHA_CARLOS }],
    },
  });

  let pessoa: ChaveFuncionario;
  if (existente) {
    await prisma.user.update({
      where: { id: existente.id },
      data: {
        nome: CARLOS.nome,
        login: "carlos",
        email: CARLOS.email,
        papel: CARLOS.papel,
        funcao: CARLOS.funcao,
        ficha: FICHA_CARLOS,
        tipo: "ia",
        ativo: true,
      },
    });
    pessoa = {
      ficha: FICHA_CARLOS,
      nome: CARLOS.nome,
      email: CARLOS.email,
      funcao: CARLOS.funcao,
      senha: "",
      novo: false,
    };
  } else {
    await prisma.user.create({
      data: {
        nome: CARLOS.nome,
        login: "carlos",
        email: CARLOS.email,
        senhaHash: await hashSenha(senha),
        papel: CARLOS.papel,
        funcao: CARLOS.funcao,
        ficha: FICHA_CARLOS,
        tipo: "ia",
        ativo: true,
      },
    });
    pessoa = {
      ficha: FICHA_CARLOS,
      nome: CARLOS.nome,
      email: CARLOS.email,
      funcao: CARLOS.funcao,
      senha,
      novo: true,
    };
  }

  await prisma.user.updateMany({
    where: {
      tipo: "ia",
      NOT: { ficha: FICHA_CARLOS },
      ativo: true,
    },
    data: { ativo: false },
  });

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

  const arquivo = pessoa.novo ? await gravarFuncionariosEnv([pessoa]) : "";
  return { pessoas: [pessoa], arquivo };
}

export async function contratarTimeNoBanco() {
  return garantirCarlosNoBanco();
}
