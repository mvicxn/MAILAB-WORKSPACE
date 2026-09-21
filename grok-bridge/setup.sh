#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
VENV="$ROOT/grok-bridge/.venv"
python3 -m venv "$VENV"
"$VENV/bin/pip" install -U pip
"$VENV/bin/pip" install -r "$ROOT/grok-bridge/requirements.txt"
echo "Pronto. Depois: bash grok-bridge/save-cursor-key.sh && bash grok-bridge/run-saved.sh"
