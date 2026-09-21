import { NextResponse } from "next/server";

import { autenticarCredencial } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function autenticar(email: string, senha: string) {
  return autenticarCredencial(email, senha);
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const email = String(body.email ?? "").trim();
  const senha = String(body.senha ?? "");
  const tarefaId = String(body.tarefaId ?? "").trim();
  const pedido = String(body.pedido ?? body.texto ?? body.recado ?? "").trim();
  const user = await autenticar(email, senha);
  if (!user) {
    return NextResponse.json({ erro: "login inválido" }, { status: 401 });
  }
  if (user.tipo !== "ia" && user.tipo !== "humano") {
    return NextResponse.json({ erro: "sem mesa" }, { status: 403 });
  }
  if (!pedido) {
    return NextResponse.json({ erro: "falta o pedido de código" }, { status: 400 });
  }
  const tarefa = await prisma.tarefa.findUnique({
    where: { id: tarefaId },
    include: { assignee: true },
  });
  if (!tarefa) {
    return NextResponse.json({ erro: "tarefa não existe" }, { status: 404 });
  }
  if (tarefa.assigneeId !== user.id && user.ficha !== "ceo" && user.tipo !== "humano") {
    return NextResponse.json({ erro: "essa tarefa não é da tua mesa" }, { status: 403 });
  }

  await prisma.atualizacao.create({
    data: {
      tarefaId,
      autorId: user.id,
      texto: `## Pedido ao Cursor da casa\n\n${pedido}`,
    },
  });

  const porta = process.env.CURSOR_CASA_PORT || "5859";
  try {
    const resp = await fetch(`http://127.0.0.1:${porta}/job`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pedido,
        tarefaId,
        email,
        senha,
        nome: user.nome,
        funcao: user.funcao,
        titulo: tarefa.titulo,
        entrega_url: "http://127.0.0.1:3000/api/mesa/entrega",
      }),
    });
    if (resp.status !== 202 && resp.status !== 200) {
      const detail = (await resp.text()).slice(0, 180);
      return NextResponse.json(
        { erro: `Cursor da casa recusou (${resp.status}). ${detail}` },
        { status: 502 },
      );
    }
  } catch {
    return NextResponse.json(
      { erro: "Cursor da casa dormindo. O PC precisa ter o escritório ligado." },
      { status: 503 },
    );
  }

  await prisma.tarefa.update({
    where: { id: tarefaId },
    data: { status: "pendente" },
  });
  return NextResponse.json({ ok: true, aceito: true });
}
