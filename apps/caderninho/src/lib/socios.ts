import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { hashSenha, senhaBate } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Socio = {
  nome: string;
  login: string;
  senha: string;
  email: string;
  papel: string;
  funcao: string;
};

function pastaSegredoMai() {
  return path.join(os.homedir(), ".config", "mai");
}

function lerChave(texto: string, chave: string) {
  const linha = texto.split(/\r?\n/).find((l) => l.startsWith(`${chave}=`));
  if (!linha) {
    return "";
  }
  return linha.slice(chave.length + 1).trim().replace(/^["']|["']$/g, "");
}

async function lerArquivoSocios(): Promise<Socio[] | null> {
  const dest = path.join(pastaSegredoMai(), "socios.env");
  let bruto = "";
  try {
    bruto = await fs.readFile(dest, "utf8");
  } catch {
    return null;
  }
  const maicon: Socio = {
    nome: "Maicon",
    login: (lerChave(bruto, "MAI_LOGIN_MAICON") || "adminmm").toLowerCase(),
    senha: lerChave(bruto, "MAI_SENHA_MAICON"),
    email: "maicon@mai.local",
    papel: "CEO",
    funcao: "Diretor",
  };
  const ian: Socio = {
    nome: "Ian",
    login: (lerChave(bruto, "MAI_LOGIN_IAN") || "adminian").toLowerCase(),
    senha: lerChave(bruto, "MAI_SENHA_IAN"),
    email: "ian@mai.local",
    papel: "CO_CEO",
    funcao: "Co-diretor",
  };
  if (!maicon.senha || !ian.senha) {
    return null;
  }
  return [maicon, ian];
}

async function sincronizar() {
  const socios = await lerArquivoSocios();
  if (!socios) {
    return;
  }
  for (const socio of socios) {
    const existente = await prisma.user.findFirst({
      where: {
        OR: [{ email: socio.email }, { login: socio.login }, { nome: socio.nome, tipo: "humano" }],
      },
    });
    const hashIgual = existente ? await senhaBate(socio.senha, existente.senhaHash) : false;
    if (existente) {
      await prisma.user.update({
        where: { id: existente.id },
        data: {
          nome: socio.nome,
          login: socio.login,
          email: socio.email,
          papel: socio.papel,
          funcao: socio.funcao,
          tipo: "humano",
          ativo: true,
          senhaHash: hashIgual ? existente.senhaHash : await hashSenha(socio.senha),
        },
      });
      continue;
    }
    await prisma.user.create({
      data: {
        nome: socio.nome,
        login: socio.login,
        email: socio.email,
        senhaHash: await hashSenha(socio.senha),
        papel: socio.papel,
        funcao: socio.funcao,
        ficha: "",
        tipo: "humano",
        ativo: true,
      },
    });
  }
}

let trabalho: Promise<void> | null = null;

export function garantirSocios() {
  if (!trabalho) {
    trabalho = sincronizar().catch((erro) => {
      trabalho = null;
      throw erro;
    });
  }
  return trabalho;
}
