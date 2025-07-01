// client/src/components/VerticalBars.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';

export default function VerticalBars({ data }) {
  const { t } = useTranslation();

  const METRICS = [
    { key: 'windCurrent',  label: t('verticalBars.windCurrent'),    unit: ' m/s',   max: 20   },
    { key: 'windAvg',      label: t('verticalBars.windAvg'),     unit: ' m/s',   max: 30   },
    { key: 'uvIndex',      label: t('verticalBars.uvIndex'),      unit: '',       max: 11   },
    { key: 'solarReading', label: t('verticalBars.sunIntensity'), unit: ' W/m²', max: 1000 }
  ];

  return (
    <div
      className="h-[300px] grid grid-cols-4 gap-4 p-4 bg-brand-deep rounded-lg"
      style={{ gridTemplateRows: '1fr auto' }}
    >
      {/* Row 1: bars */}
      {METRICS.map(({ key, unit, max }) => {
        const value = Number(data[key]) || 0;
        const heightPct = Math.min((value / max) * 100, 100);

        return (
          <div
            key={key}
            className="relative w-full bg-brand-mid rounded-t-lg overflow-hidden"
          >
            <div
              className="absolute bottom-0 w-full bg-brand-accent"
              style={{ height: `${heightPct}%` }}
            />
            <div className="absolute top-1 left-0 right-0 text-xs font-bold text-white text-center">
              {value.toFixed(1)}{unit}
            </div>
          </div>
        );
      })}

      {/* Row 2: labels */}
      {METRICS.map(({ key, label }) => (
        <div
          key={key + '-label'}
          className="text-sm text-brand-light text-center whitespace-pre-line"
        >
          {label}
        </div>
      ))}
    </div>
  );
}
