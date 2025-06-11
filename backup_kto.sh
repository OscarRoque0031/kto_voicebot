#!/bin/bash

# Configuratie - pas aan waar nodig
PROJECT_DIR="/root/kto-api"
DB_NAME="kto_dashboard"
DB_USER="dashboarduser"
DB_PASS="6FuHOCYfocqyam-"

# Datum voor bestandsnamen
DATE=$(date +%Y%m%d_%H%M%S)

# Tijdelijke folder voor backup bestanden
TMP_BACKUP_DIR="/root/backup_kto_$DATE"
mkdir -p "$TMP_BACKUP_DIR"

echo "Backup starten..."

# Backup projectmap
tar czf "$TMP_BACKUP_DIR/kto-api-$DATE.tar.gz" -C "$(dirname "$PROJECT_DIR")" "$(basename "$PROJECT_DIR")"
echo "Projectmap gebackupt."

# Backup database
mysqldump -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" > "$TMP_BACKUP_DIR/kto_dashboard_$DATE.sql"
if [ $? -eq 0 ]; then
  echo "Database succesvol geëxporteerd."
else
  echo "Fout bij exporteren database!"
  exit 1
fi

# Combineer alles in één archief
FINAL_BACKUP="/root/kto_complete_backup_$DATE.tar.gz"
tar czf "$FINAL_BACKUP" -C "$TMP_BACKUP_DIR" .
echo "Alle backups gecombineerd in: $FINAL_BACKUP"

# Opruimen
rm -rf "$TMP_BACKUP_DIR"
echo "Tijdelijke bestanden verwijderd."

echo "Backup voltooid."
