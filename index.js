require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const session = require('express-session');
const path = require('path');
const bcrypt = require('bcrypt');

const app = express();

// Middleware voor JSON en URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sessies (secret uit .env)
app.use(session({
  secret: process.env.SESSION_SECRET || 'ietsVeiligsHier',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // in productie op true met HTTPS
}));

// Database verbinding
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

// Middleware om dashboard sessie te checken
function dashboardAuth(req, res, next) {
  if (req.session && req.session.ingelogd) return next();
  res.redirect('/dashboard/login');
}

// Middleware om API-key te checken via x-api-key header (DialoX compatibel)
function requireApiKey(req, res, next) {
  let apiKey = req.headers['x-api-key'];
  if (!apiKey && req.headers.authorization) {
    const auth = req.headers.authorization;
    if (auth.startsWith('Bearer ')) {
      apiKey = auth.slice(7);
    } else if (auth.startsWith('Authorization: Bearer ')) {
      apiKey = auth.slice(22); // Fix voor dubbele header strings
    }
  }
  console.log('x-api-key header:', req.headers['x-api-key']);
  console.log('authorization header:', req.headers.authorization);
  console.log('API key gebruikt:', apiKey);

  if (!apiKey || apiKey !== process.env.API_KEY) {
    console.log('Ongeldige API-key!');
    return res.status(403).json({ error: 'Toegang geweigerd: ongeldige API-key' });
  }
  next();
}

// Root route, redirect naar dashboard login
app.get('/', (req, res) => {
  res.redirect('/dashboard/login');
});

// --- LOGIN routes ---
app.get('/dashboard/login', (req, res) => {
  res.send(`
    <h2>Login dashboard</h2>
    <form method="POST" action="/dashboard/login">
      <input type="text" name="username" placeholder="Gebruikersnaam" required><br>
      <input type="password" name="password" placeholder="Wachtwoord" required><br>
      <button type="submit">Login</button>
    </form>
  `);
});

app.post('/dashboard/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await pool.query("SELECT * FROM gebruikers WHERE username = ?", [username]);
    if (rows.length === 0) return res.send('Login mislukt');
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.send('Login mislukt');

    req.session.ingelogd = true;
    req.session.username = user.username;
    req.session.voicebot_naam = user.voicebot_naam;
    req.session.isBeheerder = (user.username === 'support0031'); // Pas aan naar juiste admin username

    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).send('Interne fout');
  }
});

// --- LOGOUT ---
app.get('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy(() => res.redirect('/dashboard/login'));
  } else {
    res.redirect('/dashboard/login');
  }
});

// --- DASHBOARD HTML ---
app.get('/dashboard', dashboardAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// --- DASHBOARD API: data ophalen met sessie-check ---
app.get('/dashboard-data', dashboardAuth, async (req, res) => {
  try {
    let sql = "SELECT * FROM beoordelingen";
    let params = [];

    if (!req.session.isBeheerder) {
      sql += " WHERE voicebot_naam = ?";
      params.push(req.session.voicebot_naam);
    } else if (req.query.voicebot_naam) {
      sql += " WHERE voicebot_naam = ?";
      params.push(req.query.voicebot_naam);
    }

    sql += " ORDER BY timestamp DESC";

    const [rows] = await pool.query(sql, params);

    const rowsWithText = rows.map(row => ({
      ...row,
      beoordeling_tekst:
        row.beoordeling === 1 ? "goed" :
        row.beoordeling === 2 ? "voldoende" :
        row.beoordeling === 3 ? "slecht" : "onbekend"
    }));

    res.json(rowsWithText);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Databasefout" });
  }
});

// --- DASHBOARD API: unieke voicebot namen (beheerder only) ---
app.get('/voicebot-namen', dashboardAuth, async (req, res) => {
  try {
    if (!req.session.isBeheerder) {
      return res.status(403).json({ error: "Forbidden" });
    }
    const [rows] = await pool.query("SELECT DISTINCT voicebot_naam FROM beoordelingen");
    res.json(rows.map(r => r.voicebot_naam));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Databasefout" });
  }
});

// --- CSV EXPORT ---
app.get('/dashboard-csv', dashboardAuth, async (req, res) => {
  try {
    let sql = "SELECT * FROM beoordelingen";
    let params = [];

    if (!req.session.isBeheerder) {
      sql += " WHERE voicebot_naam = ?";
      params.push(req.session.voicebot_naam);
    }

    sql += " ORDER BY timestamp DESC";

    const [rows] = await pool.query(sql, params);

    const header = "Datum,Beoordeling,Afzendernummer,Bestemmingsnummer,Voicebot,Toelichting";
    const csv = rows.map(row => {
      const beoordeling_tekst =
        row.beoordeling === 1 ? "slecht" :
        row.beoordeling === 2 ? "voldoende" :
        row.beoordeling === 3 ? "goed" : "onbekend";
      return [
        new Date(row.timestamp).toLocaleString('nl-NL'),
        beoordeling_tekst,
        row.beller,
        "", // Bestemmingsnummer vervalt, leeg laten
        row.voicebot_naam,
        row.toelichting ? `"${row.toelichting.replace(/"/g, '""')}"` : ""
      ].join(",");
    });

    const output = [header, ...csv].join("\r\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=beoordelingen.csv");
    res.send(output);
  } catch (err) {
    console.error(err);
    res.status(500).send("Fout bij exporteren");
  }
});

// --- API status endpoint ---
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', message: 'API is live en bereikbaar' });
});

