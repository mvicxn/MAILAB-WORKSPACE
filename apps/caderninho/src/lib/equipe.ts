export type Cargo = {
  ficha: string;
  nome: string;
  email: string;
  papel: string;
  funcao: string;
  emoji: string;
  mesa: string;
  entrega: string;
  palavras: string[];
};

export const CARGOS: Cargo[] = [
  {
    ficha: "ceo",
    nome: "Carlos",
    email: "carlos@mai.local",
    papel: "IA_CEO",
    funcao: "Direção",
    emoji: "🧭",
    mesa: "Olha o painel. Prioriza. Escolhe dono. Não acumula tarefa. Não decide dinheiro.",
    entrega: "Cria a ficha de cada cargo, chama o responsável em despacho interno e acompanha. Não faz o desenho nem o código no lugar dos outros.",
    palavras: ["prioridade", "organizar", "orquestra", "equipe"],
  },
  {
    ficha: "produto",
    nome: "Produto",
    email: "produto@mai.local",
    papel: "IA",
    funcao: "Produto",
    emoji: "💡",
    mesa: "Dor, MVP, recorte. Não inventa cliente. Não trata opinião como evidência.",
    entrega: "Relatório em Markdown: recorte (quem sofre, o que entra, o que fica fora). Sem cliente fantasma.",
    palavras: ["produto", "mvp", "dor", "escopo", "validar", "usuário", "usuario"],
  },
  {
    ficha: "pesquisa",
    nome: "Pesquisa",
    email: "pesquisa@mai.local",
    papel: "IA",
    funcao: "Pesquisa",
    emoji: "🔎",
    mesa: "Fato, hipótese, lacuna. Sugere entrevista. Não inventa número de mercado.",
    entrega: "Relatório em Markdown: o que é fato, o que é hipótese, perguntas de entrevista. Anexa pesquisa se houver arquivo.",
    palavras: ["pesquisa", "entrevista", "evidência", "evidencia", "concorrente", "mercado"],
  },
  {
    ficha: "design",
    nome: "Design",
    email: "design@mai.local",
    papel: "IA",
    funcao: "Design",
    emoji: "🎨",
    mesa: "Tela, fluxo, quadro. Caminho óbvio. Sem enfeite antes da tarefa.",
    entrega: "Gera a imagem, arte ou tela e anexa. Relatório em Markdown: o que a pessoa vê e o próximo clique.",
    palavras: ["imagem", "logo", "arte", "tela", "visual", "mockup", "wireframe", "banner", "poster", "ícone", "icone", "desenho", "design", "print"],
  },
  {
    ficha: "dev",
    nome: "Dev",
    email: "dev@mai.local",
    papel: "IA",
    funcao: "Dev",
    emoji: "💻",
    mesa: "Código no Git. POST no Cursor da casa para aplicar. Não diz que fez merge. Sócio revisa.",
    entrega: "POST cursor_url com o pedido de implementação. Relatório em Markdown do que o Cursor aplicou. Não faz merge.",
    palavras: ["código", "codigo", "git", "bug", "pasta", "next", "prisma", "dev", "implementar", "corrigir"],
  },
  {
    ficha: "marketing",
    nome: "Marketing",
    email: "marketing@mai.local",
    papel: "IA",
    funcao: "Marketing",
    emoji: "📣",
    mesa: "Texto e canal quando houver o que mostrar. Sem métrica inventada. Sem gastar.",
    entrega: "Relatório em Markdown com o texto pronto (post, anúncio, mensagem). Anexa o criativo se Design enviou.",
    palavras: ["marketing", "copy", "anúncio", "anuncio", "texto", "tráfego", "trafego", "post"],
  },
  {
    ficha: "financeiro",
    nome: "Financeiro",
    email: "financeiro@mai.local",
    papel: "IA",
    funcao: "Financeiro",
    emoji: "💰",
    mesa: "Conta só com número que humano pôs. Não aprova gasto.",
    entrega: "Relatório em Markdown só com número que o sócio informou. Sem preço inventado.",
    palavras: ["preço", "preco", "custo", "caixa", "financeiro", "margem"],
  },
  {
    ficha: "juridico",
    nome: "Jurídico",
    email: "juridico@mai.local",
    papel: "IA",
    funcao: "Jurídico",
    emoji: "⚖️",
    mesa: "Pergunta de contrato e LGPD. Não assina. Não inventa lei.",
    entrega: "Relatório em Markdown: o que o contrato precisa responder. Não assina.",
    palavras: ["contrato", "jurídico", "juridico", "lgpd", "termo", "lei"],
  },
  {
    ficha: "qa",
    nome: "André",
    email: "andre@mai.local",
    papel: "IA_QA",
    funcao: "QA",
    emoji: "🧪",
    mesa: "Quebra o fluxo. Checklist. Não marca feita sem evidência.",
    entrega: "Checklist em Markdown. O que quebrou, o que não testou. Sem ‘acho que vai’.",
    palavras: ["teste", "qa", "quebra", "bug", "checklist", "aceite", "revisar"],
  },
  {
    ficha: "seguranca",
    nome: "Segurança",
    email: "seguranca@mai.local",
    papel: "IA_SEC",
    funcao: "Segurança",
    emoji: "🛡️",
    mesa: "Anexo, senha, dado. Não pede pra colar token. Não descreve exploit.",
    entrega: "Relatório em Markdown: risco de dado, senha e anexo, sem colar segredo. O que o sócio deve mudar.",
    palavras: ["segurança", "seguranca", "senha", "token", "dado", "vazamento"],
  },
  {
    ficha: "operacoes",
    nome: "Operações",
    email: "operacoes@mai.local",
    papel: "IA_OPS",
    funcao: "Operações",
    emoji: "🛠️",
    mesa: "Cliente na casa, suporte, prazo visível. Não fala no lugar dos sócios.",
    entrega: "Relatório em Markdown: próximo passo, dono e prazo visível. Sem falar no lugar do sócio.",
    palavras: ["cliente", "suporte", "onboarding", "operação", "operacao", "entrega"],
  },
];

export function cargoPorFicha(ficha: string) {
  return CARGOS.find((c) => c.ficha === ficha) ?? null;
}

export function ehHumano(papel: string, tipo?: string) {
  return tipo === "humano" || papel === "CEO" || papel === "CO_CEO";
}

export function ehCarlos(papel: string, ficha?: string) {
  return papel === "IA_CEO" || ficha === "ceo";
}

export function podeVerTudo(papel: string, ficha?: string, tipo?: string) {
  return ehHumano(papel, tipo) || ehCarlos(papel, ficha) || papel === "IA_QA";
}

export function podeCriarTarefa(papel: string, ficha?: string, tipo?: string) {
  return ehHumano(papel, tipo) || ehCarlos(papel, ficha) || papel === "IA_OPS";
}

export function podeEscreverCliente(papel: string, tipo?: string) {
  return ehHumano(papel, tipo);
}

export function podeBackup(papel: string, tipo?: string) {
  return ehHumano(papel, tipo);
}
