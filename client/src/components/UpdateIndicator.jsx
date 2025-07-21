// client/src/components/UpdateIndicator.jsx
import React, { useState, useEffect } from 'react';

export default function UpdateIndicator({ lastUpdated }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (lastUpdated) {
        setElapsed((Date.now() - lastUpdated) / 1000);
      }
    }, 100);  // Update every 0.1 seconds for 1 decimal precision

    return () => clearInterval(interval);
  }, [lastUpdated]);

  // Color: green (rgb(34,139,34)) to gray (rgb(128,128,128)) over 60 seconds
  const freshness = Math.max(0, 1 - (elapsed / 60));
  const r = Math.round(34 + (128 - 34) * (1 - freshness));
  const g = Math.round(139 + (128 - 139) * (1 - freshness));
  const b = Math.round(34 + (128 - 34) * (1 - freshness));
  const color = `rgb(${r},${g},${b})`;

  return (
    <div className="flex items-center space-x-2">
      <div 
        className="w-4 h-4 rounded-full animate-pulse"
        style={{ backgroundColor: color }}
      ></div>
      <span className="text-sm opacity-70">
        {elapsed.toFixed(1)}s ago
      </span>
    </div>
  );
}