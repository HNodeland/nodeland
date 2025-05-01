import 'dotenv/config'
import express from 'express'
import session from 'express-session'
import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import mysql from 'mysql2/promise'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import axios from 'axios'
import { ensureAuth } from './auth.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)

const app = express()
app.use(express.json())

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, secure: false, sameSite: 'lax' },
}))

app.use(passport.initialize())
app.use(passport.session())

// — Google OAuth Setup —

passport.serializeUser((user, done) => done(null, user))
passport.deserializeUser((obj, done) => done(null, obj))

passport.use(new GoogleStrategy({
    clientID:     process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:  process.env.GOOGLE_CALLBACK_URL
  },
  async (accessToken, refreshToken, profile, done) => {
    const { id, displayName, emails } = profile
    const email = emails?.[0]?.value || null
    try {
      await app.locals.db.execute(
        `INSERT INTO users (id, displayName, email)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE
           displayName = VALUES(displayName),
           email       = VALUES(email)`,
        [id, displayName, email]
      )
      const [rows] = await app.locals.db.execute(
        `SELECT language FROM users WHERE id = ?`,
        [id]
      )
      const language = rows[0]?.language || 'en'
      return done(null, { id, displayName, email, language })
    } catch (err) {
      console.error('Error in GoogleStrategy callback:', err)
      return done(err, null)
    }
  }
))

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
)

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (_req, res) => res.redirect('http://localhost:5173/')
)

app.post('/api/auth/logout', (req, res, next) => {
  req.logout(err => {
    if (err) return next(err)
    res.json({ ok: true })
  })
})

app.get('/api/auth/user', (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ user: null })
  res.json({ user: req.user })
})

app.get('/api/profile', ensureAuth, (req, res) => {
  res.json({ user: req.user })
})

app.patch('/api/profile/language', ensureAuth, async (req, res) => {
  const { language } = req.body
  if (!['en','no'].includes(language)) {
    return res.status(400).json({ error: 'Invalid language' })
  }
  try {
    await app.locals.db.execute(
      `UPDATE users SET language = ? WHERE id = ?`,
      [language, req.user.id]
    )
    req.user.language = language
    res.json({ ok: true })
  } catch (err) {
    console.error('Error updating language:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

// — Health check —

app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK' })
})

// — Weather history polling & endpoint —

const weatherHistory = []

async function pollWeather() {
  try {
    const res = await axios.get(process.env.RAW_URL || 'https://nodeland.no/clientraw.txt')
    const parts = res.data.trim().split(/\s+/)
    const now = new Date()
    weatherHistory.push({
      ts:       now.getTime(),
      time:     now.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}),
      wind:     parseFloat(parts[1]),
      temp:     parseFloat(parts[4]),
      pressure: parseFloat(parts[6]),
      rain:     parseFloat(parts[8]),
    })
    const cutoff = Date.now() - 24*60*60*1000
    while (weatherHistory.length && weatherHistory[0].ts < cutoff) {
      weatherHistory.shift()
    }
  } catch (err) {
    console.error('pollWeather error:', err.message)
  }
}

pollWeather()
setInterval(pollWeather, 2_000)

app.get('/api/weather/history', (_req, res) => {
  res.json({
    windHistory:     weatherHistory.map(h => ({ time: h.time, wind:     h.wind     })),
    tempHistory:     weatherHistory.map(h => ({ time: h.time, temp:     h.temp     })),
    pressureHistory: weatherHistory.map(h => ({ time: h.time, pressure: h.pressure })),
    rainHistory:     weatherHistory.map(h => ({ time: h.time, rain:     h.rain     })),
  })
})

// — Proxy raw text endpoint —

app.get('/api/weather/raw', async (_req, res) => {
  try {
    const upstream = await axios.get('https://nodeland.no/clientraw.txt')
    res.type('text/plain').send(upstream.data)
  } catch (err) {
    console.error('Error proxying raw weather data:', err.message)
    res.status(502).json({ error: 'Unable to fetch raw weather data' })
  }
})

// — Static serve & SPA fallback —

if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '../client/dist')
  app.use(express.static(buildPath))
  app.get('*', (_req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'))
  })
}

// — Bootstrap DB & start listening —

;(async () => {
  try {
    app.locals.db = await mysql.createPool({
      host:     process.env.DB_HOST,
      user:     process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
    })
    const port = process.env.PORT || 4000
    app.listen(port, () =>
      console.log(`Backend listening on http://localhost:${port}`)
    )
  } catch (err) {
    console.error('DB connection failed:', err)
    process.exit(1)
  }
})()
