import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { CARGOS } from "@/lib/equipe";
import { manualCarlos } from "@/lib/carlos-vivo";

export type RecadoGrok = {
  ficha: string;
  email: string;
  senha: string;
  nome: string;
  funcao: string;
  mesa: string;
  escritorio_url: string;
  tarefa_id?: string;
  tarefa_url?: string;
  tarefa_titulo?: string;
    entrega_url?: string;
    cursor_url?: string;
  recado: string;
  conversa_id?: string;
  historico?: { papel: string; texto: string }[];
  resposta_url?: string;
  modo?: "tarefa" | "chat";
};

function pastaMai() {
  return path.join(os.homedir(), ".config", "mai");
}

async function lerEnv(nome: string) {
  const dest = path.join(pastaMai(), nome);
  const data: Record<string, string> = {};
  try {
    const raw = await fs.readFile(dest, "utf8");
    for (const line of raw.split("\n")) {
      if (!line.includes("=") || line.trim().startsWith("#")) {
        continue;
      }
      const [k, ...rest] = line.split("=");
      data[k.trim()] = unquote(rest.join("="));
    }
  } catch {
    return data;
  }
  return data;
}

function unquote(v: string) {
  const t = v.trim();
  if ((t.startsWith("'") && t.endsWith("'")) || (t.startsWith('"') && t.endsWith('"'))) {
    return t.slice(1, -1);
  }
  return t;
}

async function configs() {
  const a = await lerEnv("funcionarios.env");
  const b = await lerEnv("mailab.env");
  const c = await lerEnv("grokbot-agentes.env");
  const d = await lerEnv("escritorio.env");
  return { ...a, ...b, ...c, ...d };
}

export async function urlDoEscritorio() {
  const env = await configs();
  return unquote(env.MAI_ESCRITORIO_URL || "") || "http://127.0.0.1:3000";
}

export async function hookDoCargo(ficha: string) {
  const env = await configs();
  const up = ficha.toUpperCase();
  const url =
    unquote(env[`GROK_WEBHOOK_URL_${up}`] || "") ||
    unquote(env.MAI_LAB_WEBHOOK_URL || "");
  const key =
    unquote(env[`GROK_WEBHOOK_KEY_${up}`] || "") ||
    unquote(env.MAI_LAB_WEBHOOK_KEY || "");
  const senha = unquote(env[`MAI_SENHA_${up}`] || "");
  const escritorio = unquote(env.MAI_ESCRITORIO_URL || "") || "http://127.0.0.1:3000";
  return { url, key, senha, escritorio };
}

export async function rotinaMailabLigada() {
  const hook = await hookDoCargo("ceo");
  return Boolean(hook.url && hook.key);
}

export async function gravarRotinaMailab(url: string, key: string) {
  const dest = path.join(pastaMai(), "mailab.env");
  await fs.mkdir(pastaMai(), { recursive: true, mode: 0o700 });
  const linhas = [
    "# MAI LAB — rotina webhook do escritório. Fora do Git. Permissão 600.",
    "# Não é a rotina Discord MAI.",
    `MAI_LAB_WEBHOOK_URL=${JSON.stringify(url)}`,
    `MAI_LAB_WEBHOOK_KEY=${JSON.stringify(key)}`,
    "",
  ];
  await fs.writeFile(dest, linhas.join("\n"), { mode: 0o600 });
  return dest;
}

export async function acordarGrok(recado: RecadoGrok) {
  const hook = await hookDoCargo(recado.ficha);
  if (!hook.url || !hook.key) {
    return {
      ok: false as const,
      erro: "Falta a rotina MAI LAB neste PC. Em Equipe, cole POST to e key. Não use a rotina Discord.",
    };
  }
  const casa = recado.escritorio_url || hook.escritorio;
  const entrega = recado.entrega_url || `${casa.replace(/\/$/, "")}/api/mesa/entrega`;
  const resposta = recado.resposta_url || `${casa.replace(/\/$/, "")}/api/mesa/chat`;
  const cursor = recado.cursor_url || `${casa.replace(/\/$/, "")}/api/mesa/cursor`;
  const body = {
    origem: recado.modo === "chat" ? "mai-lab-chat" : "mai-lab",
    rotina: "MAI LAB",
    agent_id: recado.ficha,
    speaker: recado.nome,
    escritorio_url: casa,
    escritorio_email: recado.email,
    escritorio_senha: recado.senha || hook.senha,
    escritorio_ficha: recado.ficha,
    funcao: recado.funcao,
    mesa: recado.mesa,
    tarefa_id: recado.tarefa_id ?? null,
    tarefa_url: recado.tarefa_url ?? null,
    tarefa_titulo: recado.tarefa_titulo ?? null,
    entrega_url: entrega,
    cursor_url: cursor,
    conversa_id: recado.conversa_id ?? null,
    historico: recado.historico ?? [],
    resposta_url: resposta,
    recado: recado.recado,
    formato: "markdown",
    manual: manualCarlos(casa),
    tarefa:
      recado.modo === "chat"
        ? `CHAT ao vivo. Você É ${recado.nome}. Responda a mensagem em Markdown. Se este POST puder devolver texto, devolva a resposta. Senão POST ${resposta} com email, senha, conversaId, texto.`
        : `Despacho interno. Você É ${recado.nome}. Leia recado e manual. Código: POST ${cursor} {email, senha, tarefaId, pedido}. Entrega: POST ${entrega} com Markdown completo no diário.`,
  };
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), recado.modo === "chat" ? 60000 : 28000);
  try {
    const resp = await fetch(hook.url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${hook.key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    const raw = await resp.text();
    const texto = extrairResposta(raw);
    if (resp.status === 200) {
      return { ok: true as const, texto };
    }
    return { ok: false as const, erro: `Grok não acordou (HTTP ${resp.status}). ${raw.slice(0, 180)}` };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "falhou";
    return { ok: false as const, erro: `Ponte caiu: ${msg}` };
  } finally {
    clearTimeout(timer);
  }
}

function extrairResposta(raw: string) {
  const t = raw.trim();
  if (!t) {
    return "";
  }
  try {
    const j = JSON.parse(t) as Record<string, unknown>;
    const cand = j.message ?? j.reply ?? j.text ?? j.content ?? j.output ?? j.resposta;
    if (typeof cand === "string" && cand.trim()) {
      return cand.trim();
    }
  } catch {
    if (!t.startsWith("{") && !t.startsWith("<")) {
      return t.slice(0, 8000);
    }
  }
  return "";
}

export function cargoDaFicha(ficha: string) {
  return CARGOS.find((c) => c.ficha === ficha) ?? null;
}
