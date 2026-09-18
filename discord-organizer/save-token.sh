#!/usr/bin/env bash
set -euo pipefail

CONFIG_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/mai"
CONFIG_FILE="$CONFIG_DIR/discord.env"

umask 077
mkdir -p "$CONFIG_DIR"

read -r -s -p "Cole o token do bot e pressione Enter: " token
printf '\n'

if [[ -z "$token" ]]; then
  echo "Erro: token vazio." >&2
  exit 1
fi

printf 'DISCORD_BOT_TOKEN=%q\n' "$token" > "$CONFIG_FILE"
chmod 600 "$CONFIG_FILE"
unset token

echo "Token salvo em $CONFIG_FILE com permissão 600."
echo "O arquivo fica fora do repositório e não será enviado ao GitHub."
