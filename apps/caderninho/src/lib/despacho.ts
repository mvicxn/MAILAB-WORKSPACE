import { CARLOS } from "@/lib/equipe";
import { formatarPrazo } from "@/lib/datas";
import { prisma } from "@/lib/prisma";

export async function montarBriefing(tarefaId: string, extra = "") {
  const t = await prisma.tarefa.findUnique({
    where: { id: tarefaId },
    include: {
      assignee: true,
      criador: true,
      projeto: {
        include: {
          cliente: true,
          tarefas: {
            include: { assignee: true },
            orderBy: { updatedAt: "desc" },
          },
        },
      },
      arquivos: { orderBy: { createdAt: "desc" }, take: 12 },
      atualizacoes: {
        include: { autor: true },
        orderBy: { createdAt: "desc" },
        take: 4,
      },
    },
  });
  if (!t) {
    return extra;
  }
  const p = t.projeto;
  const irmas = (p?.tarefas ?? []).filter((x) => x.id !== t.id).slice(0, 8);
  const blocos: string[] = [
    `Despacho interno de ${t.criador.nome}. Esta mensagem não entra na ficha pública.`,
    `Você É ${CARLOS.nome}. Um dono. Uma entrega.`,
    `Abrir a tarefa: ficha pública no escritório.`,
  ];

  if (p) {
    const casa = [
      `Projeto: ${p.nome}`,
      p.cliente?.nome ? `Cliente: ${p.cliente.nome}` : "Cliente: interno",
      p.comercial ? `Comercial: ${p.comercial}` : "",
      p.valor.trim() ? `Valor combinado (sócio informou): ${p.valor}` : "",
      p.prazo ? `Prazo do projeto: ${formatarPrazo(p.prazo)}` : "",
      p.proximo.trim() ? `Próximo passo do sócio: ${p.proximo}` : "",
      p.descricao.trim() ? `Notas do projeto:\n${p.descricao.trim()}` : "",
    ].filter(Boolean);
    blocos.push(`## Casa\n\n${casa.join("\n")}`);
  }

  blocos.push(
    `## Tarefa\n\n**${t.titulo}**\nPrazo: ${formatarPrazo(t.prazo)}\nPedido por: ${t.criador.nome}`,
  );
  if (t.descricao.trim()) {
    blocos.push(`## Notas do pedido\n\n${t.descricao.trim()}`);
  }
  if (extra.trim()) {
    blocos.push(extra.trim());
  }

  blocos.push(`## Sua função\n\n${CARLOS.entrega}\n\n${CARLOS.mesa}`.trim());

  if (irmas.length) {
    blocos.push(
      `## Outras tarefas deste projeto\n\n${irmas
        .map((x) => `- ${x.assignee.nome}: ${x.titulo} (${x.status})`)
        .join("\n")}`,
    );
  }
  if (t.arquivos.length) {
    blocos.push(`## Arquivos já na ficha\n\n${t.arquivos.map((a) => `- ${a.nome}`).join("\n")}`);
  }
  if (t.atualizacoes.length) {
    blocos.push(
      `## Diário recente\n\n${t.atualizacoes
        .map((a) => `### ${a.autor.nome} · ${a.createdAt.toISOString()}\n${a.texto}`)
        .join("\n\n")}`,
    );
  }

  blocos.push(`## Entrega

O diário desta ficha é a prova. Markdown completo:

- \`## Entrega\` o que ficou pronto
- \`## Como se usa\` o que a pessoa vê
- \`## Evidência\` anexo, teste, o que não fez
- \`## Próximo passo\` dono e prazo

Código: POST cursor_url com o pedido. O Cursor deste PC escreve. Depois relate.
Não invente cliente, métrica, senha. Não mergeie. Não assine.`);

  return blocos.filter(Boolean).join("\n\n");
}
