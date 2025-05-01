import React from 'react';
import { RadialBarChart, RadialBar, Legend } from 'recharts';

export default function BarometerGauge({ value }) {
  const data = [{ name: 'hPa', value }];
  return (
    <div className="max-h-[300px] h-full w-full bg-brand-deep p-4 rounded-lg shadow-md">
      <h4 className="text-center mb-2">Pressure</h4>
      <RadialBarChart
        width={200} height={200}
        cx="50%" cy="50%"
        innerRadius="70%" outerRadius="100%"
        barSize={15}
        data={data}
        startAngle={180} endAngle={0}
      >
        <RadialBar dataKey="value" background clockWise />
        <Legend
          iconSize={0}
          layout="vertical"
          verticalAlign="middle"
          align="center"
          formatter={() => `${value.toFixed(1)} hPa`}
        />
      </RadialBarChart>
    </div>
  );
}
