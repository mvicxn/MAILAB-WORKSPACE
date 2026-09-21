import { adicionarDias, chaveDia, instanteSp, tipoUteis } from "./datas";

export const TIPOS_EVENTO = [
  { id: "reuniao", label: "Reunião", cor: "#1b463c" },
  { id: "entrega", label: "Entrega", cor: "#9a7840" },
  { id: "tarefa", label: "Tarefa", cor: "#2f6d5c" },
  { id: "ligacao", label: "Ligação", cor: "#5a6b8a" },
  { id: "visita", label: "Visita", cor: "#7a4e3a" },
  { id: "pessoal", label: "Pessoal", cor: "#6d6559" },
  { id: "outro", label: "Outro", cor: "#9a7840" },
] as const;

export type TipoEvento = (typeof TIPOS_EVENTO)[number]["id"];

export type Recorrencia = {
  freq: "diaria" | "uteis" | "semanal" | "quinzenal" | "mensal" | "anual";
  interval?: number;
  weekdays?: number[];
  until?: string;
  count?: number;
};

export type Ocorrencia = {
  id: string;
  eventoId: string;
  titulo: string;
  descricao: string;
  inicio: string;
  fim: string;
  dia: string;
  diaInteiro: boolean;
  userId: string;
  clienteId: string | null;
  projetoId: string | null;
  tarefaId: string | null;
  local: string;
  link: string;
  status: string;
  prioridade: string;
  cor: string;
  tipo: string;
  serie: boolean;
  origem: "evento" | "tarefa" | "projeto";
};

export function parseRecorrencia(raw: string): Recorrencia | null {
  if (!raw.trim()) {
    return null;
  }
  try {
    const j = JSON.parse(raw) as Recorrencia;
    if (!j.freq) {
      return null;
    }
    return j;
  } catch {
    return null;
  }
}

function avanca(dia: string, rec: Recorrencia): string | null {
  const n = rec.interval && rec.interval > 0 ? rec.interval : 1;
  if (rec.freq === "diaria") {
    return adicionarDias(dia, n);
  }
  if (rec.freq === "uteis") {
    let d = adicionarDias(dia, 1);
    let guard = 0;
    while (guard < 14 && !tipoUteis(d)) {
      d = adicionarDias(d, 1);
      guard += 1;
    }
    return d;
  }
  if (rec.freq === "semanal") {
    return adicionarDias(dia, 7 * n);
  }
  if (rec.freq === "quinzenal") {
    return adicionarDias(dia, 14 * n);
  }
  if (rec.freq === "mensal") {
    const [y, m, dd] = dia.split("-").map(Number);
    const dt = new Date(Date.UTC(y, m - 1 + n, dd));
    return dt.toISOString().slice(0, 10);
  }
  if (rec.freq === "anual") {
    const [y, m, dd] = dia.split("-").map(Number);
    return `${y + n}-${String(m).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
  }
  return null;
}

function weekdaySp(dia: string) {
  return instanteSp(dia, "12:00").getUTCDay();
}

export function expandirSerie(opts: {
  id: string;
  titulo: string;
  descricao: string;
  inicio: Date;
  fim: Date;
  diaInteiro: boolean;
  userId: string;
  clienteId: string | null;
  projetoId: string | null;
  tarefaId: string | null;
  local: string;
  link: string;
  status: string;
  prioridade: string;
  cor: string;
  tipo: string;
  recorrencia: string;
  excecoes: string[];
  de: string;
  ate: string;
}): Ocorrencia[] {
  const rec = parseRecorrencia(opts.recorrencia);
  const dur = opts.fim.getTime() - opts.inicio.getTime();
  const seed = chaveDia(opts.inicio);
  const skip = new Set(opts.excecoes);
  const out: Ocorrencia[] = [];
  const max = rec?.count && rec.count > 0 ? Math.min(rec.count, 400) : 400;
  let dia = seed;
  let n = 0;
  while (dia && n < max && dia <= opts.ate) {
    const weekOk =
      !rec ||
      rec.freq !== "semanal" ||
      !rec.weekdays?.length ||
      rec.weekdays.includes(weekdaySp(dia));
    const uteisOk = rec?.freq !== "uteis" || tipoUteis(dia);
    if (dia >= opts.de && !skip.has(dia) && weekOk && uteisOk) {
      const ini = opts.diaInteiro ? instanteSp(dia, "00:00") : instanteSp(dia, horaSp(opts.inicio));
      const fim = new Date(ini.getTime() + Math.max(dur, 15 * 60 * 1000));
      out.push({
        id: rec ? `${opts.id}:${dia}` : opts.id,
        eventoId: opts.id,
        titulo: opts.titulo,
        descricao: opts.descricao,
        inicio: ini.toISOString(),
        fim: fim.toISOString(),
        dia,
        diaInteiro: opts.diaInteiro,
        userId: opts.userId,
        clienteId: opts.clienteId,
        projetoId: opts.projetoId,
        tarefaId: opts.tarefaId,
        local: opts.local,
        link: opts.link,
        status: opts.status,
        prioridade: opts.prioridade,
        cor: opts.cor,
        tipo: opts.tipo,
        serie: Boolean(rec),
        origem: "evento",
      });
    }
    n += 1;
    if (!rec) {
      break;
    }
    if (rec.until && dia >= rec.until) {
      break;
    }
    const next = avanca(dia, rec);
    if (!next || next === dia) {
      break;
    }
    dia = next;
  }
  return out;
}

function horaSp(d: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
}

export function corDoTipo(tipo: string) {
  return TIPOS_EVENTO.find((t) => t.id === tipo)?.cor ?? "#9a7840";
}
