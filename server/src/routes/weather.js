// server/src/routes/weather.js
import { Router } from 'express'
import axios from 'axios'
import config from '../config/index.js'
import pool from '../db/pool.js'
import { pollWeather, latestParsed } from '../services/weatherService.js'
import { parseRaw } from '../utils/parseRaw.js'

const router = Router()

// fire off the first poll immediately, then every 5 second.
pollWeather()
setInterval(pollWeather, 5_000)

// ── current ───────────────────────────────────────────────────────────────
router.get('/current', (_req, res) => {
  if (latestParsed) {
    res.json(latestParsed)
  } else {
    res.status(503).json({ error: 'No current data available yet' })
  }
})

// ── history ───────────────────────────────────────────────────────────────
router.get('/history', async (_req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT
         FROM_UNIXTIME(ts/1000,'%H:%i') AS time,
         out_temp,
         current_windspeed AS wind,
         barometer AS pressure,
         day_rain AS rain,
         average_windspeed,
         wind_dir,
         rain_rate_mm_min,
         yesterday_rain,
         uv_index,
         vp_solar_wm2,
         dew_point
       FROM weather_readings
       WHERE ts >= UNIX_TIMESTAMP(CURDATE())*1000
       ORDER BY ts ASC`
    )
    res.json({
      windHistory:     rows.map(r => ({ time: r.time, wind: r.wind })),
      tempHistory:     rows.map(r => ({ time: r.time, temp: r.out_temp })),
      pressureHistory: rows.map(r => ({ time: r.time, pressure: r.pressure })),
      rainHistory:     rows.map(r => ({ time: r.time, rain: r.day_rain })),
    })
  } catch (err) {
    console.error('Error fetching weather history:', err)
    res.status(500).json({ error: 'Server error fetching history' })
  }
})

// ── stats ─────────────────────────────────────────────────────────────────
router.get('/stats', async (_req, res) => {
  let currentFromRaw = null

  if (latestParsed) {
    currentFromRaw = latestParsed.out_temp
  } else {
    try {
      const upstream = await axios.get(config.rawUrl)
      const parsed = parseRaw(upstream.data)
      currentFromRaw = parsed.out_temp
    } catch (rawErr) {
      console.warn('Raw fetch for current temperature failed:', rawErr)
    }
  }

  try {
    const today = new Date().toISOString().slice(0, 10)
    const [rows] = await pool.execute(
      `SELECT low, high, current
         FROM weather_stats
         WHERE \`date\` = ?`,
      [today]
    )

    if (rows.length === 0) {
      return res.json({
        low:     null,
        high:    null,
        current: currentFromRaw,
      })
    }

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

// ── daily-temp ────────────────────────────────────────────────────────────
router.get('/daily-temp', async (req, res) => {
  const days = parseInt(req.query.days) || 30;
  const limit = Math.min(days, 365);  // Cap at 365 days
  try {
    const [rows] = await pool.execute(
      `
      SELECT 
        m.\`date\`,
        m.max_out_temp AS max_temp,
        a.avg_out_temp AS avg_temp,
        n.min_out_temp AS min_temp
      FROM weather_daily_max m
      JOIN weather_daily_avg a ON m.\`date\` = a.\`date\`
      JOIN weather_daily_min n ON m.\`date\` = n.\`date\`
      ORDER BY m.\`date\` DESC
      LIMIT ?
      `,
      [limit]
    );
    res.json(rows.reverse());  // Reverse to chronological order
  } catch (err) {
    console.error('Error fetching daily temp stats:', err);
    res.status(500).json({ error: 'Server error fetching daily temp stats' });
  }
});

// ── daily-wind ────────────────────────────────────────────────────────────
router.get('/daily-wind', async (req, res) => {
  const days = parseInt(req.query.days) || 30;
  const limit = Math.min(days, 365);
  try {
    const [rows] = await pool.execute(
      `
      SELECT 
        m.\`date\`,
        m.max_current_windspeed AS max_wind,
        a.avg_current_windspeed AS avg_wind,
        n.min_current_windspeed AS min_wind
      FROM weather_daily_max m
      JOIN weather_daily_avg a ON m.\`date\` = a.\`date\`
      JOIN weather_daily_min n ON m.\`date\` = n.\`date\`
      ORDER BY m.\`date\` DESC
      LIMIT ?
      `,
      [limit]
    );
    res.json(rows.reverse());
  } catch (err) {
    console.error('Error fetching daily wind stats:', err);
    res.status(500).json({ error: 'Server error fetching daily wind stats' });
  }
});

// ── daily-rain ────────────────────────────────────────────────────────────
router.get('/daily-rain', async (req, res) => {
  const days = parseInt(req.query.days) || 30;
  const limit = Math.min(days, 365);
  try {
    const [rows] = await pool.execute(
      `
      SELECT 
        m.\`date\`,
        m.max_day_rain AS max_rain,
        a.avg_day_rain AS avg_rain,
        n.min_day_rain AS min_rain
      FROM weather_daily_max m
      JOIN weather_daily_avg a ON m.\`date\` = a.\`date\`
      JOIN weather_daily_min n ON m.\`date\` = n.\`date\`
      ORDER BY m.\`date\` DESC
      LIMIT ?
      `,
      [limit]
    );
    res.json(rows.reverse());
  } catch (err) {
    console.error('Error fetching daily rain stats:', err);
    res.status(500).json({ error: 'Server error fetching daily rain stats' });
  }
});

// ── daily-pressure ────────────────────────────────────────────────────────
router.get('/daily-pressure', async (req, res) => {
  const days = parseInt(req.query.days) || 30;
  const limit = Math.min(days, 365);
  try {
    const [rows] = await pool.execute(
      `
      SELECT 
        m.\`date\`,
        m.max_barometer AS max_pressure,
        a.avg_barometer AS avg_pressure,
        n.min_barometer AS min_pressure
      FROM weather_daily_max m
      JOIN weather_daily_avg a ON m.\`date\` = a.\`date\`
      JOIN weather_daily_min n ON m.\`date\` = n.\`date\`
      ORDER BY m.\`date\` DESC
      LIMIT ?
      `,
      [limit]
    );
    res.json(rows.reverse());
  } catch (err) {
    console.error('Error fetching daily pressure stats:', err);
    res.status(500).json({ error: 'Server error fetching daily pressure stats' });
  }
});

export default router