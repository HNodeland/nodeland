// client/src/Weather.jsx
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SunCalc from 'suncalc'

import TemperatureGauge from './components/TemperatureGauge'
import Compass          from './components/Compass'
import VerticalBars     from './components/VerticalBars'
import SunClock         from './components/SunClock'
import RainChart        from './components/RainChart'
import WindChart        from './components/WindChart'
import TempChart        from './components/TempChart'
import PressureChart    from './components/PressureChart'

// field positions in the raw data array
const FIELD_INDICES = {
  stationId: 0,
  wind:       { avg2m: 1, avg10m: 2, direction: 3 },
  temperature:{ outside: 4, dewPoint: 19, feelsLike: 20 },
  humidity:   5,
  pressure:   6,
  rain:       { rate: 7, last1h: 8, last24h: 9, stormTotal: 10, yearTotal: 11 },
  todayExtremes: { highTemp: 12, timeHigh: 13, lowTemp: 16, timeLow: 17 },
  currentForecast: {
    uvIndex:  49,
    solar:    47  // placeholder index, adjust if needed
  }
}

function safeFloat(value) {
  const n = parseFloat(value)
  return Number.isNaN(n) ? null : n
}

function parse(raw) {
  const parts = raw.trim().split(/\s+/)
  const F     = FIELD_INDICES
  const data  = {}

  data.windAvg     = safeFloat(parts[F.wind.avg2m])
  data.windCurrent = safeFloat(parts[F.wind.avg10m])
  data.windDir     = safeFloat(parts[F.wind.direction])
  data.temperature = safeFloat(parts[F.temperature.outside])
  data.dewPoint    = safeFloat(parts[F.temperature.dewPoint])
  data.uvIndex     = safeFloat(parts[F.currentForecast.uvIndex])
  data.solar       = safeFloat(parts[F.currentForecast.solar])

  return data
}

// NOAA Wind Chill Index
function windChill(T, vKmh) {
  if (T == null || T > 10 || vKmh <= 4.8) return T
  return (
    13.12 +
    0.6215 * T -
    11.37 * Math.pow(vKmh, 0.16) +
    0.3965 * T * Math.pow(vKmh, 0.16)
  )
}

export default function Weather() {
  const [data, setData]   = useState(null)
  const [stats, setStats] = useState({ low: null, high: null, current: null })
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function fetchData() {
      try {
        // 1) Fetch today's stats (always required)
        const statsRes = await fetch('/api/weather/stats')
        if (!statsRes.ok) throw new Error(`Stats status ${statsRes.status}`)
        const statsJson = await statsRes.json()

        // 2) Try raw fetch, fallback silently to stats-only
        let parsed = {
          windAvg: null,
          windCurrent: null,
          windDir: null,
          temperature: statsJson.current,
          dewPoint: null,
          uvIndex: null,
          solar: null
        }
        try {
          const rawRes = await fetch('/api/weather/raw')
          if (rawRes.ok) {
            const rawText = await rawRes.text()
            parsed = parse(rawText)
          }
        } catch (rawErr) {
          console.warn('Raw fetch failed, using stats only', rawErr)
        }

        // 3) Override extremes from the DB
        parsed.low  = statsJson.low
        parsed.high = statsJson.high

        if (isMounted) {
          setData(parsed)
          setStats(statsJson)
        }
      } catch (err) {
        if (isMounted) setError(err.toString())
      }
    }

    fetchData()
    const id = setInterval(fetchData, 60 * 1000) // every minute
    return () => {
      isMounted = false
      clearInterval(id)
    }
  }, [])

  if (error) return <div className="p-8 text-red-400">Error loading: {error}</div>
  if (!data)  return <p className="text-center mt-8">Loading weather…</p>

  // Display values & feels
  const displayLow  = stats.low  != null ? stats.low  : '--'
  const displayHigh = stats.high != null ? stats.high : '--'
  const currTemp    = data.temperature != null ? data.temperature : '--'
  const vKmh        = data.windCurrent != null ? data.windCurrent * 3.6 : null

  const feelsLow     = stats.low  != null && vKmh != null ? windChill(stats.low,   vKmh) : '--'
  const feelsCurrent = data.temperature != null && vKmh != null
                       ? windChill(data.temperature, vKmh)
                       : '--'
  const feelsHigh    = stats.high != null && vKmh != null ? windChill(stats.high,  vKmh) : '--'

  // sunrise/sunset
  const now = new Date()
  const { sunrise, sunset } = SunCalc.getTimes(now, 60.24111, 10.69972)
  const sunriseStr = sunrise.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const sunsetStr  = sunset .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="min-h-screen bg-brand-dark text-white p-6">
      <Link to="/" className="text-brand-accent hover:underline">&larr; Back</Link>
      <h1 className="text-3xl font-bold my-4">Harestua Weather Dashboard</h1>

      {/* Gauges & Bars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <TemperatureGauge
          high={displayHigh}
          low={displayLow}
          current={currTemp}
          feelsHigh={feelsHigh}
          feelsLow={feelsLow}
          feelsCurrent={feelsCurrent}
        />
        <Compass
          current={data.windCurrent}
          average={data.windAvg}
          direction={data.windDir}
        />
        <VerticalBars data={{
          windCurrent: data.windCurrent,
          windAvg:     data.windAvg,
          uvIndex:     data.uvIndex,
          solarReading:data.solar
        }} />
      </div>

      {/* SunClock row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="h-[200px] bg-brand-deep rounded-lg shadow-md flex items-center justify-center">
          <SunClock sunrise={sunriseStr} sunset={sunsetStr} />
        </div>
        <div className="h-[200px] bg-brand-deep rounded-lg shadow-md" />
        <div className="h-[200px] bg-brand-deep rounded-lg shadow-md" />
      </div>

      {/* Historical Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <RainChart />
        <WindChart />
        <TempChart />
        <PressureChart />
      </div>
    </div>
  )
}
