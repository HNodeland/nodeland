// client/src/components/DailyWindChart.jsx
import { useEffect, useState } from 'react';
import {
  LineChart, Line,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend,
  ResponsiveContainer,
} from 'recharts';

export default function DailyWindChart() {
  const [data, setData] = useState([]);
  const [days, setDays] = useState(30);

  useEffect(() => {
    fetch(`/api/weather/daily-wind?days=${days}`)
      .then(r => r.json())
      .then(setData)
      .catch(console.error);
  }, [days]);

  return (
    <div className="max-h-[300px] h-full w-full bg-brand-deep p-4 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">Daily Wind Speed</h2>
        <select 
          value={days} 
          onChange={(e) => setDays(Number(e.target.value))}
          className="bg-brand-mid text-white p-1 rounded text-sm"
        >
          <option value={7}>7 days</option>
          <option value={30}>30 days</option>
          <option value={90}>90 days</option>
          <option value={180}>180 days</option>
          <option value={365}>1 year</option>
          <option value={730}>2 years</option>
          <option value={1095}>3 years</option>
          <option value={1825}>5 years</option>
          <option value={3650}>10 years</option>
        </select>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fill: '#fff' }} interval={Math.floor(days / 10)} />
          <YAxis tick={{ fill: '#fff' }} unit=" m/s" ticks={[0, 5, 10, 15, 20, 25, 30]} />
          <Tooltip contentStyle={{ backgroundColor: '#2D3B4B', border: 'none' }} />
          <Legend />
          <Line type="monotone" dataKey="max_wind" name="Max Wind" stroke="#ff7300" dot={false} />
          <Line type="monotone" dataKey="avg_wind" name="Avg Wind" stroke="#83BBF5" dot={false} />
          <Line type="monotone" dataKey="min_wind" name="Min Wind" stroke="#228B22" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}