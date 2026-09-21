import { NextResponse } from "next/server";

import { guardarAnexo } from "@/lib/anexo";
import { autenticarCredencial } from "@/lib/auth";
import { concluida } from "@/lib/datas";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function autenticar(email: string, senha: string) {
  return autenticarCredencial(email, senha);
}

export async function POST(req: Request) {
  const ctype = req.headers.get("content-type") || "";
  let email = "";
  let senha = "";
  let tarefaId = "";
  let texto = "";
  let nomeArquivo = "entrega.bin";
  let bytes: Buffer | null = null;

  if (ctype.includes("multipart/form-data") || ctype.includes("application/x-www-form-urlencoded")) {
    const form = await req.formData();
    email = String(form.get("email") ?? "").trim();
    senha = String(form.get("senha") ?? "");
    tarefaId = String(form.get("tarefaId") ?? "").trim();
    texto = String(form.get("texto") ?? "").trim();
    const file = form.get("arquivo");
    if (file instanceof File && file.size > 0) {
      nomeArquivo = file.name;
      bytes = Buffer.from(await file.arrayBuffer());
    }
  } else {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    email = String(body.email ?? "").trim();
    senha = String(body.senha ?? "");
    tarefaId = String(body.tarefaId ?? "").trim();
    texto = String(body.texto ?? "").trim();
    nomeArquivo = String(body.arquivo_nome ?? "entrega.bin");
    const b64 = typeof body.arquivo_base64 === "string" ? body.arquivo_base64 : "";
    if (b64) {
      bytes = Buffer.from(b64.replace(/^data:[^;]+;base64,/, ""), "base64");
    } else if (typeof body.arquivo_url === "string" && /^https?:\/\//.test(body.arquivo_url)) {
      const got = await fetch(body.arquivo_url);
      if (got.ok) {
        bytes = Buffer.from(await got.arrayBuffer());
      }
    }
  }

  const user = await autenticar(email, senha);
  if (!user) {
    return NextResponse.json({ erro: "login inválido" }, { status: 401 });
  }
  const tarefa = await prisma.tarefa.findUnique({ where: { id: tarefaId } });
  if (!tarefa) {
    return NextResponse.json({ erro: "tarefa não existe" }, { status: 404 });
  }
  if (tarefa.assigneeId !== user.id && user.ficha !== "ceo" && user.tipo !== "humano") {
    return NextResponse.json({ erro: "essa tarefa não é da tua mesa" }, { status: 403 });
  }
  if (!texto && !bytes) {
    return NextResponse.json({ erro: "manda texto no diário ou um arquivo" }, { status: 400 });
  }
  if (bytes) {
    await guardarAnexo(tarefaId, nomeArquivo, bytes);
  }
  if (texto) {
    await prisma.atualizacao.create({
      data: { tarefaId, autorId: user.id, texto },
    });
  }
  await prisma.tarefa.update({
    where: { id: tarefaId },
    data: { status: concluida(tarefa.status) ? "concluida" : "pendente" },
  });
  const { trilha } = await import("@/lib/trilha");
  await trilha({
    userId: user.id,
    tipo: "entrega",
    texto: `Entrega Grok em ${tarefa.titulo}`,
    tarefaId,
    projetoId: tarefa.projetoId,
    clienteId: tarefa.clienteId,
    acao: "editar",
    entidade: "tarefa",
    entidadeId: tarefaId,
  });
  return NextResponse.json({ ok: true, anexo: Boolean(bytes), diario: Boolean(texto) });
}
