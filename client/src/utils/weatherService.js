import { useState, useEffect } from 'react';

export function parseRaw(raw) {
  const parts = raw.trim().split(/\s+/);
  return {
    timestamp: Date.now(),
    windSpeed:        parseFloat(parts[1]),  // m/s
    windGust:         parseFloat(parts[2]),  // m/s
    windDir:          parseFloat(parts[3]),  // degrees
    temperature:      parseFloat(parts[4]),  // °C
    humidity:         parseFloat(parts[5]),  // %
    pressure:         parseFloat(parts[6]),  // hPa
    precipitation24h: parseFloat(parts[8]),  // mm in last 24 h
    solarRadiation:   parseFloat(parts[9]),  // W/m²
    uvIndex:          parseFloat(parts[16]), // UV index
    windFactor:       parseFloat(parts[10])  // arbitrary “wind factor”
  };
}

export function useWeatherData() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    let mounted = true;
    async function fetchAndAppend() {
      try {
        const res = await fetch('/clientraw.txt');
        const text = await res.text();
        const entry = parseRaw(text);
        if (!mounted) return;
        setHistory(prev => {
          const cutoff = Date.now() - 24 * 60 * 60 * 1000;
          const recent = prev.filter(e => e.timestamp >= cutoff);
          return [...recent, entry];
        });
      } catch (err) {
        console.error('weather fetch error', err);
      }
    }

    fetchAndAppend();
    const iv = setInterval(fetchAndAppend, 20_000);
    return () => {
      mounted = false;
      clearInterval(iv);
    };
  }, []);

  return history;
}
