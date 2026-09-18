#!/usr/bin/env bash
set -euo pipefail

CONFIG_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/mai"
CONFIG_FILE="$CONFIG_DIR/grok.env"
umask 077
mkdir -p "$CONFIG_DIR"
read -r -s -p "Cole a chave da API xAI e pressione Enter: " key
printf '\n'
[[ -n "$key" ]] || { echo "Erro: chave vazia." >&2; exit 1; }
printf 'XAI_API_KEY=%q\n' "$key" > "$CONFIG_FILE"
chmod 600 "$CONFIG_FILE"
unset key
echo "Chave xAI salva com permissão 600 em $CONFIG_FILE."
