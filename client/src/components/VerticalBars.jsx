import React from 'react';

// Define metrics for the bars: current wind speed, wind gust (avg), UV index, sun intensity
const METRICS = [
  { key: 'windCurrent',  label: 'Wind Speed',     unit: ' m/s',   max: 20 },
  { key: 'windAvg',      label: 'Wind Gust',      unit: ' m/s',   max: 30 },
  { key: 'uvIndex',      label: 'UV Index',       unit: '',       max: 11 },
  { key: 'solarReading', label: 'Sun Intensity',  unit: ' W/m²', max: 1000 },
];

export default function VerticalBars({ data }) {
  console.log('VerticalBars got data:', data);
  return (
    <div className="max-h-[300px] h-full flex items-end justify-around p-4 bg-brand-deep rounded-lg">
      {METRICS.map(({ key, label, unit, max }) => {
        const value = Number(data[key]) || 0;
        const heightPct = Math.min((value / max) * 100, 100);
        return (
          <div key={key} className="flex flex-col items-center w-1/5 h-full">
            {/* Bar container fills full height of this grid cell */}
            <div className="flex-1 relative w-full bg-brand-mid rounded-t-lg overflow-hidden">
              {/* Filled portion */}
              <div
                className="absolute bottom-0 w-full bg-brand-accent"
                style={{ height: `${heightPct}%` }}
              />
              {/* Value label at top of bar */}
              <div className="absolute top-1 left-0 right-0 text-xs font-bold text-white text-center">
                {value.toFixed(1)}{unit}
              </div>
            </div>
            {/* Metric label below */}
            <div className="mt-2 text-sm text-brand-light text-center">
              {label}
            </div>
          </div>
        );
      })}
    </div>
  );
}