#!/usr/bin/env bash
# Porta grátis pra Ian e pros bots. O caderno continua neste PC.
set -euo pipefail
BIN="${HOME}/.local/bin/cloudflared"
mkdir -p "${HOME}/.local/bin" "${HOME}/.config/mai"
if [[ ! -x "$BIN" ]]; then
  echo "Baixando cloudflared (túnel grátis da Cloudflare)…"
  curl -fsSL -o "$BIN" "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64"
  chmod +x "$BIN"
fi
echo "Túnel na porta 3000. Deixa este PC ligado. Ctrl+C cai o link."
exec "$BIN" tunnel --url "http://127.0.0.1:3000" --no-autoupdate
