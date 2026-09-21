export function semanaIso(date = new Date()): string {
  const tmp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = tmp.getUTCDay() || 7;
  tmp.setUTCDate(tmp.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((tmp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${tmp.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

const TZ = "America/Sao_Paulo";

export function saudacao(date = new Date()) {
  const h = Number(
    new Intl.DateTimeFormat("pt-BR", { timeZone: TZ, hour: "numeric", hour12: false }).format(date),
  );
  if (h < 12) {
    return "Bom dia";
  }
  if (h < 18) {
    return "Boa tarde";
  }
  return "Boa noite";
}

export function haQuanto(date: Date) {
  const s = Math.max(0, (Date.now() - date.getTime()) / 1000);
  if (s < 45) {
    return "agora";
  }
  if (s < 3600) {
    return `${Math.floor(s / 60)} min`;
  }
  if (s < 86400) {
    return `${Math.floor(s / 3600)} h`;
  }
  return formatarPrazo(date);
}

export function hojeExtenso(date = new Date()) {
  return date.toLocaleDateString("pt-BR", {
    timeZone: TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export const COLUNAS = [
  { id: "a_fazer", label: "A fazer" },
  { id: "pendente", label: "Em curso" },
  { id: "concluida", label: "Feito" },
] as const;

export type StatusTarefa = (typeof COLUNAS)[number]["id"];

export function statusCanon(status: string): StatusTarefa {
  if (status === "aberta") {
    return "a_fazer";
  }
  if (status === "andamento") {
    return "pendente";
  }
  if (status === "feita") {
    return "concluida";
  }
  if (status === "a_fazer" || status === "pendente" || status === "concluida") {
    return status;
  }
  return "a_fazer";
}

export function concluida(status: string) {
  return statusCanon(status) === "concluida";
}

export function atrasada(status: string, prazo: Date | null): boolean {
  return !concluida(status) && prazo !== null && prazo.getTime() < Date.now();
}

export function formatarPrazo(prazo: Date | null): string {
  if (!prazo) {
    return "Sem prazo";
  }
  return prazo.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: TZ,
  });
}

export function paraInputData(prazo: Date | null): string {
  if (!prazo) {
    return "";
  }
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(prazo);
}

export const STATUS_TAREFA: Record<string, string> = {
  a_fazer: "A fazer",
  pendente: "Em curso",
  concluida: "Feito",
  aberta: "A fazer",
  andamento: "Em curso",
  feita: "Feito",
};

export const COMERCIAL = [
  { id: "interno", label: "Interno" },
  { id: "conversa", label: "Conversa" },
  { id: "proposta", label: "Proposta" },
  { id: "fechado", label: "Fechado" },
] as const;

export const LABEL_COMERCIAL: Record<string, string> = {
  interno: "Interno",
  conversa: "Conversa",
  proposta: "Proposta",
  fechado: "Fechado",
};

export const STATUS_CLIENTE: Record<string, string> = {
  conversando: "Em conversa",
  proposta: "Proposta",
  fechou: "Fechado",
  ativo: "Ativo",
  morreu: "Encerrado",
};

export const TIPO_CLIENTE: Record<string, string> = {
  lead: "Prospecto",
  cliente: "Cliente",
};

export function iniciais(nome: string) {
  const p = nome.trim().split(/\s+/).filter(Boolean);
  if (p.length === 0) {
    return "·";
  }
  if (p.length === 1) {
    return p[0].slice(0, 1).toUpperCase();
  }
  return (p[0][0] + p[p.length - 1][0]).toUpperCase();
}

export function chaveDia(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function diasDaAgenda(n = 7) {
  const hoje = chaveDia(new Date());
  const base = new Date(`${hoje}T12:00:00`);
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    return d;
  });
}
