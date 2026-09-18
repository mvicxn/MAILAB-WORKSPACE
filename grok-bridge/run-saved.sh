#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
XAI_FILE="${XDG_CONFIG_HOME:-$HOME/.config}/mai/grok.env"
DISCORD_FILE="${XDG_CONFIG_HOME:-$HOME/.config}/mai/discord.env"
[[ -f "$XAI_FILE" ]] || { echo "Falta $XAI_FILE. Execute save-xai-key.sh." >&2; exit 1; }
[[ -f "$DISCORD_FILE" ]] || { echo "Falta $DISCORD_FILE. Salve o token Discord primeiro." >&2; exit 1; }
chmod 600 "$XAI_FILE" "$DISCORD_FILE"
source "$XAI_FILE"
source "$DISCORD_FILE"
export XAI_API_KEY DISCORD_BOT_TOKEN
cd "$ROOT"
exec discord-organizer/.venv/bin/python grok-bridge/grok_chat.py
