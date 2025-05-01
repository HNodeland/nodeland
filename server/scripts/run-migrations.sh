#!/usr/bin/env bash
set -euo pipefail

# ─── Determine project root (the server/ folder) ───────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." >/dev/null 2>&1 && pwd)"
cd "$ROOT_DIR"

# ─── Load environment variables from .env ──────────────────────────────────────
if [[ -f .env ]]; then
  set -o allexport
  source .env
  set +o allexport
else
  echo "⚠️  .env not found—please ensure DB_HOST, DB_USER, DB_PASS, DB_NAME are set."
  exit 1
fi

# ─── Point at the correct migrations directory ────────────────────────────────
MIGRATIONS_DIR="$ROOT_DIR/migrations"
if [[ ! -d "$MIGRATIONS_DIR" ]]; then
  echo "⚠️  No migrations directory at $MIGRATIONS_DIR"
  exit 1
fi

echo "🛠  Running migrations on $DB_NAME@$DB_HOST"

# ─── Apply each .sql in lex order ─────────────────────────────────────────────
for file in "$MIGRATIONS_DIR"/*.sql; do
  echo "→ Applying $(basename "$file")"
  mysql \
    --host="$DB_HOST" \
    --user="$DB_USER" \
    --password="$DB_PASS" \
    "$DB_NAME" < "$file"
done

echo "✅  All migrations applied."
