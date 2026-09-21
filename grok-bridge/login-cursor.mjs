#!/usr/bin/env node
import { mkdirSync, writeFileSync, chmodSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { Cursor } from "@cursor/sdk";

const configDir = join(process.env.XDG_CONFIG_HOME || join(homedir(), ".config"), "mai");
const configFile = join(configDir, "cursor.env");

const result = await Cursor.auth.login({
  apiKeyName: "MAI Discord Grok",
  onLoginUrl: (url) => {
    console.log("Abra este link, entre na conta Cursor e autorize:");
    console.log(url);
  },
});

mkdirSync(configDir, { recursive: true, mode: 0o700 });
writeFileSync(configFile, `CURSOR_API_KEY=${JSON.stringify(result.apiKey)}\n`, { mode: 0o600 });
chmodSync(configFile, 0o600);
console.log("Chave Cursor salva em", configFile);
if (result.email) console.log("Conta:", result.email);
console.log("Não cole essa chave no Discord nem no GitHub.");
