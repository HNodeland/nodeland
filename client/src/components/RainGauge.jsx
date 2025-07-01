// client/src/components/RainGauge.jsx
import React, { useMemo } from 'react'

export default function RainGauge({
  dayRain = 0,
  rainRate10min = 0,
  yesterdayRain = 0,
  vp_solar_wm2 = 0,
}) {
  // Convert raw UV to UVI


  // Constants
  const maxRain = 150 // mm capacity

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
  const percent = Math.min(dayRain / maxRain, 1)
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
  const fmt2 = (val, unit) => (val != null ? `${val.toFixed(2)} ${unit}` : '--')
  const dayRainStr = `${dayRain.toFixed(2)}mm`
  const rainRateHourStr = fmt2(rainRate10min, 'mm/hr')
  const yesterdayRainStr = fmt2(yesterdayRain, 'mm')

  // Determine whether to show cloud or sun based solely on current rain rate and UV index
  const showCloud = rainRate10min <= 0 && vp_solar_wm2 <= 500
  const showSun = rainRate10min <= 0 && vp_solar_wm2 > 500

  return (
    <div className="w-full px-4">
      <h2 className="text-center text-lg font-semibold mb-4 text-white">
        Rain Meter
      </h2>

      <div className="flex items-center justify-center space-x-11 overflow-x-auto">
        {/* Left: Today's Rain */}
        <div className="ml-[15px] flex flex-col items-center text-white space-y-1 shrink-0">
          <p className="text-3xl font-semibold">{dayRainStr}</p>
          <p className="text-base">Today's Rain</p>
        </div>

        {/* Center: Bucket + Sun/Cloud */}
        <div className="w-20 sm:w-24 flex-shrink-0">
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
        <div className="flex-shrink-0 flex flex-col items-start text-white text-xs space-y-2">
          <div>
            <p className="text-sm font-semibold">{rainRateHourStr}</p>
            <p className="opacity-80">Current Rainfall</p>
          </div>
          <div>
            <p className="text-sm font-semibold">{yesterdayRainStr}</p>
            <p className="opacity-80">Rain in the past Hour</p>
          </div>
        </div>
      </div>
    </div>
  )
}
