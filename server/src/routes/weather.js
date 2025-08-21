// server/src/routes/weather.js
import { Router } from 'express';
import axios from 'axios';
import config from '../config/index.js';
import pool from '../db/pool.js';
import { pollWeather, latestParsed } from '../services/weatherService.js';
import { parseRaw } from '../utils/parseRaw.js';

const router = Router();

// start/refresh the poller
pollWeather();
setInterval(pollWeather, 5_000);

// ── current ───────────────────────────────────────────────────────────────
router.get('/current', (_req, res) => {
  if (latestParsed) {
    res.json(latestParsed);
  } else {
    res.status(503).json({ error: 'No current data available yet' });
  }
});

// ── history (today from weather_readings) ─────────────────────────────────
router.get('/history', async (_req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT
         ts,                                        -- epoch ms since source device
         FROM_UNIXTIME(ts/1000,'%H:%i') AS time,    -- keep friendly HH:mm if you want to show it
         out_temp,
         current_windspeed AS wind,
         barometer       AS pressure,
         day_rain        AS rain
       FROM weather_readings
       WHERE ts >= UNIX_TIMESTAMP(CURDATE())*1000
       ORDER BY ts ASC`
    );

    res.json({
      windHistory:     rows.map(r => ({ ts: r.ts, time: r.time, wind:     r.wind })),
      tempHistory:     rows.map(r => ({ ts: r.ts, time: r.time, temp:     r.out_temp })),
      pressureHistory: rows.map(r => ({ ts: r.ts, time: r.time, pressure: r.pressure })),
      rainHistory:     rows.map(r => ({ ts: r.ts, time: r.time, rain:     r.rain })),
    });
  } catch (err) {
    console.error('Error fetching weather history:', err);
    res.status(500).json({ error: 'Server error fetching history' });
  }
});

// ── stats (today) ────────────────────────────────────────────────────────
router.get('/stats', async (_req, res) => {
  let currentFromRaw = null;

  if (latestParsed) {
    currentFromRaw = latestParsed.out_temp;
  } else {
    try {
      const upstream = await axios.get(config.rawUrl);
      const parsed = parseRaw(upstream.data);
      currentFromRaw = parsed.out_temp;
    } catch (rawErr) {
      console.warn('Raw fetch for current temperature failed:', rawErr);
    }
  }

  try {
    const today = new Date().toISOString().slice(0, 10);
    const [rows] = await pool.execute(
      `SELECT low, high, current
       FROM weather_stats
       WHERE \`date\` = ?`,
      [today]
    );

    if (rows.length === 0) {
      return res.json({ low: null, high: null, current: currentFromRaw });
    }

    const dbStats = rows[0];
    return res.json({
      low: dbStats.low,
      high: dbStats.high,
      current: currentFromRaw != null ? currentFromRaw : dbStats.current,
    });
  } catch (dbErr) {
    console.error('Error fetching weather stats from DB:', dbErr);
    return res.status(500).json({ error: 'Server error fetching stats' });
  }
});

// ── raw passthrough ───────────────────────────────────────────────────────
router.get('/raw', async (_req, res) => {
  try {
    const upstream = await axios.get(config.rawUrl);
    res.type('text/plain').send(upstream.data);
  } catch (err) {
    console.error('Error proxying raw weather data:', err);
    res.status(502).json({ error: 'Unable to fetch raw weather data' });
  }
});

// ── helpers for daily endpoints ───────────────────────────────────────────
function dailyUnionSql(selectFields) {
  // Build from union of dates across all daily tables, then left join each.
  // DATE_FORMAT guarantees 'YYYY-MM-DD' strings to the client.
  return `
    SELECT 
      DATE_FORMAT(d.\`date\`, '%Y-%m-%d') AS \`date\`,
      ${selectFields}
    FROM (
      SELECT \`date\`
      FROM (
        SELECT \`date\` FROM weather_daily_max
        UNION
        SELECT \`date\` FROM weather_daily_avg
        UNION
        SELECT \`date\` FROM weather_daily_min
        ORDER BY \`date\` DESC
        /**LIMIT_CLAUSE**/
      ) x
    ) d
    LEFT JOIN weather_daily_max m ON m.\`date\` = d.\`date\`
    LEFT JOIN weather_daily_avg a ON a.\`date\` = d.\`date\`
    LEFT JOIN weather_daily_min n ON n.\`date\` = d.\`date\`
    ORDER BY d.\`date\` ASC
  `;
}

