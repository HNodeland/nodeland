// client\src\Weather.jsx
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SunCalc from 'suncalc'

import TemperatureGauge from './components/TemperatureGauge'
import Compass          from './components/Compass'
import SunClock         from './components/SunClock'
import RainGauge        from './components/RainGauge'
import RainChart        from './components/RainChart'
import WindChart        from './components/WindChart'
import TempChart        from './components/TempChart'
import PressureChart    from './components/PressureChart'
import DailyTempChart   from './components/DailyTempChart'
import DailyWindChart   from './components/DailyWindChart'
import DailyRainChart   from './components/DailyRainChart'
import DailyPressureChart from './components/DailyPressureChart'
import UpdateIndicator  from './components/UpdateIndicator'
import WindFlag         from './components/WindFlag'

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
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    let isMounted = true

    async function fetchData() {
      try {
        const currentRes = await fetch('/api/weather/current')
        if (!currentRes.ok) throw new Error(`Current status ${currentRes.status}`)
        const currentJson = await currentRes.json()

        const statsRes = await fetch('/api/weather/stats')
        if (!statsRes.ok) throw new Error(`Stats status ${statsRes.status}`)
        const statsJson = await statsRes.json()

        if (isMounted) {
          setData(currentJson)
          setStats(statsJson)
          setLastUpdated(Date.now());
        }
      } catch (err) {
        if (isMounted) setError(err.toString())
      }
    }

    fetchData()
    const id = setInterval(fetchData, 5000)  // Update every 5 seconds
    return () => {
      isMounted = false
      clearInterval(id)
    }
  }, [])

  if (error) return <div className="p-8 text-red-400">Error loading: {error}</div>
  if (!data)  return <p className="text-center mt-8">Loading weather…</p>

  const displayLow  = stats.low  != null ? stats.low  : '--'
  const displayHigh = stats.high != null ? stats.high : '--'

  const currTemp = data.out_temp != null
    ? data.out_temp
    : stats.current != null
    ? stats.current
    : '--'

  const vKmh = data.current_windspeed != null ? data.current_windspeed * 3.6 : null

  const feelsLow     = stats.low  != null && vKmh != null
    ? windChill(stats.low,   vKmh)
    : '--'
  const feelsCurrent =
    (data.out_temp != null || stats.current != null) && vKmh != null
      ? windChill(
          data.out_temp != null ? data.out_temp : stats.current,
          vKmh
        )
      : '--'
  const feelsHigh = stats.high != null && vKmh != null
    ? windChill(stats.high, vKmh)
    : '--'

  // sunrise/sunset
  const now = new Date()
  const { sunrise, sunset } = SunCalc.getTimes(now, 60.24111, 10.69972)
  const sunriseStr = sunrise.toLocaleTimeString([], {
    hour:   '2-digit',
    minute: '2-digit',
  })
  const sunsetStr = sunset.toLocaleTimeString([], {
    hour:   '2-digit',
    minute: '2-digit',
  })

  // Rain values
  const dayRainValue      = data.day_rain ?? null
  const rainRate10Value   = data.rain_rate_mm_min ?? null
  const yesterdayRainValue = data.yesterday_rain ?? null
  const uvIndex_raw       = data.uv_index ?? null

  return (
    <div className="min-h-screen bg-brand-dark text-white p-6">
      <div className="flex justify-between items-center">
        <Link to="/" className="text-brand-accent hover:underline">← Back</Link>
        <UpdateIndicator lastUpdated={lastUpdated} />
      </div>
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
          current={data.current_windspeed}
          average={data.avg_wind_10min}  // Updated to use avg_wind_10min (was windAvg)
          direction={data.wind_dir}
        />
        <WindFlag current={data.current_windspeed} />
        {/* <WindFlag /> */}
      </div>

      {/* SunClock & RainGauge row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {/* SunClock */}
        <div className="h-[200px] bg-brand-deep rounded-lg shadow-md flex items-center justify-center">
          <SunClock sunrise={sunriseStr} sunset={sunsetStr} />
        </div>

        {/* RainGauge + stats in its original middle column */}
        <div className="h-[200px] bg-brand-deep rounded-lg shadow-md p-4 flex items-center justify-center">
          <RainGauge
            dayRain={dayRainValue}
            rainRate10min={rainRate10Value}
            yesterdayRain={yesterdayRainValue}
            uvIndex_raw={uvIndex_raw}
          />
        </div>

        {/* Placeholder for third column (if needed) */}
        <div />
      </div>

      {/* Historical Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <RainChart />
        <WindChart />
        <TempChart />
        <PressureChart />
      </div>

      {/* Daily Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        <DailyTempChart />
        <DailyWindChart />
        <DailyRainChart />
        <DailyPressureChart />
      </div>
    </div>
  )
}