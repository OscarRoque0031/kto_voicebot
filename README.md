# KTO Voicebot Dashboard & API

## 📋 Dienstbeschrijving

De **KTO Voicebot** is een geavanceerd klantentevredenheidsmonitoringsysteem dat automatisch feedback verzamelt van klanten die interactie hebben gehad met voicebots. Het systeem biedt real-time dashboards en API-endpoints voor het beheren en analyseren van klanttevredenheidsdata.

## 🚀 Kernfunctionaliteiten

### 1. **Automatische Feedback Verzameling**
- Ontvangt automatisch beoordelingen van voicebot-gesprekken via webhooks
- Ondersteunt meerdere voicebot-platformen (DialoX compatibel)
- Slaat beoordelingen op met timestamp, telefoonnummer en toelichting

### 2. **Real-time Dashboard**
- **Webgebaseerd dashboard** voor het visualiseren van klanttevredenheidsdata
- **Grafana integratie** voor geavanceerde analytics en grafieken
- **Gebruikersspecifieke weergave** - gebruikers zien alleen hun eigen voicebot-data
- **Beheerdersfunctionaliteit** - volledige toegang tot alle data

### 3. **Multi-tenant Ondersteuning**
- Verschillende voicebots worden automatisch herkend via bot-ID mapping
- Gebruikers kunnen alleen hun eigen voicebot-data bekijken
- Beheerders hebben toegang tot alle voicebot-data

### 4. **Data Export & Analysis**
- **CSV export** functionaliteit voor verdere analyse
- **REST API** endpoints voor integratie met externe systemen
- **Real-time data updates** zonder pagina refresh

### 5. **Database Beheer (Beheerders)**
- **Veilige database clearing** functionaliteit voor beheerders
- **Selectief wissen** - alle data of specifieke voicebot data
- **ID teller reset** functionaliteit
- **Bevestigingssysteem** met "JA_WISSEN" verificatie
- **Real-time statistieken** in database admin interface

## 🏢 Ondersteunde Voicebots

Het systeem ondersteunt momenteel de volgende voicebots:

| Voicebot | Organisatie | Bot ID |
|----------|-------------|---------|
| **Benu Apotheken** | Benu Apotheek | `16babc5d-4d64-431f-8038-791738369818` |
| **KTO 0031 ICT** | 0031 ICT Services | `0df2ff06-074b-4be9-9068-8e7d38381406` |

*Nieuwe voicebots kunnen eenvoudig worden toegevoegd via de bot-mapping configuratie.*

## 📊 Beoordelingssysteem

Het systeem hanteert een 3-punts beoordelingssysteem:

- **1 = Goed** ✅ - Klant is tevreden met de service
- **2 = Voldoende** ⚠️ - Klant is redelijk tevreden
- **3 = Slecht** ❌ - Klant is ontevreden

Elke beoordeling kan worden aangevuld met een tekstuele toelichting voor meer context.

## 🔧 Technische Specificaties

### **Backend**
- **Node.js** met Express.js framework
- **MySQL** database voor data opslag
- **bcrypt** voor veilige wachtwoord hashing
- **express-session** voor gebruikerssessies

### **Frontend**
- **Responsive HTML/CSS/JavaScript** dashboard
- **Chart.js** voor data visualisatie
- **Grafana** integratie voor geavanceerde analytics

### **API Endpoints**

#### Publieke Endpoints
- `GET /api/status` - API status check
- `POST /api/webhook` - Webhook voor het ontvangen van beoordelingen

#### Beveiligde Dashboard Endpoints
- `GET /dashboard` - Hoofddashboard (login vereist)
- `GET /dashboard/admin` - Database beheer interface (beheerder only)
- `GET /dashboard-data` - Dashboard data (JSON)
- `GET /dashboard-csv` - Data export (CSV)
- `GET /voicebot-namen` - Lijst van voicebots (beheerder)
- `POST /dashboard/clear-data` - Database clearing (beheerder only)
- `POST /dashboard/add-user` - Nieuwe gebruiker toevoegen (beheerder)
- `GET /dashboard/is-beheerder` - Beheerder status check