// --- API webhook route met API-key beveiliging en opslaan ---
app.post('/api/webhook', async (req, res) => {
  console.log('Content-Type:', req.headers['content-type']);
  console.log('Body ontvangen:', JSON.stringify(req.body, null, 2));
  console.log('==== Nieuwe webhook call ====');
  console.log('Headers ontvangen:', req.headers);
  console.log('Body ontvangen:', JSON.stringify(req.body, null, 2));

  // --- API-key check hier indien nodig ---

  const data = req.body;
  const botNames = {
    '16babc5d-4d64-431f-8038-791738369818': 'Benu Apotheken',
    '0df2ff06-074b-4be9-9068-8e7d38381406': 'KTO 0031 ICT',
    // Voeg meer mappings toe indien nodig
  };

  let beoordeling, toelichting, beller, voicebot_naam;

  if (data.task && data.task.value) {
    beoordeling = data.task.value.beoordeling;
    toelichting = data.task.value.toelichting || 'geen toelichting gegeven';
    beller = data.task.value.beller;
    // **Hier altijd de mapping forceren:**
    voicebot_naam = botNames[data.bot_id] || data.bot_id;
  } else if (data.conversation_close) {
    beoordeling = data.conversation_close?.user_data?.ratingkto
      || data.conversation_close?.conversation_data?.ratingkto;
    toelichting = data.conversation_close?.user_data?.toelichting
      || data.conversation_close?.conversation_data?.toelichting || 'geen toelichting gegeven';
    beller = data.conversation_close?.user_data?.phone;
    voicebot_naam = botNames[data.bot_id] || data.bot_id;
  }

  console.log({ beoordeling, toelichting, beller, voicebot_naam });

  if (![1, 2, 3].includes(Number(beoordeling)) || !beller || !voicebot_naam) {
    console.log('Ongeldige input ontvangen');
    return res.status(400).json({ error: 'Ongeldige input' });
  }

  try {
    const sql = `
      INSERT INTO beoordelingen (timestamp, beoordeling, beller, voicebot_naam, toelichting)
      VALUES (NOW(), ?, ?, ?, ?)
    `;
    await pool.execute(sql, [beoordeling, beller, voicebot_naam, toelichting]);
    res.status(201).json({ message: 'Beoordeling opgeslagen' });
  } catch (err) {
    console.error('Databasefout:', err);
    res.status(500).json({ error: 'Databasefout' });
  }
});

// --- API lijst van beoordelingen met API-key beveiliging ---
app.get('/api/beoordelingen', requireApiKey, async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM beoordelingen ORDER BY timestamp DESC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Databasefout" });
  }
});

app.get('/dashboard/is-beheerder', (req, res) => {
  res.json({ beheerder: !!req.session.isBeheerder });
});

app.post('/dashboard/add-user', async (req, res) => {
  if (!req.session.isBeheerder) return res.status(403).send('Geen toegang');
  const { username, password, voicebot_naam } = req.body;
  if (!username || !password || !voicebot_naam) {
    return res.send('Alle velden zijn verplicht');
  }
  try {
    // Check of gebruiker al bestaat
    const [rows] = await pool.query("SELECT * FROM gebruikers WHERE username = ?", [username]);
    if (rows.length > 0) return res.send('Gebruiker bestaat al');

    const password_hash = await bcrypt.hash(password, 10);
    await pool.execute(
      "INSERT INTO gebruikers (username, password_hash, voicebot_naam) VALUES (?, ?, ?)",
      [username, password_hash, voicebot_naam]
    );
    res.send('Gebruiker toegevoegd!');
  } catch (err) {
    console.error(err);
    res.status(500).send('Fout bij toevoegen');
  }
});


// --- SERVER START ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API draait op poort ${PORT}`));
