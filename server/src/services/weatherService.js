import axios from 'axios';
import pool from '../db/pool.js';
import config from '../config/index.js';

export async function pollWeather() {
  try {
    const res = await axios.get(config.rawUrl);
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
      solar:    parseFloat(parts[9]),
    };

    // Raw reading
    await pool.execute(
      `INSERT INTO weather_readings
         (ts, temp, wind, gust, dir, pressure, rain, uv, solar)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [ entry.ts, entry.temp, entry.wind, entry.gust,
        entry.dir, entry.pressure, entry.rain,
        entry.uv, entry.solar ]
    );

    const today = now.toISOString().slice(0,10);
    // Stats upsert
    await pool.execute(
      `INSERT INTO weather_stats (\`date\`, \`low\`, \`high\`, \`current\`)
         VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         low     = LEAST(low, VALUES(low)),
         high    = GREATEST(high, VALUES(high)),
         current = VALUES(current),
         updatedAt = CURRENT_TIMESTAMP`,
      [ today, entry.temp, entry.temp, entry.temp ]
    );

    // Re-aggregate
    await pool.execute(
      `UPDATE weather_stats ws
         JOIN (
           SELECT MIN(temp) AS low, MAX(temp) AS high
             FROM weather_readings
            WHERE DATE(FROM_UNIXTIME(ts/1000)) = ?
         ) agg ON ws.\`date\` = ?
       SET ws.low = agg.low, ws.high = agg.high`,
      [ today, today ]
    );

  } catch (err) {
    console.error('pollWeather error:', err);
  }
}