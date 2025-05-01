import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import TemperatureGauge   from './components/TemperatureGauge'
import Compass            from './components/Compass'
import WindStrengthGauge  from './components/WindStrengthGauge'
import BarometerGauge     from './components/BarometerGauge'
import UVIndexGauge       from './components/UVIndexGauge'
import SunIntensityGauge  from './components/SunIntensityGauge'

import RainChart     from './components/RainChart'
import WindChart     from './components/WindChart'
import TempChart     from './components/TempChart'
import PressureChart from './components/PressureChart'

function safeFloat(parts, idx) {
  const v = parseFloat(parts[idx])
  return Number.isNaN(v) ? null : v
}


function parse(raw) {
  const parts = raw.trim().split(/\s+/)
  const dateIdx = parts.findIndex(p => /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(p))
  
  // after date: [dateIdx+1]=time?  dateIdx+2,3,4 == our feels data
  const feelsHigh    = safeFloat(parts, dateIdx + 3)
  const feelsLow     = safeFloat(parts, dateIdx + 4)
  return {
    windAvg        : safeFloat(parts, 1),
    windCurrent    : safeFloat(parts, 2),
    windDir        : safeFloat(parts, 3),
    temperature    : safeFloat(parts, 4),   // actual current temp
    humidity       : safeFloat(parts, 5),
    pressure       : safeFloat(parts, 6),
    rainToday      : safeFloat(parts, 7),
    rainMonth      : safeFloat(parts, 8),
    rainSeason     : safeFloat(parts, 9),
    rainRate       : safeFloat(parts,10),
    indoorTemp     : safeFloat(parts,12),
    indoorHumidity : safeFloat(parts,13),
    soilTemp       : safeFloat(parts,14),
    solarReading   : safeFloat(parts,34),
    uvIndex        : safeFloat(parts,79),

    // today's high/low from the wind-history parsing
    high           : safeFloat(parts,110),
    low            : safeFloat(parts,111),

    // feels-like values (wind-adjusted) at positions 44,46,47
    feelsCurrent   : safeFloat(parts, 44),
    feelsHigh,      
    feelsLow,       


  }
}

export default function Weather() {
  const [data, setData]   = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const res  = await fetch('/api/weather/raw')
        if (!res.ok) throw new Error(`Status ${res.status}`)
        const text   = await res.text()
        const parsed = parse(text)
        setData(parsed)
      } catch (err) {
        setError(err.toString())
      }
    }
    fetchData()
    const id = setInterval(fetchData, 2000)
    return () => clearInterval(id)
  }, [])

  if (error) {
    return <div className="p-8 text-red-400">Error loading weather: {error}</div>
  }
  if (!data) {
    return <p className="text-center mt-8">Loading weather…</p>
  }

  return (
    <div className="min-h-screen bg-brand-dark text-white p-6">
      <Link to="/" className="text-brand-accent hover:underline">
        &larr; Back
      </Link>
      <h1 className="text-3xl font-bold my-4">Harestua Weather Dashboard</h1>

      {/* Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <TemperatureGauge
          high={data.high}
          low={data.low}
          current={data.temperature}
          feelsHigh={data.feelsHigh}
          feelsLow={data.feelsLow}
          feelsCurrent={data.feelsCurrent}
        />
        <Compass
          current={data.windCurrent}
          average={data.windAvg}
          direction={data.windDir}
        />
        <WindStrengthGauge value={data.windCurrent} />
        <BarometerGauge    value={data.pressure} />
        <UVIndexGauge      value={data.uvIndex} />
        <SunIntensityGauge value={data.solarReading} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <RainChart />
        <WindChart />
        <TempChart />
        <PressureChart />
      </div>
    </div>
  )
}
