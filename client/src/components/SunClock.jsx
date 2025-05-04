import React, { useEffect, useState } from 'react';
import sunIcon from '../assets/sun.png';
import moonIcon from '../assets/moon.png';

// Helper: convert polar coords to Cartesian
function polarToCartesian(cx, cy, r, angleDeg) {
  const angleRad = (angleDeg - 90) * Math.PI / 180.0;
  return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
}

// Describe an SVG arc path
function describeArc(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

export default function SunClock({ sunrise = '06:00', sunset = '18:00' }) {
  const [angle, setAngle] = useState(0);
  const [timeString, setTimeString] = useState('');
  const [riseRemaining, setRiseRemaining] = useState('');
  const [setRemaining, setSetRemaining] = useState('');

  useEffect(() => {
    function update() {
      const now = new Date();
      const [srH, srM] = sunrise.split(':').map(Number);
      const [ssH, ssM] = sunset.split(':').map(Number);

      const sunriseDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), srH, srM);
      const sunsetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), ssH, ssM);
      const nextSunrise = new Date(sunriseDate);
      nextSunrise.setDate(sunriseDate.getDate() + 1);

      const totalMs = sunsetDate - sunriseDate;
      const elapsedMs = now - sunriseDate;
      const pctDay = Math.max(0, Math.min(elapsedMs / totalMs, 1));
      setAngle(pctDay * 360);

      setTimeString(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

      // Calculate remaining times, only one shown at a time
      const msToRise = now < sunriseDate || now > sunsetDate ?
        (now < sunriseDate ? sunriseDate - now : nextSunrise - now) :
        0;
      const msToSet = now >= sunriseDate && now <= sunsetDate ? sunsetDate - now : 0;
      const format = ms => {
        const h = Math.floor(ms / 3600000);
        const m = Math.floor((ms % 3600000) / 60000);
        return `${h}h ${m}m`;
      };
      setRiseRemaining(msToRise > 0 ? format(msToRise) : '');
      setSetRemaining(msToSet > 0 ? format(msToSet) : '');
    }
    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, [sunrise, sunset]);

  // Arc angles and icon positions
  const [srH, srM] = sunrise.split(':').map(Number);
  const [ssH, ssM] = sunset.split(':').map(Number);
  const srDeg = ((srH * 60 + srM) / 1440) * 360;
  const ssDeg = ((ssH * 60 + ssM) / 1440) * 360;
  const midDay = srDeg + (ssDeg - srDeg) / 2;
  const midNight = ssDeg + ((srDeg + 360) - ssDeg) / 2;
  const sunPos = polarToCartesian(50, 50, 45, midDay);
  const moonPos = polarToCartesian(50, 50, 45, midNight);

  // Sizes
  const iconSize = 15;
  const iconOffset = iconSize / 2;
  const side = 16;
  const height = (side * Math.sqrt(3)) / 2;

  return (
    <div className="w-full px-4">
      <h2 className="text-center text-lg font-semibold mb-4 text-white">Sun Clock</h2>
      <div className="flex items-center justify-center space-x-8">
        {/* Legends */}
        <div className="flex flex-col items-end text-white space-y-2 shrink-0">
          <div className="text-right">
            <p className="text-2xl font-semibold">{sunrise}</p>
            <p className="text-base">Sunrise</p>
          </div>
          <div className="text-right">
            <h1 className="text-2xl font-semibold">{sunset}</h1>
            <p className="text-base">Sunset</p>
          </div>
        </div>

        {/* Clock container */}
        <div className="relative w-32 h-32">
          {/* Triangle pointer */}
          <svg
            className="absolute -top-3 left-1/2 transform -translate-x-1/2"
            width={side}
            height={height}
            viewBox={`0 0 ${side} ${height}`}
            style={{ transform: `translateX(-50%) rotate(${60 - angle}deg)` }}
          >
            <polygon points={`${side / 2},0 ${side},${height} 0,${height}`} fill="white" />
          </svg>

          {/* Clock face */}
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="45" stroke="#5A6775" strokeWidth="2" fill="none" />
            <path
              d={describeArc(50, 50, 45, srDeg, ssDeg)}
              fill="none"
              stroke="#83BBF5"
              strokeWidth="8"
            />
            <path
              d={describeArc(50, 50, 45, ssDeg, srDeg + 360)}
              fill="none"
              stroke="#111827"
              strokeWidth="8"
            />
            <text
              x="50"
              y="50"
              textAnchor="middle"
              dominantBaseline="middle"
              className="font-digital text-xl"
              style={{ fill: 'white' }}
            >
              {timeString}
            </text>
            <image
              href={sunIcon}
              width={iconSize}
              height={iconSize}
              x={sunPos.x - iconOffset}
              y={sunPos.y - iconOffset}
            />
            <image
              href={moonIcon}
              width={iconSize}
              height={iconSize}
              x={moonPos.x - iconOffset}
              y={moonPos.y - iconOffset}
            />
          </svg>
        </div>

        {/* Remaining time: only one shown, split into number and label */}
        <div className="flex flex-col items-start text-white shrink-0">
          {setRemaining && (
            <div className="flex flex-col items-start">
              <span className="text-xl font-semibold">{setRemaining}</span>
              <span className="text-sm">to sun to set</span>
            </div>
          )}
          {riseRemaining && (
            <div className="flex flex-col items-start">
              <span className="text-xl font-semibold">{riseRemaining}</span>
              <span className="text-sm">to sun to rise</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
