#!/usr/bin/env bash
set -euo pipefail

CONFIG_FILE="${XDG_CONFIG_HOME:-$HOME/.config}/mai/discord.env"
PROJECT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"

if [[ ! -f "$CONFIG_FILE" ]]; then
  echo "Token não configurado. Execute primeiro:" >&2
  echo "  bash discord-organizer/save-token.sh" >&2
  exit 1
fi

if [[ "$(stat -c '%a' "$CONFIG_FILE")" != "600" ]]; then
  echo "Erro: o arquivo do token não está protegido com permissão 600." >&2
  chmod 600 "$CONFIG_FILE"
fi

# shellcheck disable=SC1090
source "$CONFIG_FILE"
export DISCORD_BOT_TOKEN

cd "$PROJECT_DIR"
if [[ ! -x discord-organizer/.venv/bin/python ]]; then
  echo "Ambiente Python não encontrado. Execute a instalação documentada no README." >&2
  exit 1
fi

exec discord-organizer/.venv/bin/python discord-organizer/organize_server.py
