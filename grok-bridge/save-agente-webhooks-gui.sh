#!/usr/bin/env bash
set -euo pipefail
CONFIG_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/mai"
CONFIG_FILE="$CONFIG_DIR/grokbot-agentes.env"
umask 077
mkdir -p "$CONFIG_DIR"
export DISPLAY="${DISPLAY:-:0}"
export XAUTHORITY="${XAUTHORITY:-$HOME/.Xauthority}"

cargos=(
  "ceo|Carlos"
  "produto|Produto"
  "pesquisa|Pesquisa"
  "design|Design"
  "dev|Dev"
  "marketing|Marketing"
  "financeiro|Financeiro"
  "juridico|Jurídico"
  "qa|André"
  "seguranca|Segurança"
  "operacoes|Operações"
)

tmp="$(mktemp)"
trap 'rm -f "$tmp"' EXIT
if [[ -f "$CONFIG_FILE" ]]; then
  cp "$CONFIG_FILE" "$tmp"
else
  : > "$tmp"
fi

for item in "${cargos[@]}"; do
  ficha="${item%%|*}"
  nome="${item#*|}"
  form="$(
    zenity --forms \
      --title="MAI — webhook $nome" \
      --text="Cola POST to e key da rotina webhook do Bot $nome. Cancelar pula este cargo." \
      --add-entry="POST to (URL)" \
      --add-password="key" \
      --separator=$'\n' || true
  )"
  url="$(printf '%s\n' "$form" | sed -n '1p')"
  key="$(printf '%s\n' "$form" | sed -n '2p')"
  if [[ -z "$url" || -z "$key" ]]; then
    continue
  fi
  upper="$(printf '%s' "$ficha" | tr '[:lower:]' '[:upper:]')"
  grep -v "^GROK_WEBHOOK_URL_${upper}=" "$tmp" | grep -v "^GROK_WEBHOOK_KEY_${upper}=" > "${tmp}.n" || true
  mv "${tmp}.n" "$tmp"
  printf 'GROK_WEBHOOK_URL_%s=%q\nGROK_WEBHOOK_KEY_%s=%q\n' "$upper" "$url" "$upper" "$key" >> "$tmp"
done

mv "$tmp" "$CONFIG_FILE"
chmod 600 "$CONFIG_FILE"
trap - EXIT
zenity --info --title="MAI" --text="Webhooks de cargo salvos neste PC. Religa o Discord: bash grok-bridge/run-saved.sh" || true
echo OK
