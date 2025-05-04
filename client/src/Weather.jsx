// client/src/Weather.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SunCalc from 'suncalc';

import TemperatureGauge from './components/TemperatureGauge';
import Compass          from './components/Compass';
import VerticalBars     from './components/VerticalBars';
import SunClock         from './components/SunClock';
import RainChart        from './components/RainChart';
import WindChart        from './components/WindChart';
import TempChart        from './components/TempChart';
import PressureChart    from './components/PressureChart';

// Map of named fields to their positions in the raw data array
const FIELD_INDICES = {
  windAvg:       1,
  windCurrent:   2,
  windDir:       3,
  temperature:   4,
  humidity:      5,
  pressure:      6,
  solarReading: 34,
  uvIndex:      79,
  high:        110,
  low:         111,
  feelsCurrent: 44
};

function safeFloat(value) {
  const n = parseFloat(value);
  return Number.isNaN(n) ? null : n;
}

function parse(raw) {
  const parts = raw.trim().split(/\s+/);
  const data = {};

  // Build result using FIELD_INDICES
  for (const [key, idx] of Object.entries(FIELD_INDICES)) {
    data[key] = safeFloat(parts[idx]);
  }

  // Find the date index to calculate feelsHigh / feelsLow offsets
  const dateIdx = parts.findIndex(p => /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(p));
  if (dateIdx >= 0) {
    data.feelsHigh = safeFloat(parts[dateIdx + 3]);
    data.feelsLow  = safeFloat(parts[dateIdx + 4]);
  } else {
    data.feelsHigh = null;
    data.feelsLow  = null;
  }

  return data;
}

export default function Weather() {
  const [data, setData]   = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      try {
        const res  = await fetch('/api/weather/raw');
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const text = await res.text();
        if (isMounted) setData(parse(text));
      } catch (err) {
        if (isMounted) setError(err.toString());
      }
    }
    fetchData();
    const id = setInterval(fetchData, 2000);
    return () => { isMounted = false; clearInterval(id); };
  }, []);

  if (error) return <div className="p-8 text-red-400">Error loading: {error}</div>;
  if (!data)  return <p className="text-center mt-8">Loading weather…</p>;

  // Compute sunrise/sunset for Harestua (lat/long)
  const now = new Date();
  const { sunrise, sunset } = SunCalc.getTimes(now, 60.24111, 10.69972);
  const sunriseStr = sunrise.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const sunsetStr  = sunset.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-brand-dark text-white p-6">
      <Link to="/" className="text-brand-accent hover:underline">&larr; Back</Link>
      <h1 className="text-3xl font-bold my-4">Harestua Weather Dashboard</h1>

      {/* First row: Gauges + Bars */}
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
        <VerticalBars data={data} />
      </div>

      {/* Secondary row: SunClock + placeholders */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="h-[200px] bg-brand-deep rounded-lg shadow-md flex items-center justify-center">
          <SunClock sunrise={sunriseStr} sunset={sunsetStr} />
        </div>
        <div className="h-[200px] bg-brand-deep rounded-lg shadow-md"></div>
        <div className="h-[200px] bg-brand-deep rounded-lg shadow-md"></div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <RainChart />
        <WindChart />
        <TempChart />
        <PressureChart />
      </div>

      {/* Footer */}
      <footer className="bg-brand-dark text-brand-light mt-6">
        <div className="container mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-center">
          <nav className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 text-xs">
            <a
              href="https://www.flaticon.com/free-icons/summer"
              title="summer icons"
              className="hover:text-brand-xlight"
            >
              Summer icons by Freepik
            </a>
            <a
              href="https://www.flaticon.com/free-icons/moon"
              title="moon icons"
              className="hover:text-brand-xlight"
            >
              Moon icons by Freepik
            </a>
            <a href="https://www.flaticon.com/free-icons/letter-n" className="hover:text-brand-xlight">Letter n icons by Kian Bonanno</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
