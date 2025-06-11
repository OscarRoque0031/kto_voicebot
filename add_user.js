require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

// Lees gebruikersnaam, wachtwoord en voicebot_naam uit de commandline
const [,, username, password, voicebot_naam] = process.argv;

if (!username || !password || !voicebot_naam) {
  console.log('Gebruik: node add_user.js <username> <wachtwoord> <voicebot_naam>');
  process.exit(1);
}

async function addUser() {
  try {
    const pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
    });

    const password_hash = await bcrypt.hash(password, 10);

    await pool.query(
      'INSERT INTO gebruikers (username, password_hash, voicebot_naam) VALUES (?, ?, ?)',
      [username, password_hash, voicebot_naam]
    );
    console.log(`Gebruiker "${username}" aangemaakt en gekoppeld aan "${voicebot_naam}"`);
    await pool.end();
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      console.error('Deze gebruikersnaam bestaat al.');
    } else {
      console.error('Fout bij aanmaken gebruiker:', err);
    }
    process.exit(1);
  }
}

addUser();
