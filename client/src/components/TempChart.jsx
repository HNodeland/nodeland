// client/src/TempChart.jsx
import { useEffect, useState } from 'react'
import {
  LineChart, Line,
  XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer,
} from 'recharts'

export default function TempChart() {
  const [data, setData] = useState([])

  useEffect(() => {
    fetch('/api/weather/history')
      .then(r => r.json())
      .then(({ tempHistory }) => {
        setData(tempHistory)
      })
      .catch(console.error)
  }, [])

  return (
    <div className="max-h-[300px] h-full w-full bg-brand-deep p-4 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-2">Temperature (last 24h)</h2>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" tick={{ fill: '#fff' }} />
          <YAxis tick={{ fill: '#fff' }} unit=" °C" />
          <Tooltip contentStyle={{ backgroundColor: '#2D3B4B', border: 'none' }} />
          <Line type="monotone" dataKey="temp" stroke="#83BBF5" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
