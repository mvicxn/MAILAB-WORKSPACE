import { COMERCIAL, STATUS_CLIENTE, statusCanon } from "@/lib/datas";
import {
  ehHumano,
  podeBackup,
  podeCriarTarefa,
  podeEscreverCliente,
} from "@/lib/equipe";

export type SessaoMini = {
  id: string;
  papel: string;
  tipo: string;
  ficha: string;
};

export type Falha = { ok: false; erro: string };
export type Ok<T = Record<string, never>> = { ok: true } & T;
export type Resultado<T = Record<string, never>> = Ok<T> | Falha;

export function falha(erro: string): Falha {
  return { ok: false, erro };
}

export function ok<T extends Record<string, unknown>>(extra?: T): Ok<T> {
  return { ok: true, ...(extra ?? ({} as T)) };
}

export function assertHumano(user: SessaoMini): Falha | null {
  if (!ehHumano(user.papel, user.tipo)) {
    return falha("só sócio faz isso");
  }
  return null;
}

export function assertCliente(user: SessaoMini): Falha | null {
  if (!podeEscreverCliente(user.papel, user.tipo)) {
    return falha("só sócio escreve cliente");
  }
  return null;
}

export function assertTarefa(user: SessaoMini): Falha | null {
  if (!podeCriarTarefa(user.papel, user.ficha, user.tipo)) {
    return falha("sem permissão para tarefa");
  }
  return null;
}

export function assertBackup(user: SessaoMini): Falha | null {
  if (!podeBackup(user.papel, user.tipo)) {
    return falha("só sócio faz backup");
  }
  return null;
}

export function assertProjeto(user: SessaoMini): Falha | null {
  if (!ehHumano(user.papel, user.tipo) && user.ficha !== "ceo") {
    return falha("sem permissão para projeto");
  }
  return null;
}

export function comercialCanon(v: string) {
  return COMERCIAL.some((c) => c.id === v) ? v : "interno";
}

export function statusClienteCanon(v: string) {
  return STATUS_CLIENTE[v] ? v : "conversando";
}

export function tipoClienteCanon(v: string) {
  return v === "cliente" ? "cliente" : "lead";
}

export function statusProjetoCanon(v: string) {
  return v === "pausado" || v === "concluido" || v === "aberto" ? v : "aberto";
}

export function idSeguro(v: string) {
  return /^[a-z0-9]{16,40}$/i.test(v.trim());
}

export function statusTarefaCanon(v: string) {
  return statusCanon(v);
}
