// server/index.js
require('dotenv').config();

const express        = require('express');
const session        = require('express-session');
const passport       = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mysql          = require('mysql2/promise');
const cors           = require('cors');
const path           = require('path');

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

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj,   done) => done(null, obj));

// Register Google OAuth strategy
passport.use(new GoogleStrategy({
    clientID:     process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:  process.env.GOOGLE_CALLBACK_URL
  },
  async (accessToken, refreshToken, profile, done) => {
    const { id, displayName, emails } = profile;
    const email = emails?.[0]?.value || null;
    try {
      // 1) Insert or update user record (preserves existing language)
      await app.locals.db.execute(
        `INSERT INTO users (id, displayName, email)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE
           displayName = VALUES(displayName),
           email       = VALUES(email)`,
        [id, displayName, email]
      );

      // 2) Fetch their language preference
      const [rows] = await app.locals.db.execute(
        `SELECT language FROM users WHERE id = ?`,
        [id]
      );
      const language = rows[0]?.language || 'en';

      // 3) Store full user (including language) in session
      return done(null, { id, displayName, email, language });
    } catch (err) {
      console.error('Error in GoogleStrategy callback:', err);
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
  (_req, res) => {
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

// Get current authenticated user (includes language)
app.get('/api/auth/user', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ user: null });
  }
  // req.user === { id, displayName, email, language }
  res.json({ user: req.user });
});

// Protected profile endpoint (same data)
app.get('/api/profile', ensureAuth, (req, res) => {
  res.json({ user: req.user });
});

// Update language preference
app.patch('/api/profile/language', ensureAuth, async (req, res) => {
  const { language } = req.body;
  if (!['en', 'no'].includes(language)) {
    return res.status(400).json({ error: 'Invalid language' });
  }
  try {
    await app.locals.db.execute(
      `UPDATE users
         SET language = ?
       WHERE id = ?`,
      [language, req.user.id]
    );
    // update session immediately
    req.user.language = language;
    res.json({ ok: true });
  } catch (err) {
    console.error('Error updating language:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Healthcheck
app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK' });
});

// Static serve in production
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
    app.locals.db = await mysql.createPool({
      host:     process.env.DB_HOST,
      user:     process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
    });

    const port = process.env.PORT || 4000;
    app.listen(port, () => console.log(`Backend listening on http://localhost:${port}`));
  } catch (err) {
    console.error('DB connection failed:', err);
    process.exit(1);
  }
})();
