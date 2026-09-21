#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
GROKBOT_FILE="${XDG_CONFIG_HOME:-$HOME/.config}/mai/grokbot.env"
CURSOR_FILE="${XDG_CONFIG_HOME:-$HOME/.config}/mai/cursor.env"
DISCORD_FILE="${XDG_CONFIG_HOME:-$HOME/.config}/mai/discord.env"
VENV="$ROOT/grok-bridge/.venv/bin/python"

[[ -x "$VENV" ]] || { echo "Falta o venv. Rode: bash grok-bridge/setup.sh" >&2; exit 1; }
[[ -f "$DISCORD_FILE" ]] || { echo "Falta $DISCORD_FILE. Salve o token Discord primeiro." >&2; exit 1; }
chmod 600 "$DISCORD_FILE"
# shellcheck disable=SC1090
source "$DISCORD_FILE"
if [[ -f "$GROKBOT_FILE" ]]; then
  chmod 600 "$GROKBOT_FILE"
  # shellcheck disable=SC1090
  source "$GROKBOT_FILE"
fi
export DISCORD_BOT_TOKEN
export GROK_BOT_WEBHOOK_URL="${GROK_BOT_WEBHOOK_URL:-}"
export GROK_BOT_WEBHOOK_KEY="${GROK_BOT_WEBHOOK_KEY:-}"
unset CURSOR_API_KEY
export PYTHONUNBUFFERED=1
cd "$ROOT"
exec "$VENV" -u grok-bridge/grok_chat.py
