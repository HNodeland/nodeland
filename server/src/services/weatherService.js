// server/src/services/weatherService.js
import axios from 'axios'
import pool from '../db/pool.js'
import config from '../config/index.js'

export async function pollWeather() {
  try {
    // 1) Fetch the raw ASCII packet from the configured endpoint
    const res = await axios.get(config.rawUrl)
    const parts = res.data.trim().split(/\s+/)
    const now = new Date()

    // 2) Parse exactly the fields we need for our existing table:
    const tsValue       = now.getTime()
    const outTemp       = parseFloat(parts[4])   // °C → maps to "temp"
    const windSpeed     = parseFloat(parts[1])   // m/s → maps to "wind"
    const windGust      = parseFloat(parts[2])   // m/s → maps to "gust"
    const windDir       = parseFloat(parts[3])   // ° (0=N…) → maps to "dir"
    const barometer     = parseFloat(parts[6])   // hPa → maps to "pressure"
    const dayRain       = parseFloat(parts[7])   // mm since local 00:00 → maps to "rain"
    const uvRaw         = parseFloat(parts[9])   // Raw UV → maps to "uv"
    const radiation     = parseFloat(parts[8])   // W/m² → maps to "solar"

    // If any of these parsed fields are NaN, store null in JS variables
    const ts      = Number.isNaN(tsValue)       ? null : tsValue
    const temp    = Number.isNaN(outTemp)       ? null : outTemp
    const wind    = Number.isNaN(windSpeed)     ? null : windSpeed
    const gust    = Number.isNaN(windGust)      ? null : windGust
    const dir     = Number.isNaN(windDir)       ? null : windDir
    const pressure= Number.isNaN(barometer)     ? null : barometer
    const rain    = Number.isNaN(dayRain)       ? null : dayRain
    const uv      = Number.isNaN(uvRaw)         ? null : uvRaw
    const solar   = Number.isNaN(radiation)     ? null : radiation

    // 3) Insert into "weather_readings" using exactly the columns that exist:
    //    (ts, temp, wind, gust, dir, pressure, rain, uv, solar)
    await pool.execute(
      `
      INSERT INTO weather_readings (
        ts,
        temp,
        wind,
        gust,
        dir,
        pressure,
        rain,
        uv,
        solar
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [ts, temp, wind, gust, dir, pressure, rain, uv, solar]
    )

    // 4) Now update "weather_stats" for today's date
    //    - First ensure there's a row for today (setting low/high/current all to outTemp)
    const today = now.toISOString().slice(0, 10) // "YYYY-MM-DD"
    const initialTemp = temp   // if temp was null, we'll insert null, but the next UPDATE will fix it
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

    // 5) Re‐compute today's true MIN/MAX from all readings in "weather_readings"
    await pool.execute(
      `
      UPDATE weather_stats ws
        JOIN (
          SELECT
            MIN(temp) AS low,
            MAX(temp) AS high
          FROM weather_readings
          WHERE DATE(FROM_UNIXTIME(ts/1000)) = ?
        ) agg ON ws.\`date\` = ?
      SET
        ws.low  = agg.low,
        ws.high = agg.high
      `,
      [today, today]
    )
  } catch (err) {
    console.error('pollWeather error:', err)
  }
}
