import { CARLOS } from "@/lib/equipe";

export type Recorte = {
  titulo: string;
  descricao: string;
};

function corta(texto: string, n = 72) {
  const t = texto.replace(/#+\s*/g, "").replace(/\s+/g, " ").trim();
  return t.length <= n ? t : `${t.slice(0, n)}…`;
}

export function recortarPedido(titulo: string, corpo = ""): Recorte[] {
  const tituloLimpo = corta(titulo, 160);
  const pedido = [tituloLimpo, corpo.trim()].filter(Boolean).join("\n\n");
  return [
    {
      titulo: tituloLimpo,
      descricao: briefingDoCarlos(pedido),
    },
  ];
}

export function briefingDoCarlos(pedido: string) {
  return `
## Pedido

${pedido}

## Função

**${CARLOS.nome}** · ${CARLOS.funcao}

${CARLOS.entrega}

## Relatório

O diário desta ficha é a entrega. Escreva em Markdown, completo:

- \`##\` para seções
- listas e **negrito** no que decide
- tabelas quando houver comparação
- bloco de código se for arquivo ou comando

Se o trabalho gera imagem, tela ou arquivo, anexe. Sem relatório formatado, a tarefa não conta.

## Fora do escopo

- Não invente cliente, métrica ou evidência
- Não cole senha, token ou .env
- Não mergeie, não gaste, não assine
`.trim();
}

export function recadoDespacho(opts: {
  criador: string;
  executor: string;
  titulo: string;
  url: string;
  descricao: string;
}) {
  return `
Despacho interno de ${opts.criador}. Esta mensagem não entra na ficha pública.

Tarefa criada por: ${opts.criador}
Execução: ${opts.executor}
Título: ${opts.titulo}
Abrir: ${opts.url}

${opts.descricao}

---

Entregue no diário da tarefa, em Markdown completo (seções, listas, tabelas). Anexe o artefato se houver.
`.trim();
}
