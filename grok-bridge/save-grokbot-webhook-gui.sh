#!/usr/bin/env bash
set -euo pipefail
CONFIG_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/mai"
CONFIG_FILE="$CONFIG_DIR/grokbot.env"
umask 077
mkdir -p "$CONFIG_DIR"
export DISPLAY="${DISPLAY:-:0}"
export XAUTHORITY="${XAUTHORITY:-$HOME/.Xauthority}"

form="$(
  zenity --forms \
    --title="MAI — rotina Grok Bot" \
    --text="Cola a URL POST to e a key da rotina webhook. Não aparece neste chat." \
    --add-entry="POST to (URL)" \
    --add-password="key" \
    --separator=$'\n' || true
)"
url="$(printf '%s\n' "$form" | sed -n '1p')"
key="$(printf '%s\n' "$form" | sed -n '2p')"
if [[ -z "$url" || -z "$key" ]]; then
  zenity --error --title="MAI" --text="Nada salvo." || true
  exit 1
fi
printf 'GROK_BOT_WEBHOOK_URL=%q\nGROK_BOT_WEBHOOK_KEY=%q\n' "$url" "$key" > "$CONFIG_FILE"
chmod 600 "$CONFIG_FILE"
zenity --info --title="MAI" --text="Rotina Grok Bot salva neste PC. O Discord passa a gastar Grok Bot." || true
echo OK
