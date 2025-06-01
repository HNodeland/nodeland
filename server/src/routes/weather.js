// server/src/routes/weather.js
import { Router } from 'express'
import axios from 'axios'
import config from '../config/index.js'
import pool from '../db/pool.js'
import { pollWeather } from '../services/weatherService.js'

const router = Router()

// fire off the first poll immediately, then once a minute
pollWeather()
setInterval(pollWeather, 60_000)

// ── history ───────────────────────────────────────────────────────────────
router.get('/history', async (_req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT
         FROM_UNIXTIME(ts/1000,'%H:%i') AS time,
         temp,
         wind,
         pressure,
         rain
       FROM weather_readings
       WHERE ts >= UNIX_TIMESTAMP(CURDATE())*1000
       ORDER BY ts ASC`
    )
    res.json({
      windHistory:     rows.map(r => ({ time: r.time, wind: r.wind })),
      tempHistory:     rows.map(r => ({ time: r.time, temp: r.temp })),
      pressureHistory: rows.map(r => ({ time: r.time, pressure: r.pressure })),
      rainHistory:     rows.map(r => ({ time: r.time, rain: r.rain })),
    })
  } catch (err) {
    console.error('Error fetching weather history:', err)
    res.status(500).json({ error: 'Server error fetching history' })
  }
})

// ── stats ─────────────────────────────────────────────────────────────────
// Always fetch low/high from the DB. Use raw packet only for current temperature.
router.get('/stats', async (_req, res) => {
  let currentFromRaw = null

  // 1) Try to fetch current temperature from raw packet
  try {
    const upstream = await axios.get(config.rawUrl)
    const parts    = upstream.data.trim().split(/\s+/)
    const currentRaw = parseFloat(parts[4])
    currentFromRaw = Number.isNaN(currentRaw) ? null : currentRaw
  } catch (rawErr) {
    console.warn('Raw fetch for current temperature failed:', rawErr)
    // We'll fall back to DB for current if needed
  }

  // 2) Fetch low/high/current from weather_stats in DB
  try {
    const today = new Date().toISOString().slice(0, 10) // "YYYY-MM-DD"
    const [rows] = await pool.execute(
      `SELECT low, high, current
         FROM weather_stats
         WHERE \`date\` = ?`,
      [today]
    )

    if (rows.length === 0) {
      // No row in weather_stats yet for today
      return res.json({
        low:     null,
        high:    null,
        current: currentFromRaw,
      })
    }

    // Use DB low/high. For current, prefer raw if available, otherwise DB value.
    const dbStats = rows[0]
    return res.json({
      low:     dbStats.low,
      high:    dbStats.high,
      current: currentFromRaw != null ? currentFromRaw : dbStats.current,
    })
  } catch (dbErr) {
    console.error('Error fetching weather stats from DB:', dbErr)
    return res.status(500).json({ error: 'Server error fetching stats' })
  }
})

// ── raw ───────────────────────────────────────────────────────────────────
router.get('/raw', async (_req, res) => {
  try {
    const upstream = await axios.get(config.rawUrl)
    res.type('text/plain').send(upstream.data)
  } catch (err) {
    console.error('Error proxying raw weather data:', err)
    res.status(502).json({ error: 'Unable to fetch raw weather data' })
  }
})

export default router
