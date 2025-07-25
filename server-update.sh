#!/bin/bash

# Server Update Script voor KTO Voicebot
# Gebruik dit script om de nieuwste wijzigingen naar de server te uploaden

echo "=== KTO Voicebot Server Update ==="
echo "Datum: $(date)"
echo ""

# Upload files naar server
echo "📤 Uploaden van bestanden naar server..."
scp index.js support0031ictnl@136.144.185.121:~/index.js.new
scp database-admin.html support0031ictnl@136.144.185.121:~/database-admin.html.new
scp dashboard.html support0031ictnl@136.144.185.121:~/dashboard.html.new

echo ""
echo "� Voer nu de volgende commando's uit op de server:"
echo "   ssh support0031ictnl@136.144.185.121"
echo "   sudo pkill -f node"
echo "   sudo cp ~/index.js.new /root/kto-api/index.js"
echo "   sudo cp ~/database-admin.html.new /root/kto-api/database-admin.html" 
echo "   sudo cp ~/dashboard.html.new /root/kto-api/dashboard.html"
echo "   cd /root/kto-api"
echo "   sudo nohup node index.js > server.log 2>&1 &"
echo ""

echo "� Controleer de server status met:"
echo "   curl http://localhost:3000/api/status"
echo "   curl http://136.144.185.121:3000/api/status"
echo ""
echo "🌐 Dashboard bereikbaar op: http://136.144.185.121:3000"
echo "🗑️ Database beheer: http://136.144.185.121:3000/dashboard/admin"
echo ""
echo "📝 Nieuwe features in deze update:"
echo "   - Database Beheer Interface"
echo "   - Admin button op dashboard (alleen beheerders)"
echo "   - Veilige database clearing opties"
echo "   - Real-time statistieken"
echo "   - JavaScript en Node.js fouten opgelost"