function parseDaysParam(q) {
  const raw = q?.days;
  if (!raw || raw === 'all') return { limit: null };
  const num = Math.max(1, Math.min(parseInt(raw, 10) || 30, 3650)); // up to ~10y
  return { limit: num };
}

// ── daily-temp ────────────────────────────────────────────────────────────
router.get('/daily-temp', async (req, res) => {
  const { limit } = parseDaysParam(req.query);
  try {
    const sql = dailyUnionSql(`
      m.max_out_temp AS max_temp,
      a.avg_out_temp AS avg_temp,
      n.min_out_temp AS min_temp
    `).replace('/**LIMIT_CLAUSE**/', limit ? 'LIMIT ?' : '');
    const params = limit ? [limit] : [];

    console.log('[daily-temp] limit:', limit ?? 'all');
    const [rows] = await pool.execute(sql, params);
    console.log('[daily-temp] rows:', rows.length, rows[0] || null);

    res.json(rows);
  } catch (err) {
    console.error('Error fetching daily temp stats:', err);
    res.status(500).json({ error: 'Server error fetching daily temp stats' });
  }
});

// ── daily-wind ────────────────────────────────────────────────────────────
router.get('/daily-wind', async (req, res) => {
  const { limit } = parseDaysParam(req.query);
  try {
    const sql = dailyUnionSql(`
      m.max_current_windspeed AS max_wind,
      a.avg_current_windspeed AS avg_wind,
      n.min_current_windspeed AS min_wind
    `).replace('/**LIMIT_CLAUSE**/', limit ? 'LIMIT ?' : '');
    const params = limit ? [limit] : [];

    console.log('[daily-wind] limit:', limit ?? 'all');
    const [rows] = await pool.execute(sql, params);
    console.log('[daily-wind] rows:', rows.length, rows[0] || null);

    res.json(rows);
  } catch (err) {
    console.error('Error fetching daily wind stats:', err);
    res.status(500).json({ error: 'Server error fetching daily wind stats' });
  }
});

// ── daily-rain ────────────────────────────────────────────────────────────
router.get('/daily-rain', async (req, res) => {
  const { limit } = parseDaysParam(req.query);
  try {
    const sql = dailyUnionSql(`
      m.max_day_rain AS max_rain,
      a.avg_day_rain AS avg_rain,
      n.min_day_rain AS min_rain
    `).replace('/**LIMIT_CLAUSE**/', limit ? 'LIMIT ?' : '');
    const params = limit ? [limit] : [];

    console.log('[daily-rain] limit:', limit ?? 'all');
    const [rows] = await pool.execute(sql, params);
    console.log('[daily-rain] rows:', rows.length, rows[0] || null);

    res.json(rows);
  } catch (err) {
    console.error('Error fetching daily rain stats:', err);
    res.status(500).json({ error: 'Server error fetching daily rain stats' });
  }
});

// ── daily-pressure ────────────────────────────────────────────────────────
router.get('/daily-pressure', async (req, res) => {
  const { limit } = parseDaysParam(req.query);
  try {
    const sql = dailyUnionSql(`
      m.max_barometer AS max_pressure,
      a.avg_barometer AS avg_pressure,
      n.min_barometer AS min_pressure
    `).replace('/**LIMIT_CLAUSE**/', limit ? 'LIMIT ?' : '');
    const params = limit ? [limit] : [];

    console.log('[daily-pressure] limit:', limit ?? 'all');
    const [rows] = await pool.execute(sql, params);
    console.log('[daily-pressure] rows:', rows.length, rows[0] || null);

    res.json(rows);
  } catch (err) {
    console.error('Error fetching daily pressure stats:', err);
    res.status(500).json({ error: 'Server error fetching daily pressure stats' });
  }
});

export default router;
