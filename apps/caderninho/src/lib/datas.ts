export function semanaIso(date = new Date()): string {
  const tmp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = tmp.getUTCDay() || 7;
  tmp.setUTCDate(tmp.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((tmp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${tmp.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

export const TZ = "America/Sao_Paulo";
const OFFSET_SP = "-03:00";

export function instanteSp(dia: string, hora = "00:00") {
  const h = hora.length === 5 ? `${hora}:00` : hora;
  return new Date(`${dia}T${h}${OFFSET_SP}`);
}

export function adicionarDias(dia: string, n: number) {
  const [y, m, d] = dia.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + n));
  return dt.toISOString().slice(0, 10);
}

export function tipoUteis(dia: string) {
  const w = instanteSp(dia, "12:00").getUTCDay();
  return w !== 0 && w !== 6;
}

export function inicioMes(dia: string) {
  return `${dia.slice(0, 7)}-01`;
}

export function diasDoMes(ano: number, mes: number) {
  const primeiro = `${ano}-${String(mes).padStart(2, "0")}-01`;
  const w = instanteSp(primeiro, "12:00").getUTCDay();
  const startShift = (w + 6) % 7;
  const grade: string[] = [];
  let cursor = adicionarDias(primeiro, -startShift);
  for (let i = 0; i < 42; i += 1) {
    grade.push(cursor);
    cursor = adicionarDias(cursor, 1);
  }
  return grade;
}

export function nomeMes(dia: string) {
  return instanteSp(dia, "12:00").toLocaleDateString("pt-BR", {
    timeZone: TZ,
    month: "long",
    year: "numeric",
  });
}

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

export function formatarQuando(date: Date) {
  const data = date.toLocaleDateString("pt-BR", {
    timeZone: TZ,
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  return `${data} · ${formatarHora(date)}`;
}

export function formatarQuandoCheio(date: Date) {
  return `${formatarQuando(date)} · ${haQuanto(date)}`;
}

export function formatarQuandoCurto(date: Date) {
  if (chaveDia(date) === chaveDia(new Date())) {
    return formatarHora(date);
  }
  return formatarQuando(date);
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

export function riscoAtraso(status: string, prazo: Date | null, horas = 48): boolean {
  if (concluida(status) || !prazo || atrasada(status, prazo)) {
    return false;
  }
  const falta = prazo.getTime() - Date.now();
  return falta >= 0 && falta <= horas * 3600 * 1000;
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

export const ORDEM_STATUS_CLIENTE = [
  "prospeccao",
  "conversando",
  "proposta",
  "fechou",
  "ativo",
  "pausado",
  "morreu",
] as const;

export const STATUS_CLIENTE: Record<string, string> = {
  prospeccao: "Prospecção",
  conversando: "Em conversa",
  proposta: "Proposta",
  fechou: "Fechado",
  ativo: "Ativo",
  pausado: "Em pausa",
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

export function paraInputHora(date: Date | null) {
  if (!date) {
    return "09:00";
  }
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

export function formatarHora(date: Date) {
  return paraInputHora(date);
}

export function prazoDe(raw: string) {
  if (!raw) {
    return instanteSp(chaveDia(new Date()), "18:00");
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return instanteSp(raw, "18:00");
  }
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(raw)) {
    const [dia, resto] = raw.split("T");
    return instanteSp(dia, resto.slice(0, 5));
  }
  return new Date(raw);
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
  return Array.from({ length: n }, (_, i) => {
    return instanteSp(adicionarDias(hoje, i), "12:00");
  });
}
