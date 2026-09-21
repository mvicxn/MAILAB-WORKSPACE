import { createServer } from "node:http";
import { homedir } from "node:os";
import { join } from "node:path";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { Agent, CursorAgentError } from "@cursor/sdk";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "../../..");
const PORT = Number(process.env.CURSOR_CASA_PORT || 5859);

function chaveCursor() {
  const dest = join(homedir(), ".config/mai/cursor.env");
  const raw = readFileSync(dest, "utf8");
  for (const line of raw.split("\n")) {
    if (!line.includes("=") || line.trim().startsWith("#")) {
      continue;
    }
    const [k, ...rest] = line.split("=");
    if (k.trim() !== "CURSOR_API_KEY") {
      continue;
    }
    let v = rest.join("=").trim();
    if ((v.startsWith("'") && v.endsWith("'")) || (v.startsWith('"') && v.endsWith('"'))) {
      v = v.slice(1, -1);
    }
    return v;
  }
  throw new Error("falta CURSOR_API_KEY em ~/.config/mai/cursor.env");
}

let ocupado = false;
const fila = [];

function enfileirar(job) {
  fila.push(job);
  void bombear();
}

async function bombear() {
  if (ocupado) {
    return;
  }
  const job = fila.shift();
  if (!job) {
    return;
  }
  ocupado = true;
  try {
    await executar(job);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "falhou";
    await relatar(job, `## Cursor da casa\n\nFalhou: ${msg}`);
  } finally {
    ocupado = false;
    void bombear();
  }
}

async function executar(job) {
  const apiKey = chaveCursor();
  const prompt = `
Você é o Cursor da MAI LAB CORP neste repositório (${ROOT}).

Pedido de ${job.nome} · ${job.funcao}
Tarefa: ${job.titulo || job.tarefaId}

${job.pedido}

Regras:
- Implemente de verdade. Edite os arquivos necessários.
- Não leia nem escreva .env, ~/.config/mai, senhas, tokens, chaves.
- Não faça git push. Não faça merge. Não use --force.
- Commit local só se o pedido pedir commit explicitamente.
- No final, descreva em Markdown: o que mudou, arquivos tocados, o que o sócio deve revisar.
`.trim();

  const result = await Agent.prompt(prompt, {
    apiKey,
    model: { id: "composer-2.5" },
    local: { cwd: ROOT },
  });

  const texto =
    result.status === "finished"
      ? String(result.result || "Cursor aplicou o pedido neste PC.")
      : `Cursor rodou e saiu com status ${result.status}.`;
  await relatar(job, `## Cursor da casa\n\n${texto}`);
}

async function relatar(job, texto) {
  const url = job.entrega_url || "http://127.0.0.1:3000/api/mesa/entrega";
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: job.email,
      senha: job.senha,
      tarefaId: job.tarefaId,
      texto,
    }),
  });
}

const server = createServer(async (req, res) => {
  if (req.method === "GET" && (req.url === "/" || req.url === "/saude")) {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, fila: fila.length, ocupado }));
    return;
  }
  if (req.method !== "POST" || req.url !== "/job") {
    res.writeHead(404);
    res.end();
    return;
  }
  const chunks = [];
  for await (const c of req) {
    chunks.push(c);
  }
  let body = {};
  try {
    body = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
  } catch {
    res.writeHead(400);
    res.end(JSON.stringify({ erro: "json inválido" }));
    return;
  }
  if (!body.pedido || !body.tarefaId || !body.email || !body.senha) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ erro: "falta pedido, tarefaId, email, senha" }));
    return;
  }
  enfileirar(body);
  res.writeHead(202, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ ok: true, fila: fila.length + (ocupado ? 1 : 0) }));
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Cursor da casa na porta ${PORT} · repo ${ROOT}`);
});
