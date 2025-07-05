#!/bin/bash

# Dagelijkse Git backup script voor KTO Voicebot
LOG_FILE="/var/log/git-backup.log"

echo "=== Git Backup gestart op $(date) ===" >> $LOG_FILE

# Ga naar de juiste directory
cd /Users/oscarroque/Documents/GitHub/kto_voicebot || {
    echo "FOUT: Kan niet naar project directory" >> $LOG_FILE
    exit 1
}

# Check of we in een git repository zitten
if [ ! -d ".git" ]; then
    echo "FOUT: Geen git repository gevonden" >> $LOG_FILE
    exit 1
fi

# Check git status
git status >> $LOG_FILE 2>&1

# Voeg alle bestanden toe (behalve die in .gitignore)
git add . >> $LOG_FILE 2>&1

# Check of er iets te committen valt
if git diff --staged --quiet; then
    echo "Geen wijzigingen om te committen" >> $LOG_FILE
else
    # Commit met timestamp
    git commit -m "Automatische dagelijkse backup $(date '+%Y-%m-%d %H:%M:%S')" >> $LOG_FILE 2>&1
    
    # Push naar GitHub (gebruik main branch als master niet bestaat)
    if git push origin main >> $LOG_FILE 2>&1; then
        echo "Backup succesvol gepusht naar main branch" >> $LOG_FILE
    elif git push origin master >> $LOG_FILE 2>&1; then
        echo "Backup succesvol gepusht naar master branch" >> $LOG_FILE
    else
        echo "FOUT: Push gefaald" >> $LOG_FILE
        exit 1
    fi
fi

echo "=== Git Backup voltooid op $(date) ===" >> $LOG_FILE
echo "" >> $LOG_FILE
