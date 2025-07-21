// server/src/services/weatherService.js
import axios from 'axios'
import pool from '../db/pool.js'
import config from '../config/index.js'
import { parseRaw } from '../utils/parseRaw.js'

export let latestParsed = null;

export async function pollWeather() {
  try {
    const res = await axios.get(config.rawUrl)
    const parsed = parseRaw(res.data)

    const safe = (key, defaultVal = null) => {
      const val = parsed[key]
      return (val != null && !Number.isNaN(val)) ? val : defaultVal
    }

    const fields = Object.keys(parsed);
    const columns = fields.map(f => `\`${f}\``).join(', ');
    const placeholders = fields.map(() => '?').join(', ');
    const values = fields.map(f => safe(f, (typeof parsed[f] === 'string' ? '' : null)));

    await pool.execute(
      `INSERT INTO weather_readings (${columns}) VALUES (${placeholders})`,
      values
    )

    const today = new Date().toISOString().slice(0, 10)
    const initialTemp = safe('out_temp')
    await pool.execute(
      `
      INSERT INTO weather_stats (\`date\`, \`low\`, \`high\`, \`current\`)
        VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        low       = LEAST(low, VALUES(low)),
        high      = GREATEST(high, VALUES(high)),
        current   = VALUES(current),
        updatedAt = CURRENT_TIMESTAMP
      `,
      [today, initialTemp, initialTemp, initialTemp]
    )

    await pool.execute(
      `
      UPDATE weather_stats ws
        JOIN (
          SELECT
            MIN(out_temp) AS low,
            MAX(out_temp) AS high
          FROM weather_readings
          WHERE DATE(FROM_UNIXTIME(ts/1000)) = ?
        ) agg ON ws.\`date\` = ?
      SET
        ws.low  = agg.low,
        ws.high = agg.high
      `,
      [today, today]
    )

    latestParsed = parsed
  } catch (err) {
    console.error('pollWeather error:', err)
  }
}