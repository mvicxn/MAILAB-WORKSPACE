#!/usr/bin/env bash
set -euo pipefail

CONFIG_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/mai"
CONFIG_FILE="$CONFIG_DIR/cursor.env"
umask 077
mkdir -p "$CONFIG_DIR"

export DISPLAY="${DISPLAY:-:0}"

key="$(
  zenity --password \
    --title="MAI — cola a chave Cursor" \
    --text="Cola a chave da API Cursor (dashboard → API Keys). Ela não aparece na tela nem no chat." \
    --width=480 || true
)"

if [[ -z "${key}" ]]; then
  zenity --error --title="MAI" --text="Nada salvo. Janela cancelada ou chave vazia." || true
  exit 1
fi

printf 'CURSOR_API_KEY=%q\n' "$key" > "$CONFIG_FILE"
chmod 600 "$CONFIG_FILE"
unset key

zenity --info --title="MAI" --text="Chave salva só neste computador.\nPode fechar esta janela — eu ligo o bot." || true
echo "OK"
