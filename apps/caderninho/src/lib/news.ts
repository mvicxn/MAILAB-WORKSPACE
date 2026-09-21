import { EMPRESA } from "@/lib/casa";
import { ehCarlos, ehHumano } from "@/lib/equipe";
import { type Prateleira } from "@/lib/news-form";
import { prisma } from "@/lib/prisma";

export {
  corpoNews,
  fonteNews,
  linkSeguro,
  PRATELEIRAS,
  prateleiraCanon,
  rotuloPrateleira,
  tituloNews,
  type Prateleira,
} from "@/lib/news-form";

export function podePostarNews(papel: string, ficha: string, tipo: string) {
  return ehHumano(papel, tipo) || ehCarlos(papel, ficha);
}

export async function criarNews(opts: {
  autorId: string;
  prateleira: Prateleira;
  titulo: string;
  corpo: string;
  link?: string;
  fonte?: string;
}) {
  return prisma.news.create({
    data: {
      prateleira: opts.prateleira,
      titulo: opts.titulo,
      corpo: opts.corpo,
      link: opts.link ?? "",
      fonte: opts.fonte ?? "",
      empresaId: EMPRESA,
      autorId: opts.autorId,
    },
  });
}

export async function listarNews(prateleira?: Prateleira | null) {
  return prisma.news.findMany({
    where: {
      empresaId: EMPRESA,
      ...(prateleira ? { prateleira } : {}),
    },
    include: {
      autor: { select: { nome: true } },
      leituras: { include: { user: { select: { nome: true } } } },
    },
    orderBy: { createdAt: "desc" },
    take: 80,
  });
}

export async function contarNewsNovas(userId: string) {
  return prisma.news.count({
    where: {
      empresaId: EMPRESA,
      leituras: { none: { userId } },
    },
  });
}

export async function marcarNewsLida(newsId: string, userId: string) {
  await prisma.newsLeitura.upsert({
    where: { newsId_userId: { newsId, userId } },
    create: { newsId, userId },
    update: {},
  });
}

export async function marcarNewsDaMesa(userId: string) {
  const itens = await prisma.news.findMany({
    where: { empresaId: EMPRESA, leituras: { none: { userId } } },
    select: { id: true },
  });
  for (const n of itens) {
    await marcarNewsLida(n.id, userId);
  }
  return itens.length;
}

export function jsonNews(
  n: Awaited<ReturnType<typeof listarNews>>[number],
  euId?: string,
) {
  const lidoPor = n.leituras.map((l) => l.user.nome);
  return {
    id: n.id,
    prateleira: n.prateleira,
    titulo: n.titulo,
    corpo: n.corpo,
    link: n.link,
    fonte: n.fonte,
    createdAt: n.createdAt.toISOString(),
    autor: n.autor.nome,
    lidoPor,
    novo: euId ? !n.leituras.some((l) => l.userId === euId) : lidoPor.length === 0,
  };
}
