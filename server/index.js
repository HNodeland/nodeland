// server/index.js

import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import mysql from 'mysql2/promise';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import { ensureAuth } from './auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, secure: false, sameSite: 'lax' },
}));

app.use(passport.initialize());
app.use(passport.session());

// — Google OAuth Setup —
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

passport.use(new GoogleStrategy({
    clientID:     process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:  process.env.GOOGLE_CALLBACK_URL
  },
  async (accessToken, refreshToken, profile, done) => {
    const { id, displayName, emails } = profile;
    const email = emails?.[0]?.value || null;
    try {
      await app.locals.db.execute(
        `INSERT INTO users (id, displayName, email)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE
           displayName = VALUES(displayName),
           email       = VALUES(email)`,
        [id, displayName, email]
      );
      const [rows] = await app.locals.db.execute(
        `SELECT language FROM users WHERE id = ?`,
        [id]
      );
      const language = rows[0]?.language || 'en';
      done(null, { id, displayName, email, language });
    } catch (err) {
      console.error('Error in GoogleStrategy callback:', err);
      done(err, null);
    }
  }
));

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (_req, res) => res.redirect('http://localhost:5173/')
);

app.post('/api/auth/logout', (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    res.json({ ok: true });
  });
});

app.get('/api/auth/user', (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ user: null });
  res.json({ user: req.user });
});

app.get('/api/profile', ensureAuth, (req, res) => {
  res.json({ user: req.user });
});

app.patch('/api/profile/language', ensureAuth, async (req, res) => {
  const { language } = req.body;
  if (!['en','no'].includes(language)) {
    return res.status(400).json({ error: 'Invalid language' });
  }
  try {
    await app.locals.db.execute(
      `UPDATE users SET language = ? WHERE id = ?`,
      [language, req.user.id]
    );
    req.user.language = language;
    res.json({ ok: true });
  } catch (err) {
    console.error('Error updating language:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// — Health check —
app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK' });
});

// — Weather polling & persistence —
async function pollWeather() {
  try {
    const res = await axios.get(process.env.RAW_URL || 'https://nodeland.no/clientraw.txt');
    const parts = res.data.trim().split(/\s+/);
    const now = new Date();
    const entry = {
      ts:       now.getTime(),
      temp:     parseFloat(parts[4]),
      wind:     parseFloat(parts[1]),
      gust:     parseFloat(parts[2]),
      dir:      parseFloat(parts[3]),
      pressure: parseFloat(parts[6]),
      rain:     parseFloat(parts[8]),
      uv:       parseFloat(parts[16]),
      solar:    parseFloat(parts[9])
    };

    // Persist raw reading
    await app.locals.db.execute(
      `INSERT INTO weather_readings
         (ts, temp, wind, gust, dir, pressure, rain, uv, solar)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        entry.ts,
        entry.temp,
        entry.wind,
        entry.gust,
        entry.dir,
        entry.pressure,
        entry.rain,
        entry.uv,
        entry.solar
      ]
    );

    // Upsert today's stats
    const todayDate = new Date().toISOString().slice(0,10);
    await app.locals.db.execute(
      `INSERT INTO weather_stats (\`date\`, \`low\`, \`high\`, \`current\`)
         VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         \`low\`     = LEAST(\`low\`, VALUES(\`low\`)),
         \`high\`    = GREATEST(\`high\`, VALUES(\`high\`)),
         \`current\` = VALUES(\`current\`),
         updatedAt = CURRENT_TIMESTAMP`,
      [todayDate, entry.temp, entry.temp, entry.temp]
    );

    // Re-aggregate true min/max from all readings
    await app.locals.db.execute(
      `UPDATE weather_stats ws
         JOIN (
           SELECT MIN(temp) AS low, MAX(temp) AS high
             FROM weather_readings
            WHERE DATE(FROM_UNIXTIME(ts/1000)) = ?
         ) agg
       ON ws.\`date\` = ?
       SET ws.\`low\` = agg.low, ws.\`high\` = agg.high`,
      [todayDate, todayDate]
    );

  } catch (err) {
    console.error('pollWeather error:', err);
  }
}

// — Weather history endpoint —
app.get('/api/weather/history', async (_req, res) => {
  const [rows] = await app.locals.db.execute(
    `SELECT FROM_UNIXTIME(ts/1000,'%H:%i') AS time,
            temp, wind, pressure, rain
     FROM weather_readings
     WHERE ts >= UNIX_TIMESTAMP(CURDATE())*1000
     ORDER BY ts ASC`
  );
  res.json({
    windHistory:     rows.map(r => ({ time: r.time, wind: r.wind })),
    tempHistory:     rows.map(r => ({ time: r.time, temp: r.temp })),
    pressureHistory: rows.map(r => ({ time: r.time, pressure: r.pressure })),
    rainHistory:     rows.map(r => ({ time: r.time, rain: r.rain }))
  });
});

// — Weather stats endpoint —
app.get('/api/weather/stats', async (_req, res) => {
  try {
    const today = new Date().toISOString().slice(0,10);
    const [rows] = await app.locals.db.execute(
      `SELECT \`low\`, \`high\`, \`current\`
       FROM weather_stats
       WHERE \`date\` = ?`,
      [today]
    );
    if (!rows.length) {
      return res.json({ low: null, high: null, current: null });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching weather stats:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// — Proxy raw text endpoint —
app.get('/api/weather/raw', async (_req, res) => {
  try {
    const upstream = await axios.get(process.env.RAW_URL || 'https://nodeland.no/clientraw.txt');
    res.type('text/plain').send(upstream.data);
  } catch (err) {
    console.error('Error proxying raw weather data:', err);
    res.status(502).json({ error: 'Unable to fetch raw weather data' });
  }
});

// — Static serve & SPA fallback —
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '../client/dist');
  app.use(express.static(buildPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

// — Bootstrap DB & start listening —
;(async () => {
  try {
    const pool = await mysql.createPool({
      host:     process.env.DB_HOST,
      user:     process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Ensure tables exist
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS weather_readings (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        ts BIGINT NOT NULL,
        temp FLOAT NOT NULL,
        wind FLOAT NOT NULL,
        gust FLOAT NOT NULL,
        dir FLOAT NOT NULL,
        pressure FLOAT NOT NULL,
        rain FLOAT NOT NULL,
        uv FLOAT NOT NULL,
        solar FLOAT NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB CHARSET=utf8mb4;
    `);
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS weather_stats (
        \`date\` DATE PRIMARY KEY,
        \`low\` FLOAT NOT NULL,
        \`high\` FLOAT NOT NULL,
        \`current\` FLOAT NOT NULL,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB CHARSET=utf8mb4;
    `);

    app.locals.db = pool;

    // Start polling only after DB is ready
    await pollWeather();
    setInterval(pollWeather, 1 * 60 * 1000); // every 1 minute

    const port = process.env.PORT || 4000;
    app.listen(port, () => {
      console.log(`Backend listening on http://localhost:${port}`);
    });
  } catch (err) {
    console.error('DB connection or migration failed:', err);
    process.exit(1);
  }
})();
