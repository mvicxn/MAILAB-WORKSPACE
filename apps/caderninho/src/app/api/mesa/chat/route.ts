import { NextResponse } from "next/server";

import { autenticarCredencial } from "@/lib/auth";
import { ipDoPedido, mesaBloqueada, registrarMesa } from "@/lib/login-lock";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const ip = ipDoPedido(req.headers);
  if (mesaBloqueada(ip)) {
    return NextResponse.json({ erro: "muitas tentativas" }, { status: 429 });
  }
  registrarMesa(ip);
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const email = String(body.email ?? "").trim();
  const senha = String(body.senha ?? "");
  const texto = String(body.texto ?? body.message ?? body.reply ?? "").trim();
  const conversaId = String(body.conversaId ?? body.conversa_id ?? "").trim();
  if (!email || !senha || !texto) {
    return NextResponse.json({ erro: "email, senha e texto" }, { status: 400 });
  }
  const user = await autenticarCredencial(email, senha);
  if (!user) {
    return NextResponse.json({ erro: "login inválido" }, { status: 401 });
  }
  if (user.tipo !== "ia") {
    return NextResponse.json({ erro: "só funcionário responde no chat" }, { status: 403 });
  }
  let conversa = conversaId
    ? await prisma.conversa.findUnique({ where: { id: conversaId } })
    : null;
  if (!conversa) {
    conversa = await prisma.conversa.findFirst({
      where: { funcionarioId: user.id },
      orderBy: { updatedAt: "desc" },
    });
  }
  if (!conversa || conversa.funcionarioId !== user.id) {
    return NextResponse.json({ erro: "conversa não encontrada" }, { status: 404 });
  }
  await prisma.mensagem.create({
    data: {
      conversaId: conversa.id,
      autorId: user.id,
      papel: "ia",
      texto,
    },
  });
  await prisma.conversa.update({
    where: { id: conversa.id },
    data: { updatedAt: new Date() },
  });
  return NextResponse.json({ ok: true });
}
