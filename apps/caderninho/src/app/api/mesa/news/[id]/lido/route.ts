import { NextResponse } from "next/server";

import { idSeguro } from "@/lib/autorizar";
import { ehHumano } from "@/lib/equipe";
import { autenticarMesa, camposDoPedido } from "@/lib/mesa-auth";
import { marcarNewsLida } from "@/lib/news";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const campos = await camposDoPedido(req).catch(() => ({ email: "", senha: "" }));
  const user = await autenticarMesa(campos.email, campos.senha);
  if (!user) {
    return NextResponse.json({ erro: "login inválido" }, { status: 401 });
  }
  if (!ehHumano(user.papel, user.tipo)) {
    return NextResponse.json({ erro: "só sócio marca como lido" }, { status: 403 });
  }
  const { id } = await params;
  if (!idSeguro(id)) {
    return NextResponse.json({ erro: "news inválida" }, { status: 400 });
  }
  const news = await prisma.news.findUnique({ where: { id } });
  if (!news) {
    return NextResponse.json({ erro: "sumiu" }, { status: 404 });
  }
  await marcarNewsLida(id, user.id);
  return NextResponse.json({ ok: true, id });
}
