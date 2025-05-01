// client/src/components/Compass.jsx
import React, { useEffect, useState } from 'react'
import { useMotionValue, useSpring } from 'framer-motion'
import { useTranslation } from 'react-i18next'

export default function Compass({ direction = 0 }) {
  const { t } = useTranslation()

  // outerR was 32.5; now 37.5 (+5px radius => +10px diameter)
  const outerR    = 37.5
  const tickInner = outerR - 5
  const tickOuter = outerR
  const centerR   = 9
  const arrowLen  = outerR - centerR - 4

  // ticks every 30°
  const ticks = []
  for (let deg = 0; deg < 360; deg += 30) {
    const rad = (deg * Math.PI) / 180
    ticks.push({
      key: deg,
      x1: 50 + tickInner * Math.sin(rad),
      y1: 50 - tickInner * Math.cos(rad),
      x2: 50 + tickOuter * Math.sin(rad),
      y2: 50 - tickOuter * Math.cos(rad),
    })
  }

  // cardinal labels
  const labels = [
    { text: 'N', angle:   0 },
    { text: 'E', angle:  90 },
    { text: 'S', angle: 180 },
    { text: 'W', angle: 270 },
  ].map(({ text, angle }) => {
    const rad = (angle * Math.PI) / 180
    const r   = outerR + 10
    return {
      key: text,
      text,
      x: 50 + r * Math.sin(rad),
      y: 50 - r * Math.cos(rad) + 3,
    }
  })

  // animate
  const dirMV     = useMotionValue(direction)
  const dirSpring = useSpring(dirMV, { stiffness: 120, damping: 25 })
  const [disp, setDisp] = useState(direction)

  useEffect(() => { dirMV.set(direction) }, [direction, dirMV])
  useEffect(() => {
    const unsub = dirSpring.on('change', v => setDisp(v))
    return unsub
  }, [dirSpring])

  // arrow endpoint
  const radDir    = (disp * Math.PI) / 180
  const arrowEndX = 50 + arrowLen * Math.sin(radDir)
  const arrowEndY = 50 - arrowLen * Math.cos(radDir)

  return (
    <div className="bg-brand-deep p-4 rounded-lg shadow-md w-full max-h-[300px]">
      <h4 className="text-center text-lg font-semibold mb-2 text-white">
        {t('windDirection')}
      </h4>
      <svg
        viewBox="-10 -10 120 120"
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full relative -top-[10px]"
      >
        {/* outer circle */}
        <circle cx="50" cy="50" r={outerR} stroke="#888" fill="none" strokeWidth="2" />

        {/* ticks */}
        {ticks.map(t => (
          <line
            key={t.key}
            x1={t.x1} y1={t.y1}
            x2={t.x2} y2={t.y2}
            stroke="#aaa"
            strokeWidth="2"
          />
        ))}

        {/* labels */}
        {labels.map(l => (
          <text
            key={l.key}
            x={l.x} y={l.y}
            fill="#fff"
            fontSize="8"
            fontWeight="bold"
            textAnchor="middle"
          >
            {l.text}
          </text>
        ))}

        {/* arrow marker */}
        <defs>
          <marker id="arrow" markerWidth="6" markerHeight="6" refX="0" refY="3" orient="auto">
            <path d="M0,0 L0,6 L6,3 z" fill="#F58383" />
          </marker>
        </defs>

        {/* moving arrow */}
        <line
          x1="50" y1="50"
          x2={arrowEndX} y2={arrowEndY}
          stroke="#F58383"
          strokeWidth="3"
          markerEnd="url(#arrow)"
        />

        {/* center */}
        <circle
          cx="50" cy="50" r={centerR}
          fill="#162433"
          stroke="#fff"
          strokeWidth="1.5"
        />

        {/* degree text */}
        <text
          x="50" y="52"
          fill="#fff"
          fontSize="6"
          fontWeight="bold"
          textAnchor="middle"
        >
          {`${Math.round(disp)}°`}
        </text>
      </svg>
    </div>
  )
}
