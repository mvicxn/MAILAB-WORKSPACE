import { headers } from "next/headers";

import { ipDoPedido } from "@/lib/login-lock";
import { EMPRESA } from "@/lib/casa";
import { prisma } from "@/lib/prisma";

export async function trilha(opts: {
  userId: string;
  tipo: string;
  texto: string;
  clienteId?: string | null;
  projetoId?: string | null;
  tarefaId?: string | null;
  acao?: string;
  entidade?: string;
  entidadeId?: string;
  detalhe?: string;
}) {
  let ip = "";
  try {
    ip = ipDoPedido(await headers());
  } catch {
    ip = "";
  }
  await prisma.atividade.create({
    data: {
      tipo: opts.tipo,
      texto: opts.texto,
      userId: opts.userId,
      clienteId: opts.clienteId || null,
      projetoId: opts.projetoId || null,
      tarefaId: opts.tarefaId || null,
    },
  });
  if (opts.acao && opts.entidade && opts.entidadeId) {
    await prisma.auditoria.create({
      data: {
        acao: opts.acao,
        entidade: opts.entidade,
        entidadeId: opts.entidadeId,
        detalhe: opts.detalhe ?? opts.texto,
        ip,
        userId: opts.userId,
      },
    });
  }
}

export async function gravarTags(nomes: string, alvo: { clienteId?: string; projetoId?: string }) {
  const lista = nomes
    .split(/[,;]/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 8);
  const tags = [];
  for (const nome of lista) {
    const tag = await prisma.tag.upsert({
      where: { nome },
      create: { nome, empresaId: EMPRESA },
      update: {},
    });
    tags.push(tag);
  }
  if (alvo.clienteId) {
    await prisma.clienteTag.deleteMany({ where: { clienteId: alvo.clienteId } });
    for (const tag of tags) {
      await prisma.clienteTag.create({ data: { clienteId: alvo.clienteId, tagId: tag.id } });
    }
  }
  if (alvo.projetoId) {
    await prisma.projetoTag.deleteMany({ where: { projetoId: alvo.projetoId } });
    for (const tag of tags) {
      await prisma.projetoTag.create({ data: { projetoId: alvo.projetoId, tagId: tag.id } });
    }
  }
}
