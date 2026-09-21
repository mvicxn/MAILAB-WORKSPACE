import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { CARLOS } from "@/lib/equipe";
import { manualCarlos } from "@/lib/carlos-vivo";

export type RecadoGrok = {
  email: string;
  senha: string;
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
  const c = await lerEnv("escritorio.env");
  return { ...a, ...b, ...c };
}

export async function urlDoEscritorio() {
  const env = await configs();
  return unquote(env.MAI_ESCRITORIO_URL || "") || "http://127.0.0.1:3000";
}

export async function hookDoCarlos() {
  const env = await configs();
  const url = unquote(env.MAI_LAB_WEBHOOK_URL || "");
  const key = unquote(env.MAI_LAB_WEBHOOK_KEY || "");
  const senha = unquote(env.MAI_SENHA_CARLOS || "") || unquote(env.MAI_SENHA_CEO || "");
  const escritorio = unquote(env.MAI_ESCRITORIO_URL || "") || "http://127.0.0.1:3000";
  return { url, key, senha, escritorio };
}

export async function rotinaMailabLigada() {
  const hook = await hookDoCarlos();
  return Boolean(hook.url && hook.key);
}

export async function gravarRotinaMailab(url: string, key: string) {
  const dest = path.join(pastaMai(), "mailab.env");
  await fs.mkdir(pastaMai(), { recursive: true, mode: 0o700 });
  const linhas = [
    "# MAI LAB — rotina webhook do escritório. Fora do Git. Permissão 600.",
    "# Um POST. Um Carlos. Não é a rotina Discord MAI.",
    `MAI_LAB_WEBHOOK_URL=${JSON.stringify(url)}`,
    `MAI_LAB_WEBHOOK_KEY=${JSON.stringify(key)}`,
    "",
  ];
  await fs.writeFile(dest, linhas.join("\n"), { mode: 0o600 });
  return dest;
}

export async function acordarGrok(recado: RecadoGrok) {
  const hook = await hookDoCarlos();
  if (!hook.url || !hook.key) {
    return {
      ok: false as const,
      erro: "Falta a ligação do Carlos neste PC. Em Manutenção, cole o endereço e a chave da rotina MAI LAB. Não use a rotina Discord.",
    };
  }
  const casa = recado.escritorio_url || hook.escritorio;
  const entrega = recado.entrega_url || `${casa.replace(/\/$/, "")}/api/mesa/entrega`;
  const resposta = recado.resposta_url || `${casa.replace(/\/$/, "")}/api/mesa/chat`;
  const cursor = recado.cursor_url || `${casa.replace(/\/$/, "")}/api/mesa/cursor`;
  const body = {
    origem: recado.modo === "chat" ? "mai-lab-chat" : "mai-lab",
    rotina: "MAI LAB",
    tarefaId: recado.tarefa_id ?? null,
    manual: manualCarlos(casa),
    entrega_url: entrega,
    escritorio_url: casa,
    escritorio_email: recado.email || CARLOS.email,
    escritorio_senha: recado.senha || hook.senha,
    cursor_url: cursor,
    recado: recado.recado,
    tarefa_url: recado.tarefa_url ?? null,
    tarefa_titulo: recado.tarefa_titulo ?? null,
    conversa_id: recado.conversa_id ?? null,
    historico: recado.historico ?? [],
    resposta_url: resposta,
    formato: "markdown",
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
    return { ok: false as const, erro: `Ligação caiu: ${msg}` };
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
