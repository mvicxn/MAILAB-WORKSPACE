import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { ipDoPedido, mesaBloqueada, registrarMesa } from "@/lib/login-lock";
import { autenticarMesa, camposDoPedido } from "@/lib/mesa-auth";
import {
  corpoNews,
  criarNews,
  fonteNews,
  jsonNews,
  linkSeguro,
  listarNews,
  podePostarNews,
  prateleiraCanon,
  tituloNews,
} from "@/lib/news";
import { trilha } from "@/lib/trilha";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await autenticarMesa("", "");
  if (!user) {
    return NextResponse.json({ erro: "login inválido" }, { status: 401 });
  }
  const itens = await listarNews();
  return NextResponse.json({ ok: true, itens: itens.map((n) => jsonNews(n, user.id)) });
}

export async function POST(req: Request) {
  const ip = ipDoPedido(req.headers);
  if (mesaBloqueada(ip)) {
    return NextResponse.json({ erro: "muitas tentativas" }, { status: 429 });
  }
  registrarMesa(ip);

  const campos = await camposDoPedido(req);
  const user = await autenticarMesa(campos.email, campos.senha);
  if (!user) {
    return NextResponse.json({ erro: "login inválido" }, { status: 401 });
  }
  if (!podePostarNews(user.papel, user.ficha, user.tipo)) {
    return NextResponse.json({ erro: "sem permissão" }, { status: 403 });
  }
  const prateleira = prateleiraCanon(campos.prateleira);
  const titulo = tituloNews(campos.titulo);
  const corpo = corpoNews(campos.corpo);
  const link = linkSeguro(campos.link);
  if (!prateleira) {
    return NextResponse.json({ erro: "prateleira: git ou mundo" }, { status: 400 });
  }
  if (!titulo) {
    return NextResponse.json({ erro: "falta um título curto" }, { status: 400 });
  }
  if (!corpo) {
    return NextResponse.json({ erro: "falta o corpo" }, { status: 400 });
  }
  if (link === null) {
    return NextResponse.json({ erro: "link inválido" }, { status: 400 });
  }
  const criado = await criarNews({
    autorId: user.id,
    prateleira,
    titulo,
    corpo,
    link,
    fonte: fonteNews(campos.fonte) || (prateleira === "git" ? "GitHub" : "Mundo"),
  });
  await trilha({
    userId: user.id,
    tipo: "news",
    texto: `News ${prateleira}: ${titulo}`,
    acao: "criar",
    entidade: "news",
    entidadeId: criado.id,
  });
  revalidatePath("/news");
  revalidatePath("/hoje");
  return NextResponse.json({ ok: true, id: criado.id });
}
