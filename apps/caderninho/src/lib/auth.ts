import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { jwtVerify, SignJWT } from "jose";
import { cookies, headers } from "next/headers";

import { prisma } from "@/lib/prisma";

function chaveSessao() {
  const s = process.env.MAI_SECRET || "";
  if (s.length < 24) {
    throw new Error("MAI_SECRET inválido");
  }
  return new TextEncoder().encode(s);
}

const HASH_FANTASMA = "$2b$12$MLW4AnQHqjN7iszoDVL71u//7CpRLyeyuv6i3jB7VP/cbJm/ce0mu";

export type Sessao = {
  id: string;
  nome: string;
  email: string;
  login: string;
  papel: string;
  funcao: string;
  ficha: string;
  tipo: string;
};

export async function criarSessao(userId: string) {
  const token = await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(chaveSessao());
  const proto = (await headers()).get("x-forwarded-proto") || "";
  const jar = await cookies();
  jar.set("mai", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: proto === "https",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function sairSessao() {
  const jar = await cookies();
  jar.delete("mai");
}

export async function userIdDaSessao(): Promise<string | null> {
  const token = (await cookies()).get("mai")?.value;
  if (!token) {
    return null;
  }
  try {
    const { payload } = await jwtVerify(token, chaveSessao());
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

export async function usuarioAtual(db: PrismaClient): Promise<Sessao | null> {
  const id = await userIdDaSessao();
  if (!id) {
    return null;
  }
  const user = await db.user.findUnique({ where: { id } });
  if (!user || !user.ativo) {
    return null;
  }
  return {
    id: user.id,
    nome: user.nome,
    email: user.email,
    login: user.login,
    papel: user.papel,
    funcao: user.funcao,
    ficha: user.ficha,
    tipo: user.tipo,
  };
}

export async function hashSenha(senha: string) {
  return bcrypt.hash(senha, 12);
}

export async function senhaBate(senha: string, hash: string) {
  return bcrypt.compare(senha, hash);
}

export async function autenticarCredencial(ident: string, senha: string) {
  const bruto = ident.trim();
  const chave = bruto.toLowerCase();
  if (!bruto || !senha) {
    await senhaBate("x", HASH_FANTASMA);
    return null;
  }
  const user = await prisma.user.findFirst({
    where: {
      ativo: true,
      OR: [{ login: chave }, { email: bruto }, { email: chave }],
    },
  });
  const ok = await senhaBate(senha, user?.senhaHash ?? HASH_FANTASMA);
  if (!ok || !user) {
    return null;
  }
  return user;
}
