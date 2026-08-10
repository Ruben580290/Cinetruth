set -euo pipefail

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-cine_truth-integrador}"
DB_BACKUP_USER="${DB_BACKUP_USER:-cinetruth_backup}"
: "${DB_BACKUP_PASSWORD:?Falta definir DB_BACKUP_PASSWORD}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="${BACKUP_DIR:-$SCRIPT_DIR/backups}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"

mkdir -p "$BACKUP_DIR"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
FILENAME="$BACKUP_DIR/cinetruth_${TIMESTAMP}.dump"
LOGFILE="$BACKUP_DIR/backup.log"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOGFILE"
}

log "Iniciando respaldo -> $FILENAME"

if PGPASSWORD="$DB_BACKUP_PASSWORD" pg_dump \
  -h "$DB_HOST" -p "$DB_PORT" -U "$DB_BACKUP_USER" -d "$DB_NAME" \
  -F c -f "$FILENAME"
then
  SIZE=$(du -h "$FILENAME" | cut -f1)
  log "Respaldo completado correctamente ($SIZE)"
else
  log "ERROR: el respaldo fallo -- revisar conexion/credenciales"
  exit 1
fi

DELETED=$(find "$BACKUP_DIR" -name "cinetruth_*.dump" -mtime "+$RETENTION_DAYS" -print -delete | wc -l)
log "Limpieza: $DELETED respaldo(s) con mas de $RETENTION_DAYS dias eliminado(s)"
