set -euo pipefail

DUMP_FILE="${1:?Uso: ./restore.sh archivo.dump}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-cine_truth-integrador}"
DB_ADMIN_USER="${DB_ADMIN_USER:-cinetruth_admin}"
: "${DB_ADMIN_PASSWORD:?Falta definir DB_ADMIN_PASSWORD}"

if [ ! -f "$DUMP_FILE" ]; then
  echo "ERROR: no existe el archivo $DUMP_FILE"
  exit 1
fi

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Restaurando $DUMP_FILE en '$DB_NAME'..."

PGPASSWORD="$DB_ADMIN_PASSWORD" pg_restore \
  -h "$DB_HOST" -p "$DB_PORT" -U "$DB_ADMIN_USER" -d "$DB_NAME" \
  --clean --if-exists --no-owner "$DUMP_FILE"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Restauracion completada"
