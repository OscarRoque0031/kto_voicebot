#!/bin/bash

echo "=== TEST RUN van dagelijkse backup ==="
echo "Huidige tijd: $(date)"
echo ""

# Test het backup script
/Users/oscarroque/Documents/GitHub/kto_voicebot/git-backup.sh

echo ""
echo "=== Bekijk de log file ==="
if [ -f "/var/log/git-backup.log" ]; then
    tail -20 /var/log/git-backup.log
else
    echo "Log file nog niet aangemaakt"
fi