#### API met API-key beveiliging
- `GET /api/beoordelingen` - Alle beoordelingen (API-key vereist)

## 🔐 Beveiligingsfeatures

### **Authenticatie & Autorisatie**
- **Session-based authenticatie** voor dashboard toegang
- **API-key beveiliging** voor externe API toegang
- **Rol-gebaseerde toegang** (gebruiker vs beheerder)
- **Bcrypt password hashing** voor veilige opslag
- **Beheerder verificatie** voor kritieke functies (support0031)

### **Database Beveiliging**
- **Bevestigingssysteem** voor destructieve operaties
- **"JA_WISSEN" verificatie** voor data clearing
- **Audit logging** van alle database wijzigingen
- **Toegangscontrole** op beheerder niveau

### **Data Bescherming**
- **Environment variabelen** voor gevoelige configuratie
- **SQL injection preventie** via prepared statements
- **Session security** met secure cookies (HTTPS ready)

## 🌐 Deployment & Configuratie

### **Poorten**
- **Poort 3000**: Node.js/Express API & Dashboard (productie)
- **Poort 3001**: Grafana Dashboard (indien geïnstalleerd)

### **Environment Variabelen**
```env
DB_HOST=localhost
DB_USER=dashboarduser  
DB_PASSWORD=***
DB_DATABASE=kto_dashboard
PORT=4000
API_KEY=***
SESSION_SECRET=***
```

### **Database Schema**
```sql
-- Gebruikers tabel
CREATE TABLE gebruikers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE,
  password_hash VARCHAR(255),
  voicebot_naam VARCHAR(100)
);

-- Beoordelingen tabel  
CREATE TABLE beoordelingen (
  id INT AUTO_INCREMENT PRIMARY KEY,
  timestamp DATETIME,
  beoordeling INT,
  beller VARCHAR(20),
  voicebot_naam VARCHAR(100),
  toelichting TEXT
);
```

## 📈 Monitoring & Logging

### **Process Management**
- **PM2** voor process management en auto-restart
- **Automatische backups** via GitHub (dagelijks om 2:00)
- **Log monitoring** voor debugging en analyse

### **Backup Strategie**
- **Dagelijkse Git backups** naar GitHub repository
- **Database logging** voor audit trails
- **Error logging** voor troubleshooting

## 🚀 Gebruik & Workflow

### **Voor Eindgebruikers**
1. **Login** op het dashboard via webbrowser
2. **Bekijk real-time data** van uw voicebot
3. **Exporteer data** naar CSV voor analyse
4. **Monitor trends** via Grafana dashboards

### **Voor Beheerders**
1. **Volledige toegang** tot alle voicebot-data
2. **Gebruikersbeheer** - nieuwe gebruikers toevoegen
3. **Database beheer** - veilig wissen van data met bevestiging
4. **Cross-voicebot analyse** en vergelijkingen
5. **Systeem monitoring** en onderhoud
6. **Real-time statistieken** en data management

### **Voor Developers**
1. **Webhook integratie** voor automatische data-invoer
2. **REST API** voor externe integraties
3. **Configureerbare bot-mappings** voor nieuwe voicebots

## 📞 Support & Contact

Voor technische ondersteuning of vragen over de KTO Voicebot service:

- **Organisatie**: 0031 ICT Services
- **Project**: KTO Voicebot Dashboard
- **Repository**: GitHub - kto_voicebot

## 📝 Licentie

Dit project is ontwikkeld door 0031 ICT Services voor interne gebruik en klantendienstverlening.

---

## 🎉 Recente Updates (Juli 2025)

### ✅ **Database Beheer Interface**
- Nieuwe beheerder-only interface voor database management
- Veilige data clearing met bevestigingssysteem
- Real-time statistieken en voicebot overzicht
- Selectief wissen per voicebot of alle data

### ✅ **Verbeterde Beveiliging**
- Versterkte toegangscontrole voor kritieke functies
- Audit logging voor alle database wijzigingen
- Bevestigingssysteem voor destructieve operaties

### ✅ **Bug Fixes**
- Parameter naming consistency tussen frontend en backend
- FormData vs JSON content-type handling
- Verbeterde error handling en debugging

*Laatste update: Juli 2025*
