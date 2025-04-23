// server/index.js
require('dotenv').config();

const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');

// Middleware to protect routes
const { ensureAuth } = require('./auth');

const app = express();

// Parse JSON bodies
app.use(express.json());

// Allow React dev server to send cookies and auth requests
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,        // set to true in production (HTTPS)
    sameSite: 'lax'
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Serialize user into session
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// Register Google OAuth strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  },
  async (accessToken, refreshToken, profile, done) => {
    const { id, displayName, emails } = profile;
    const email = emails?.[0]?.value || null;
    try {
      // Upsert user into MySQL
      await app.locals.db.execute(
        `INSERT INTO users (id, displayName, email)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE
           displayName = VALUES(displayName),
           email       = VALUES(email)`,
        [id, displayName, email]
      );
      return done(null, { id, displayName });
    } catch (err) {
      console.error('Error upserting user:', err);
      return done(err, null);
    }
  }
));

// ─── Authentication Routes ───────────────────────────────────────────────────
// Trigger Google OAuth
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// OAuth callback
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // On success, redirect to frontend
    res.redirect('http://localhost:5173/');
  }
);

// Logout endpoint
app.post('/api/auth/logout', (req, res) => {
  req.logout(err => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    res.json({ ok: true });
  });
});

// Get current authenticated user
app.get('/api/auth/user', (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ user: null });
  res.json({ user: req.user });
});

// Protected profile endpoint
app.get('/api/profile', ensureAuth, (req, res) => {
  res.json({ user: req.user });
});

// Healthcheck
app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK' });
});

// Optional: static serve React build in production
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '../client/dist');
  app.use(express.static(buildPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

// Bootstrap: connect to DB and start server
(async () => {
  try {
    const db = await mysql.createPool({
      host:     process.env.DB_HOST,
      user:     process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
    });
    app.locals.db = db;

    const port = process.env.PORT || 4000;
    app.listen(port, () => console.log(`Backend listening on http://localhost:${port}`));
  } catch (err) {
    console.error('DB connection failed:', err);
    process.exit(1);
  }
})();