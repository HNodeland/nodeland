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
  const degrees = Array.from({ length: 61 }, (_, i) => i - 30)

  // compute current position percentage
  const currentNum = Number(current)
  const currentPos = isNaN(currentNum)
    ? 50
    : ((currentNum + 30) / 60) * 100

  // derive pointer color from gradient
  let pointerColor = '#fff'
  if (!isNaN(currentNum)) {
    if (currentPos <= 50) {
      const ratio = currentPos / 50
      const r = Math.round(255 * ratio)
      const g = Math.round(255 * ratio)
      pointerColor = `rgb(${r},${g},255)`
    } else {
      const ratio = (currentPos - 50) / 50
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

      {/* Shift gauge & stats up 50px */}
      <div className="relative -top-[50px]">
        {/* Gauge with pointer */}
        <div className="relative w-full h-32 -mt-[30px]">
          {/* Gradient bar (48px thick) */}
          <div
            className="absolute bottom-0 w-full"
            style={{
              height: '48px',
              background:
                'linear-gradient(to right, rgb(0,0,255) 0%, rgb(255,255,255) 50%, rgb(255,0,0) 100%)',
            }}
          />

          {/* animated equilateral triangle pointer rotated 60° */}
          <motion.div
            className="absolute z-10"
            style={{
              bottom: '48px',               // base of triangle touching bar
              width: 0,
              height: 0,
              borderLeft: `${side/2}px solid transparent`,
              borderRight: `${side/2}px solid transparent`,
              borderBottom: `${height}px solid ${pointerColor}`,
              transform: 'translateX(-50%) rotate(60deg)',
              transformOrigin: 'center',
            }}
            animate={{ left: `${currentPos}%` }}
            transition={{ type: 'spring', stiffness: 170, damping: 26 }}
          />

          {/* Ticks inside bar */}
          {degrees.map((deg) => {
            const pos = ((deg + 30) / 60) * 100
            let tickHeight = 6
            if (deg % 10 === 0) tickHeight = 48
            else if (deg % 5 === 0) tickHeight = 24
            return (
              <div
                key={deg}
                className="absolute"
                style={{
                  left: `${pos}%`,
                  bottom: '0',
                  width: '1px',
                  height: `${tickHeight}px`,
                  background: '#fff',
                  transform: 'translateX(-0.5px)',
                }}
              />
            )
          })}

          {/* Labels every 10° */}
          {degrees
            .filter((deg) => deg % 10 === 0)
            .map((deg) => {
              const pos = ((deg + 30) / 60) * 100
              return (
                <span
                  key={deg}
                  className="absolute text-xs text-white"
                  style={{
                    left: `${pos}%`,
                    bottom: '-1.25rem',
                    transform: 'translateX(-50%)',
                  }}
                >
                  {deg}
                </span>
              )
            })}
        </div>

        {/* Primary statistics */}
        <div className="mt-12 grid grid-cols-3 text-center gap-x-4">
          <div>
            <div className="text-2xl font-bold text-white">{low}°C</div>
            <div className="text-xs text-brand-light mt-1">
              {t('temperatureGauge.stats.low')}
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{current}°C</div>
            <div className="text-xs text-brand-light mt-1">
              {t('temperatureGauge.stats.current')}
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{high}°C</div>
            <div className="text-xs text-brand-light mt-1">
              {t('temperatureGauge.stats.high')}
            </div>
          </div>
        </div>

        {/* Feels-like statistics */}
        <div className="mt-4 grid grid-cols-3 text-center gap-x-4">
          <div>
            <div className="text-lg font-semibold text-brand-mid">
              {feelsLow}°C
            </div>
            <div className="text-[10px] text-brand-light mt-1">
              {t('temperatureGauge.feels.low')}
            </div>
          </div>
          <div>
            <div className="text-lg font-semibold text-brand-mid">
              {feelsCurrent}°C
            </div>
            <div className="text-[10px] text-brand-light mt-1">
              {t('temperatureGauge.feels.current')}
            </div>
          </div>
          <div>
            <div className="text-lg font-semibold text-brand-mid">
              {feelsHigh}°C
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
