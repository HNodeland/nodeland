// client/src/components/TemperatureGauge.jsx
import React from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

// Displays a horizontal temperature scale and key statistics
export default function TemperatureGauge({
  high = '--',
  low = '--',
  current = '--',
  feelsHigh = '--',
  feelsLow = '--',
  feelsCurrent = '--',
}) {
  const { t } = useTranslation()

  // Helper to format a value to one decimal, or pass through placeholders
  const fmt = v => (typeof v === 'number' ? v.toFixed(1) : v)

  // prepare formatted strings
  const lowStr     = fmt(low)
  const currentStr = fmt(current)
  const highStr    = fmt(high)
  const feelsLowStr     = fmt(feelsLow)
  const feelsCurrentStr = fmt(feelsCurrent)
  const feelsHighStr    = fmt(feelsHigh)

  // compute current position percentage for pointer
  const currentNum = typeof current === 'number' ? current : parseFloat(current)
  const posPct = isNaN(currentNum)
    ? 50
    : ((currentNum + 30) / 60) * 100

  // derive pointer color from gradient
  let pointerColor = '#fff'
  if (!isNaN(currentNum)) {
    if (posPct <= 50) {
      const ratio = posPct / 50
      const r = Math.round(255 * ratio)
      const g = Math.round(255 * ratio)
      pointerColor = `rgb(${r},${g},255)`
    } else {
      const ratio = (posPct - 50) / 50
      const gb = Math.round(255 * (1 - ratio))
      pointerColor = `rgb(255,${gb},${gb})`
    }
  }

  // equilateral triangle dimensions
  const side = 16
  const height = (side * Math.sqrt(3)) / 2  // ~13.86

  return (
    <div className="max-h-[300px] h-full w-full bg-brand-deep p-4 rounded-lg shadow-md overflow-hidden">
      {/* Title */}
      <h4 className="text-center text-lg font-semibold mb-4 text-white">
        {t('temperatureGauge.title')}
      </h4>

      {/* Gauge & pointer */}
      <div className="relative -top-[50px]">
        <div className="relative w-full h-32 -mt-[30px]">
          {/* Gradient bar */}
          <div
            className="absolute bottom-0 w-full"
            style={{
              height: '48px',
              background:
                'linear-gradient(to right, rgb(0,0,255) 0%, rgb(255,255,255) 50%, rgb(255,0,0) 100%)',
            }}
          />

          {/* animated pointer */}
          <motion.div
            className="absolute z-10"
            style={{
              bottom: '48px',
              width: 0,
              height: 0,
              borderLeft: `${side/2}px solid transparent`,
              borderRight: `${side/2}px solid transparent`,
              borderBottom: `${height}px solid ${pointerColor}`,
              transform: 'translateX(-50%) rotate(60deg)',
              transformOrigin: 'center',
            }}
            animate={{ left: `${posPct}%` }}
            transition={{ type: 'spring', stiffness: 170, damping: 26 }}
          />

          {/* tick marks and labels */}
          {Array.from({ length: 61 }, (_, i) => i - 30).map(deg => {
            const pct = ((deg + 30) / 60) * 100
            const tickH = deg % 10 === 0 ? 48 : deg % 5 === 0 ? 24 : 6
            return (
              <React.Fragment key={deg}>
                <div
                  className="absolute bg-white"
                  style={{
                    left: `${pct}%`,
                    bottom: 0,
                    width: '1px',
                    height: `${tickH}px`,
                    transform: 'translateX(-0.5px)',
                  }}
                />
                {deg % 10 === 0 && (
                  <span
                    className="absolute text-xs text-white"
                    style={{
                      left: `${pct}%`,
                      bottom: '-1.25rem',
                      transform: 'translateX(-50%)',
                    }}
                  >
                    {deg}
                  </span>
                )}
              </React.Fragment>
            )
          })}
        </div>

        {/* Main stats */}
        <div className="mt-12 grid grid-cols-3 text-center gap-x-4">
          <div>
            <div className="text-2xl font-bold text-white">{lowStr}°C</div>
            <div className="text-xs text-brand-light mt-1">
              {t('temperatureGauge.stats.low')}
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{currentStr}°C</div>
            <div className="text-xs text-brand-light mt-1">
              {t('temperatureGauge.stats.current')}
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{highStr}°C</div>
            <div className="text-xs text-brand-light mt-1">
              {t('temperatureGauge.stats.high')}
            </div>
          </div>
        </div>

        {/* Feels-like stats */}
        <div className="mt-4 grid grid-cols-3 text-center gap-x-4">
          <div>
            <div className="text-lg font-semibold text-brand-mid">
              {feelsLowStr}°C
            </div>
            <div className="text-[10px] text-brand-light mt-1">
              {t('temperatureGauge.feels.low')}
            </div>
          </div>
          <div>
            <div className="text-lg font-semibold text-brand-mid">
              {feelsCurrentStr}°C
            </div>
            <div className="text-[10px] text-brand-light mt-1">
              {t('temperatureGauge.feels.current')}
            </div>
          </div>
          <div>
            <div className="text-lg font-semibold text-brand-mid">
              {feelsHighStr}°C
            </div>
            <div className="text-[10px] text-brand-light mt-1">
              {t('temperatureGauge.feels.high')}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
