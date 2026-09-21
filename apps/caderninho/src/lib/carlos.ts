import { CARGOS, type Cargo } from "@/lib/equipe";

export type Recorte = {
  cargo: Cargo;
  titulo: string;
  descricao: string;
};

const MAX_CARGOS = 3;
const SQUAD_MINIMO = ["produto", "design", "dev"];

function corta(texto: string, n = 72) {
  const t = texto.replace(/#+\s*/g, "").replace(/\s+/g, " ").trim();
  return t.length <= n ? t : `${t.slice(0, n)}…`;
}

function escapar(p: string) {
  return p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function temPalavra(texto: string, palavra: string) {
  return new RegExp(`(?<![\\p{L}\\p{N}])${escapar(palavra)}(?![\\p{L}\\p{N}])`, "iu").test(texto);
}

export function recortarPedido(titulo: string, corpo = "", todoMundo = false): Recorte[] {
  const tituloLimpo = corta(titulo, 160);
  const baixo = `${tituloLimpo}\n${corpo}`.toLowerCase();
  const time = CARGOS.filter((c) => c.ficha !== "ceo");
  let escolhidos = todoMundo
    ? time
    : time.filter((c) => c.palavras.some((p) => temPalavra(baixo, p)));
  if (escolhidos.length === 0) {
    escolhidos = time.filter((c) => SQUAD_MINIMO.includes(c.ficha));
  }
  escolhidos = escolhidos.slice(0, MAX_CARGOS);
  const pedido = [tituloLimpo, corpo.trim()].filter(Boolean).join("\n\n");
  return escolhidos.map((cargo) => ({
    cargo,
    titulo: `${cargo.nome}: ${corta(tituloLimpo, 56)}`,
    descricao: briefingDoCargo(pedido, cargo),
  }));
}

export function briefingDoCargo(pedido: string, cargo: Cargo) {
  return `
## Pedido

${pedido}

## Função nesta tarefa

**${cargo.nome}** · ${cargo.funcao}

${cargo.entrega}

## Relatório

O diário desta ficha é a entrega. Escreva em Markdown, completo:

- \`##\` para seções
- listas e **negrito** no que decide
- tabelas quando houver comparação
- bloco de código se for arquivo ou comando

Se o trabalho gera imagem, tela ou arquivo, anexe. Sem relatório formatado, a tarefa não conta.

## Fora do escopo

- Não invente cliente, métrica ou evidência
- Não faça o trabalho de outro cargo
- Não cole senha, token ou .env
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
