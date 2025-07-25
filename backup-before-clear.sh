#!/bin/bash

# Database backup script voor KTO Voicebot
# Gebruik dit script VOORDAT je de database leegmaakt

DB_HOST="localhost"
DB_USER="dashboarduser"
DB_NAME="kto_dashboard"
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="kto_backup_${DATE}.sql"

echo "=== KTO Database Backup Script ==="
echo "Datum: $(date)"
echo ""

# Maak backup directory aan
mkdir -p $BACKUP_DIR

# Vraag om database password
echo "Database backup maken..."
read -s -p "Database password voor $DB_USER: " DB_PASSWORD
echo ""

# Maak backup
echo "Backup aanmaken: $BACKUP_FILE"
mysqldump -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME > "$BACKUP_DIR/$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Backup succesvol aangemaakt: $BACKUP_DIR/$BACKUP_FILE"
    echo "Bestandsgrootte: $(du -h "$BACKUP_DIR/$BACKUP_FILE" | cut -f1)"
    
    # Toon wat er in de backup zit
    echo ""
    echo "Backup inhoud:"
    echo "- Beoordelingen: $(grep -c "INSERT INTO \`beoordelingen\`" "$BACKUP_DIR/$BACKUP_FILE") records"
    echo "- Gebruikers: $(grep -c "INSERT INTO \`gebruikers\`" "$BACKUP_DIR/$BACKUP_FILE") records"
    
else
    echo "❌ Backup gefaald!"
    exit 1
fi

echo ""
echo "=== Database Clear Opties ==="
echo "1. Alle beoordelingen wissen:"
echo "   mysql -h $DB_HOST -u $DB_USER -p$DB_NAME -e 'DELETE FROM beoordelingen;'"
echo ""
echo "2. Specifieke voicebot wissen:"
echo "   mysql -h $DB_HOST -u $DB_USER -p$DB_NAME -e \"DELETE FROM beoordelingen WHERE voicebot_naam='KTO 0031 ICT';\""
echo ""
echo "3. Via web interface:"
echo "   Ga naar: http://136.144.185.121:4000/dashboard/admin"
