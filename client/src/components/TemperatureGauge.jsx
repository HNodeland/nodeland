// client/src/components/TemperatureGauge.jsx
import React from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function TemperatureGauge({ value = 0 }) {
  // map temperature to color: blue at -10°C, white at 0, red at +30
  const clamp = (v,min,max) => Math.min(Math.max(v,min),max)
  const t = clamp(value, -10, 30)
  const ratio = (t + 10) / 40
  const r = Math.round(255 * ratio)
  const b = Math.round(255 * (1 - ratio))
  const color = `rgb(${r},0,${b})`

  const data = [{ name: 'Temp', temp: value }]

  return (
    <div className="max-h-[300px] h-full w-full bg-brand-deep p-4 rounded-lg shadow-md">
      <h4 className="text-center mb-2">Temperature</h4>
      <ResponsiveContainer width="100%" height="80%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 10, bottom: 10, left: 20, right: 20 }}
        >
          <XAxis type="number" domain={[-10, 30]} hide />
          <YAxis type="category" dataKey="name" hide />
          <Tooltip
            formatter={val => `${val.toFixed(1)}°C`}
            contentStyle={{ backgroundColor: '#2D3B4B', border: 'none' }}
          />
          <Bar
            dataKey="temp"
            fill={color}
            isAnimationActive={false}
            barSize={50}
            radius={[10,10,0,0]}
          />
        </BarChart>
      </ResponsiveContainer>
      <div className="text-center mt-2 text-white font-bold">
        {value.toFixed(1)}°C
      </div>
    </div>
  )
}
