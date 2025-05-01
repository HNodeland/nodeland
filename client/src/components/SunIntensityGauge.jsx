import React from 'react';
import { RadialBarChart, RadialBar, Legend } from 'recharts';

export default function SunIntensityGauge({ value }) {
  const data = [{ name: 'W/m²', value }];
  return (
    <div className="max-h-[300px] h-full w-full bg-brand-deep p-4 rounded-lg shadow-md">
      <h4 className="text-center mb-2">Sun Intensity</h4>
      <RadialBarChart
        width={200} height={200}
        cx="50%" cy="50%" innerRadius="70%" outerRadius="100%"
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
          formatter={() => `${value.toFixed(0)} W/m²`}
        />
      </RadialBarChart>
    </div>
  );
}
