// client/src/components/TemperatureGauge.jsx
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { cToF } from '../utils/conversions'

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
  const [unit, setUnit] = useState('C')
  const toggleUnit = () => setUnit(u => u === 'C' ? 'F' : 'C')

  // Helper to format a value to one decimal, or pass through placeholders
  const fmt = v => (typeof v === 'number' ? v.toFixed(1) : v)

  const convert = v => unit === 'C' ? v : cToF(v)

  // prepare formatted strings
  const lowStr     = fmt(convert(low))
  const currentStr = fmt(convert(current))
  const highStr    = fmt(convert(high))
  const feelsLowStr     = fmt(convert(feelsLow))
  const feelsCurrentStr = fmt(convert(feelsCurrent))
  const feelsHighStr    = fmt(convert(feelsHigh))

  // compute current position percentage for pointer
  let currentNum = typeof current === 'number' ? current : parseFloat(current)
  let minRange = -30
  let maxRange = 30
  if (unit === 'F') {
    currentNum = convert(currentNum)
    minRange = convert(-30)
    maxRange = convert(30)
  }
  const posPct = isNaN(currentNum)
    ? 50
    : ((currentNum - minRange) / (maxRange - minRange)) * 100

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
    <div className="max-h-[300px] h-full w-full bg-brand-deep p-4 rounded-lg shadow-md overflow-hidden cursor-pointer" onClick={toggleUnit}>
      {/* Header with title and unit circle */}
      <div className="flex items-center justify-center mb-4 relative">
        <h4 className="text-lg font-semibold text-white">
          {t('temperatureGauge.title').slice(0, -4)} (°{unit})
        </h4>
        <div 
          className="absolute left-0 w-10 h-10 rounded-full bg-brand-mid text-white flex items-center justify-center text-lg font-bold"
        >
          °{unit}
        </div>
      </div>

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
          {Array.from({ length: 61 }, (_, i) => i - 30).map(degC => {
            const deg = unit === 'C' ? degC : convert(degC)
            const pct = ((degC + 30) / 60) * 100
            const tickH = degC % 10 === 0 ? 48 : degC % 5 === 0 ? 24 : 6
            return (
              <React.Fragment key={degC}>
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
                {degC % 10 === 0 && (
                  <span
                    className="absolute text-xs text-white"
                    style={{
                      left: `${pct}%`,
                      bottom: '-1.25rem',
                      transform: 'translateX(-50%)',
                    }}
                  >
                    {unit === 'C' ? deg : Math.round(deg)}
                  </span>
                )}
              </React.Fragment>
            )
          })}
        </div>

        {/* Main stats */}
        <div className="mt-12 grid grid-cols-3 text-center gap-x-4">
          <div>
            <div className="text-2xl font-bold text-white">{lowStr}°{unit}</div>
            <div className="text-xs text-brand-light mt-1">
              {t('temperatureGauge.stats.low')}
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{currentStr}°{unit}</div>
            <div className="text-xs text-brand-light mt-1">
              {t('temperatureGauge.stats.current')}
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{highStr}°{unit}</div>
            <div className="text-xs text-brand-light mt-1">
              {t('temperatureGauge.stats.high')}
            </div>
          </div>
        </div>

        {/* Feels-like stats */}
        <div className="mt-4 grid grid-cols-3 text-center gap-x-4">
          <div>
            <div className="text-lg font-semibold text-brand-mid">
              {feelsLowStr}°{unit}
            </div>
            <div className="text-[10px] text-brand-light mt-1">
              {t('temperatureGauge.feels.low')}
            </div>
          </div>
          <div>
            <div className="text-lg font-semibold text-brand-mid">
              {feelsCurrentStr}°{unit}
            </div>
            <div className="text-[10px] text-brand-light mt-1">
              {t('temperatureGauge.feels.current')}
            </div>
          </div>
          <div>
            <div className="text-lg font-semibold text-brand-mid">
              {feelsHighStr}°{unit}
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