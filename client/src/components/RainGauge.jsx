import React, { useMemo, useState } from 'react'
import { mmToIn } from '../utils/conversions'

export default function RainGauge({
  dayRain = 0,
  rainRate10min = 0,
  yesterdayRain = 0,
  vp_solar_wm2 = 0,
}) {
  // Constants
  const [unit, setUnit] = useState('mm')
  const toggleUnit = () => setUnit(u => u === 'mm' ? 'in' : 'mm')

  const maxRainMm = 60 // mm capacity
  const maxRain = unit === 'mm' ? maxRainMm : mmToIn(maxRainMm)

  const convert = (val) => (typeof val === 'number') ? (unit === 'mm' ? val : mmToIn(val)) : 0

  const dayRainConverted = convert(dayRain)
  const yesterdayRainConverted = convert(yesterdayRain)
  const rainRate10minConverted = convert(rainRate10min)
  const rainRateHourConverted = rainRate10minConverted * 60 // to /hr

  // Bucket outer coordinates
  const bucketTopY = 20
  const bucketBottomY = 120
  const topLeftX = 10
  const topRightX = 90
  const bottomLeftX = 25
  const bottomRightX = 75

  // Inner bucket (for clipping water and raindrops)
  const innerTopLeftX = topLeftX + 3       // 13
  const innerTopRightX = topRightX - 3     // 87
  const innerBottomLeftX = bottomLeftX + 3 // 28
  const innerBottomRightX = bottomRightX - 3 // 72
  const innerTopY = bucketTopY + 3         // 23
  const innerBottomY = bucketBottomY - 3   // 117

  // Calculate water fill height (0–maxRain mapped to 0–bucketHeight)
  const percent = Math.min(dayRainConverted / maxRain, 1)
  const bucketHeight = innerBottomY - innerTopY // 94
  const waterHeight = bucketHeight * percent
  const waterY = innerBottomY - waterHeight

  // Raindrop animation parameters
  const dropCount = 6
  const dropLength = 10
  const fallDuration = 1 // seconds
  const dropWidth = Math.min(Math.max(rainRate10min / 2, 1), 5)

  // Generate raindrops if raining
  const drops = useMemo(() => {
    if (rainRate10min <= 0) return []
    return Array.from({ length: dropCount }).map(() => {
      const x = innerTopLeftX + Math.random() * (innerTopRightX - innerTopLeftX)
      const delay = Math.random() * fallDuration
      return { x, delay }
    })
  }, [rainRate10min])

  // Sun/cloud parameters
  const svgWidth = 100
  const svgHeight = 140
  const rayCount = 8
  const rayOuterRadius = 14
  const rayInnerRadius = 8
  const sunCenterX = svgWidth / 2
  const sunCenterY = bucketTopY - 8
  const rayAngles = Array.from({ length: rayCount }).map(
    (_, i) => (360 / rayCount) * i
  )

  // Format numbers (two decimals)
  const fmt2 = (val, unitStr) => (typeof val === 'number' ? `${val.toFixed(2)} ${unitStr}` : '--')
  const dayRainStr = fmt2(dayRainConverted, unit)
  const rainRateUnit = unit === 'mm' ? 'mm/hr' : 'in/hr'
  const rainRateHourStr = fmt2(rainRateHourConverted, rainRateUnit)
  const yesterdayRainStr = fmt2(yesterdayRainConverted, unit)

  // Determine whether to show cloud or sun based solely on current rain rate and UV index
  const showCloud = rainRate10min <= 0 && vp_solar_wm2 <= 500
  const showSun = rainRate10min <= 0 && vp_solar_wm2 > 500

  return (
    <div className="w-full px-4 relative cursor-pointer" onClick={toggleUnit}>
      <div 
        className="absolute top-[-4px] left-2 w-10 h-10 rounded-full bg-brand-mid text-white flex items-center justify-center text-base font-bold"
      >
        {unit}
      </div>
      <h2 className="text-center text-base sm:text-lg font-semibold mb-2 text-white">
        Rain Meter
      </h2>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-x-2 sm:gap-x-4">
        {/* Left: Today's Rain */}
        <div className="flex flex-col items-end text-white space-y-1 shrink-0">
          <p className="text-xl sm:text-3xl font-semibold">{dayRainStr}</p>
          <p className="text-xs sm:text-base">Today's Rain</p>
        </div>

        {/* Center: Bucket + Sun/Cloud */}
        <div className="w-[25vw] min-w-16 max-w-24 flex-shrink-0">
          <svg
            width="100%"
            height="auto"
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Cloud animation when rainRate10min ≤ 0 and vp_solar_wm2 ≤ 500 */}
            {showCloud && (
              <g>
                <circle cx={sunCenterX - 8} cy={sunCenterY} r="6" fill="#9CA3AF">
                  <animateTransform
                    attributeName="transform"
                    type="translate"
                    values="-3 0;3 0;-3 0"
                    dur="4s"
                    repeatCount="indefinite"
                  />
                </circle>
                <circle cx={sunCenterX - 4} cy={sunCenterY - 4} r="5" fill="#6B7280">
                  <animateTransform
                    attributeName="transform"
                    type="translate"
                    values="3 0;-3 0;3 0"
                    dur="4s"
                    repeatCount="indefinite"
                  />
                </circle>
                <circle cx={sunCenterX} cy={sunCenterY} r="8" fill="#4B5563">
                  <animateTransform
                    attributeName="transform"
                    type="translate"
                    values="-2 0;2 0;-2 0"
                    dur="4s"
                    repeatCount="indefinite"
                  />
                </circle>
              </g>
            )}

            {/* Sun animation when rainRate10min ≤ 0 and vp_solar_wm2 > 500 */}
            {showSun && (
              <g>
                {rayAngles.map((angle, i) => {
                  const rad = (angle * Math.PI) / 180
                  const x1 = sunCenterX + Math.cos(rad) * rayInnerRadius
                  const y1 = sunCenterY + Math.sin(rad) * rayInnerRadius
                  const x2 = sunCenterX + Math.cos(rad) * rayOuterRadius
                  const y2 = sunCenterY + Math.sin(rad) * rayOuterRadius
                  return (
                    <line
                      key={i}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="#fbbf24"
                      strokeWidth="2"
                      opacity="0.8"
                    >
                      <animateTransform
                        attributeName="transform"
                        type="rotate"
                        from={`0 ${sunCenterX} ${sunCenterY}`}
                        to={`360 ${sunCenterX} ${sunCenterY}`}
                        dur="16s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        values="0.8;0.3;0.8"
                        dur="6s"
                        repeatCount="indefinite"
                        begin={`${i * 0.3}s`}
                      />
                    </line>
                  )
                })}
                <circle
                  cx={sunCenterX}
                  cy={sunCenterY}
                  r="6"
                  fill="#fbbf24"
                  opacity="0.9"
                >
                  <animate
                    attributeName="r"
                    values="6;7;6"
                    dur="6s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.9;0.7;0.9"
                    dur="6s"
                    repeatCount="indefinite"
                  />
                </circle>
              </g>
            )}

            {/* Bucket handle */}
            <path
              d={`M ${topLeftX},${bucketTopY} Q ${svgWidth / 2} ${bucketTopY + 20} ${topRightX},${bucketTopY}`}
              stroke="white"
              strokeWidth="3"
              fill="none"
            />

            {/* Bucket outer shape */}
            <polygon
              points={`
                ${topLeftX},${bucketTopY}
                ${topRightX},${bucketTopY}
                ${bottomRightX},${bucketBottomY}
                ${bottomLeftX},${bucketBottomY}
              `}
              fill="none"
              stroke="white"
              strokeWidth="2"
            />

            {/* Clip path for bucket interior */}
            <defs>
              <clipPath id="bucket-clip">
                <polygon
                  points={`
                    ${innerTopLeftX},${innerTopY}
                    ${innerTopRightX},${innerTopY}
                    ${innerBottomRightX},${innerBottomY}
                    ${innerBottomLeftX},${innerBottomY}
                  `}
                />
              </clipPath>
            </defs>

            {/* Water fill */}
            <rect
              x={innerTopLeftX}
              y={waterY}
              width={innerTopRightX - innerTopLeftX}
              height={waterHeight}
              fill="#3b82f6"
              opacity="0.5"
              clipPath="url(#bucket-clip)"
            />

            {/* Raindrops and splashes */}
            {rainRate10min > 0 && (
              <g clipPath="url(#bucket-clip)">
                {drops.map((drop, i) => {
                  const startY1 = innerTopY
                  const endY1 = waterY - dropLength
                  const startY2 = innerTopY + dropLength
                  const endY2 = waterY

                  return (
                    <g key={i}>
                      {/* Falling drop */}
                      <line
                        x1={drop.x}
                        x2={drop.x}
                        y1={startY1}
                        y2={startY2}
                        stroke="#3b82f6"
                        strokeWidth={dropWidth}
                        opacity="0.7"
                      >
                        <animate
                          attributeName="y1"
                          values={`${startY1};${endY1}`}
                          dur={`${fallDuration}s`}
                          begin={`${drop.delay}s`}
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="y2"
                          values={`${startY2};${endY2}`}
                          dur={`${fallDuration}s`}
                          begin={`${drop.delay}s`}
                          repeatCount="indefinite"
                        />
                      </line>
                      {/* Splash */}
                      <circle
                        cx={drop.x}
                        cy={endY2}
                        r="0"
                        fill="#3b82f6"
                        opacity="0"
                      >
                        <animate
                          attributeName="r"
                          values="0;5;0"
                          dur="0.5s"
                          begin={`${drop.delay + fallDuration}s`}
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="opacity"
                          values="0.7;0"
                          dur="0.5s"
                          begin={`${drop.delay + fallDuration}s`}
                          repeatCount="indefinite"
                        />
                      </circle>
                    </g>
                  )
                })}
              </g>
            )}
          </svg>
        </div>

        {/* Right: Stats (left-aligned) */}
        <div className="flex-shrink-0 flex flex-col items-start text-white space-y-1 sm:space-y-2">
          <div>
            <p className="text-xs sm:text-sm font-semibold">{rainRateHourStr}</p>
            <p className="opacity-80 text-xs">Current Rainfall</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm font-semibold">{yesterdayRainStr}</p>
            <p className="opacity-80 text-xs">Rain in the past Hour</p>
          </div>
        </div>
      </div>
    </div>
  )
}