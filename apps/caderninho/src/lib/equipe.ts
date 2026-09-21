export type Cargo = {
  ficha: string;
  nome: string;
  email: string;
  papel: string;
  funcao: string;
  emoji: string;
  mesa: string;
  entrega: string;
};

export const FICHA_CARLOS = "ceo";

export const CARLOS: Cargo = {
  ficha: FICHA_CARLOS,
  nome: "Carlos",
  email: "carlos@mai.local",
  papel: "IA_CEO",
  funcao: "Grok",
  emoji: "🧭",
  mesa: "Entra, faz a tarefa, escreve o diário. Código: pede no Cursor. Não mergeia. Não inventa cliente.",
  entrega:
    "Uma voz. Uma entrega. Diário em Markdown na ficha. Código passa pelo Cursor desta casa. Sócio decide merge, dinheiro e contrato.",
};

export const CARGOS: Cargo[] = [CARLOS];

export const whereMesa = {
  ativo: true,
  OR: [{ tipo: "humano" }, { ficha: FICHA_CARLOS }],
};

export function cargoPorFicha(ficha: string) {
  return ficha === CARLOS.ficha ? CARLOS : null;
}

export function ehHumano(papel: string, tipo?: string) {
  return tipo === "humano" || papel === "CEO" || papel === "CO_CEO";
}

export function ehCarlos(papel: string, ficha?: string) {
  return papel === "IA_CEO" || ficha === FICHA_CARLOS;
}

export function podeVerTudo(papel: string, ficha?: string, tipo?: string) {
  return ehHumano(papel, tipo) || ehCarlos(papel, ficha);
}

export function podeCriarTarefa(papel: string, ficha?: string, tipo?: string) {
  return ehHumano(papel, tipo) || ehCarlos(papel, ficha);
}

export function podeEscreverCliente(papel: string, tipo?: string) {
  return ehHumano(papel, tipo);
}

export function podeBackup(papel: string, tipo?: string) {
  return ehHumano(papel, tipo);
}
