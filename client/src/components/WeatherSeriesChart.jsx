import { useEffect, useMemo, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ResponsiveContainer,
} from 'recharts';

// ───────────────────────────── helpers ─────────────────────────────
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function ordinalSuffix(n) {
  const v = n % 100;
  if (v >= 11 && v <= 13) return 'th';
  switch (n % 10) { case 1: return 'st'; case 2: return 'nd'; case 3: return 'rd'; default: return 'th'; }
}
function formatOrdinalDate(ts) {
  const d = new Date(ts);
  const m = MONTHS[d.getMonth()];
  const day = d.getDate();
  return `${m} ${day}${ordinalSuffix(day)}`;
}
function startOfLocalDay(ts) {
  const d = new Date(ts);
  d.setHours(0,0,0,0);
  return d.getTime();
}
const DAY_RANGES = new Set(['7','30','90','180','365']);

const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
const fmtDate = (d) =>
  new Date(d).toLocaleDateString([], { year: 'numeric', month: 'short', day: '2-digit' });
const fmtDateTime = (d) =>
  new Date(d).toLocaleString([], {
    year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit',
  });

function relativeLabel(ts, nowTs) {
  const diff = ts - nowTs;
  const minutes = Math.round(diff / 60000);
  const hours   = Math.round(minutes / 60);
  const days    = Math.round(hours / 24);
  const months  = Math.round(days / 30);
  const years   = Math.round(days / 365);
  if (Math.abs(years)  >= 1) return rtf.format(-years,  'year');
  if (Math.abs(months) >= 1) return rtf.format(-months, 'month');
  if (Math.abs(days)   >= 1) return rtf.format(-days,   'day');
  if (Math.abs(hours)  >= 1) return rtf.format(-hours,  'hour');
  if (Math.abs(minutes)>= 1) return rtf.format(-minutes,'minute');
  return 'now';
}

function roundVal(v, unit) {
  if (v == null || Number.isNaN(v)) return '-';
  return `${Number(v).toFixed(1)}${unit ?? ''}`;
}

// Build ticks that look good per range
function buildTicksForRange(data, rangeKey) {
  if (!data?.length) return [];
  // Today → time-of-day ticks sampled ~6 times
  if (rangeKey === 'today') {
    const n = data.length;
    const step = Math.max(1, Math.floor(n / 6));
    return data.filter((_, i) => i % step === 0).map(d => d.__x);
  }

  // Day-based ranges → one tick per distinct local day (downsampled to ~7 ticks)
  if (DAY_RANGES.has(rangeKey)) {
    const days = [];
    let last = null;
    for (const d of data) {
      const sod = startOfLocalDay(d.__x);
      if (sod !== last) { days.push(sod); last = sod; }
    }
    const target = 7;
    const step = Math.max(1, Math.ceil(days.length / target));
    return days.filter((_, i) => i % step === 0);
  }

  // Multi-year & all → spread evenly; month/year formatting handles labels
  const xs = data.map(d => d.__x);
  const min = Math.min(...xs), max = Math.max(...xs);
  const target = 8;
  if (max <= min) return [min];
  const step = (max - min) / (target - 1);
  return Array.from({ length: target }, (_, i) => Math.round(min + i * step));
}

// Keep Y ticks short (numbers only). Unit is placed on the axis label.
const yTickNumber = (v) => {
  if (!Number.isFinite(v)) return '';
  const n = Math.abs(v) < 1e-8 ? 0 : v;
  return n.toFixed(1);
};

function axisLabelFor(type) {
  switch (type) {
    case 'temp':     return '°C';
    case 'wind':     return 'm/s';
    case 'rain':     return 'mm';
    case 'pressure': return 'hPa';
    default:         return '';
  }
}
function yAxisWidthFor(type) {
  return type === 'pressure' ? 74 : 56;
}

// ────────────────────── Robust smoothing (median + clipped Gaussian) ─────────────────────
function isNearlyConstant(arr, eps = 1e-4) {
  let min = Infinity, max = -Infinity, has = false;
  for (const v of arr) {
    const n = Number(v);
    if (Number.isFinite(n)) {
      if (n < min) min = n;
      if (n > max) max = n;
      has = true;
    }
  }
  if (!has) return true;
  return (max - min) <= eps;
}

function rollingMedian(data, key, radiusPts) {
  const r = Math.max(1, Math.round(radiusPts));
  const out = new Array(data.length);
  for (let i = 0; i < data.length; i++) {
    const buf = [];
    for (let j = i - r; j <= i + r; j++) {
      if (j < 0 || j >= data.length) continue;
      const val = Number(data[j][key]);
      if (Number.isFinite(val)) buf.push(val);
    }
    if (!buf.length) {
      out[i] = { ...data[i], [key]: null };
    } else {
      buf.sort((a, b) => a - b);
      const mid = Math.floor(buf.length / 2);
      const med = (buf.length % 2 === 0) ? (buf[mid - 1] + buf[mid]) / 2 : buf[mid];
      out[i] = { ...data[i], [key]: med };
    }
  }
  return out;
}

function gaussianKernel(radiusPts, sigma = null) {
  const r = Math.max(1, Math.round(radiusPts));
  const s = sigma ?? (r / 2);
  const w = [];
  let sum = 0;
  for (let i = -r; i <= r; i++) {
    const val = Math.exp(-(i*i) / (2 * s * s));
    w.push(val);
    sum += val;
  }
  return w.map(v => v / sum);
}

// Gaussian, but clamp to local min/max to prevent overshoot; re-normalize at edges
function clippedGaussianSmoothKey(data, key, radiusPts) {
  const r = Math.max(1, Math.round(radiusPts));
  const weights = gaussianKernel(r);
  const out = new Array(data.length);

  for (let i = 0; i < data.length; i++) {
    let acc = 0, wsum = 0, localMin = Infinity, localMax = -Infinity;

    for (let j = -r; j <= r; j++) {
      const idx = i + j;
      if (idx < 0 || idx >= data.length) continue;
      const v = Number(data[idx][key]);
      if (Number.isFinite(v)) {
        if (v < localMin) localMin = v;
        if (v > localMax) localMax = v;
        const w = weights[j + r];
        acc += v * w;
        wsum += w;
      }
    }

    if (wsum <= 0 || !Number.isFinite(acc)) {
      out[i] = { ...data[i], [key]: null };
      continue;
    }

    let val = acc / wsum;
    if (Number.isFinite(localMin) && Number.isFinite(localMax)) {
      if (val < localMin) val = localMin;
      if (val > localMax) val = localMax;
    }

    out[i] = { ...data[i], [key]: val };
  }
  return out;
}

function robustSmoothKeys(data, keys, radiusPts) {
  if (!radiusPts || radiusPts <= 0) return data;
  let out = data;

  for (const key of keys) {
    const vec = out.map(d => d[key]);
    if (isNearlyConstant(vec)) {
      continue; // keep perfectly flat
    }
    const med = rollingMedian(out, key, Math.max(1, Math.round(radiusPts / 2)));
    const gau = clippedGaussianSmoothKey(med, key, radiusPts);
    out = gau.map((g, i) => ({ ...out[i], [key]: g[key] }));
  }

  return out;
}

function lineTypeFor(smoothLevel) {
  // exact segments when OFF; smooth but conservative when ON
  return smoothLevel === 'off' ? 'linear' : 'monotone';
}

function effectiveRadius(rangeKey, smoothLevel, nPoints) {
  if (smoothLevel === 'off') return 0;

  let base;
  switch (rangeKey) {
    case 'today': base = 12; break;
    case '7':     base = 2;  break;
    case '30':    base = 3;  break;
    case '90':    base = 4;  break;
    case '180':   base = 6;  break;
    case '365':   base = 8;  break;
    case '730':   base = 10; break;
    case '1825':  base = 12; break;
    case '3650':  base = 14; break;
    case 'all':   base = 16; break;
    default:      base = 3;
  }

  const mult =
    smoothLevel === 'low'  ? 0.6 :
    smoothLevel === 'med'  ? 1.2 :
    smoothLevel === 'high' ? 1.8 : 1.0; // 'auto'

  const r = Math.round(base * mult);
  const maxAllowed = Math.max(0, Math.floor((nPoints - 1) / 2) - 1);
  return Math.max(0, Math.min(r, maxAllowed));
}

// ───────────────────────────── config ─────────────────────────────
const CONFIG = {
  temp: {
    title: 'Temperature',
    unit: ' °C',
    todayKey: 'temp',
    daily: {
      url: '/api/weather/daily-temp',
      series: [
        { key: 'max_temp', name: 'Max' },
        { key: 'avg_temp', name: 'Avg' },
        { key: 'min_temp', name: 'Min' },
      ],
      colors: ['#f97316', '#22c55e', '#60a5fa'],
    },
    todayColor: '#f97316',
  },
  wind: {
    title: 'Wind Speed',
    unit: ' m/s',
    todayKey: 'wind',
    daily: {
      url: '/api/weather/daily-wind',
      series: [
        { key: 'max_wind', name: 'Max' },
        { key: 'avg_wind', name: 'Avg' },
        { key: 'min_wind', name: 'Min' },
      ],
      colors: ['#eab308', '#06b6d4', '#a78bfa'],
    },
    todayColor: '#06b6d4',
  },
  rain: {
    title: 'Rain',
    unit: ' mm',
    todayKey: 'rain',
    daily: {
      url: '/api/weather/daily-rain',
      series: [
        { key: 'max_rain', name: 'Max' },
        { key: 'avg_rain', name: 'Avg' },
        { key: 'min_rain', name: 'Min' },
      ],
      colors: ['#60a5fa', '#93c5fd', '#1d4ed8'],
    },
    todayColor: '#60a5fa',
  },
  pressure: {
    title: 'Pressure',
    unit: ' hPa',
    todayKey: 'pressure',
    daily: {
      url: '/api/weather/daily-pressure',
      series: [
        { key: 'max_pressure', name: 'Max' },
        { key: 'avg_pressure', name: 'Avg' },
        { key: 'min_pressure', name: 'Min' },
      ],
      colors: ['#f43f5e', '#fb7185', '#be123c'],
    },
    todayColor: '#f43f5e',
  },
};

const RANGES = [
  { key: 'today', label: 'Today' },
  { key: '7', label: '7 days' },
  { key: '30', label: '30 days' },
  { key: '90', label: '90 days' },
  { key: '180', label: '6 months' },
  { key: '365', label: '1 year' },
  { key: '730', label: '2 years' },
  { key: '1825', label: '5 years' },
  { key: '3650', label: '10 years' },
  { key: 'all', label: 'All time' },
];

// ───────────────────────────── y-axis logic per type ─────────────────────────────
function extentForKeys(data, keys) {
  let min = Infinity, max = -Infinity, has = false;
  for (const d of data) {
    for (const k of keys) {
      const v = Number(d[k]);
      if (Number.isFinite(v)) {
        has = true;
        if (v < min) min = v;
        if (v > max) max = v;
      }
    }
  }
  return has ? { min, max } : null;
}

/**
 * Custom Y domain per type:
 * temp:    default [-10, +10]; expand only the side that exceeds the band
 * wind:    default [0, 10];    expand upward if data exceed 10
 * rain:    default [0, 10];    expand upward if data exceed 10
 * pressure: default [1008.0, 1009.0]; expand to include data
 */
function yDomainFor(type, data, keys) {
  const ext = extentForKeys(data, keys);

  if (type === 'temp') {
    const baseMin = -10;
    const baseMax = 10;
    if (!ext) return [baseMin, baseMax];

    const min = Math.min(baseMin, Math.floor(ext.min * 10) / 10);
    const max = Math.max(baseMax, Math.ceil(ext.max * 10) / 10);
    return [min, max];
  }

  if (type === 'wind') {
    const top = ext ? Math.max(10, Math.ceil(ext.max * 10) / 10) : 10;
    return [0, top];
  }

  if (type === 'rain') {
    const top = ext ? Math.max(10, Math.ceil(ext.max * 10) / 10) : 10;
    return [0, top];
  }

  if (type === 'pressure') {
    const low  = 1008.0;
    const high = 1009.0;
    if (!ext) return [low, high];
    const min = Math.min(low,  Math.floor(ext.min * 10) / 10);
    const max = Math.max(high, Math.ceil(ext.max  * 10) / 10);
    return [min, max];
  }

  // fallback
  return ['auto', 'auto'];
}

// ───────────────────────────── component ─────────────────────────────
export default function WeatherSeriesChart({ type }) {
  const [range, setRange] = useState('today');
  const [smoothLevel, setSmoothLevel] = useState('auto'); // 'off' | 'low' | 'auto' | 'med' | 'high'
  const [data, setData] = useState([]);
  const cfg = CONFIG[type];

  // sanitize daily rows → { ...r, __x, numeric series }
  const sanitizeDaily = (rows) => {
    const keys = cfg.daily.series.map((s) => s.key);
    const out = [];
    for (const r of rows) {
      let x;
      if (r.date instanceof Date) x = r.date.getTime();
      else if (typeof r.date === 'string')
        x = r.date.includes('T') ? Date.parse(r.date) : Date.parse(`${r.date}T00:00:00`);
      else x = Date.parse(r.date);
      if (!Number.isFinite(x)) continue;

      const row = { ...r, __x: x };
      let anyVal = false;
      for (const k of keys) {
        const v = r[k] == null ? null : Number(r[k]);
        row[k] = Number.isFinite(v) ? v : null;
        if (row[k] != null) anyVal = true;
      }
      if (anyVal) out.push(row);
    }
    return out;
  };

  useEffect(() => {
    let abort = false;
    async function go() {
      try {
        if (range === 'today') {
          const resp = await fetch('/api/weather/history');
          const json = await resp.json();
          const key = cfg.todayKey; // 'temp' | 'wind' | 'rain' | 'pressure'
          const series = json[`${key}History`] ?? [];

          // Prefer server-provided epoch ms; fallback to HH:mm graft if needed
          let withDate = series.map((d) => {
            let x = Number.isFinite(d.ts) ? Number(d.ts) : NaN;
            if (!Number.isFinite(x) && typeof d.time === 'string') {
              const today = new Date();
              const yyyy = today.getFullYear();
              const mm = String(today.getMonth() + 1).padStart(2, '0');
              const dd = String(today.getDate()).padStart(2, '0');
              x = Date.parse(`${yyyy}-${mm}-${dd}T${d.time}:00`);
            }
            return { ...d, __x: x };
          });

          // sort + dedupe x (if multiple samples share a minute)
          withDate = withDate
            .filter(p => Number.isFinite(p.__x))
            .sort((a, b) => a.__x - b.__x)
            .filter((p, i, arr) => i === 0 || p.__x !== arr[i - 1].__x);

          const radius = effectiveRadius(range, smoothLevel, withDate.length);
          const smoothed = robustSmoothKeys(withDate, [key], radius);
          if (!abort) setData(smoothed);
        } else {
          const url = range === 'all' ? `${cfg.daily.url}` : `${cfg.daily.url}?days=${Number(range)}`;
          const resp = await fetch(url);
          const rows = await resp.json();

          let withDate = sanitizeDaily(Array.isArray(rows) ? rows : []);

          // thin giant datasets for perf
          const MAX_POINTS = 2000;
          if (withDate.length > MAX_POINTS) {
            const step = Math.ceil(withDate.length / MAX_POINTS);
            withDate = withDate.filter((_, i) => i % step === 0);
          }

          const seriesKeys = cfg.daily.series.map((s) => s.key);
          const radius = effectiveRadius(range, smoothLevel, withDate.length);
          const smoothed = robustSmoothKeys(withDate, seriesKeys, radius);

          if (!abort) setData(smoothed);
        }
      } catch (e) {
        if (!abort) setData([]);
        console.error('WeatherSeriesChart fetch error:', e);
      }
    }
    go();
    return () => { abort = true; };
  }, [range, smoothLevel, type]);

  const ticks = useMemo(() => buildTicksForRange(data, range), [data, range]);

  const nowTs = Date.now();
  const xTickFormatter = (ts) => {
    if (range === 'today') {
      return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (DAY_RANGES.has(range)) {
      return formatOrdinalDate(ts);            // "Aug 20th"
    }
    // 2y/5y/10y/all → compact month-year
    if (range === '730' || range === '1825' || range === '3650' || range === 'all') {
      return new Date(ts).toLocaleDateString([], { year: 'numeric', month: 'short' });
    }
    // Fallback
    return relativeLabel(ts, nowTs);
  };

  const valueFormatter = (value, name) => {
    const unit = CONFIG[type].unit;
    if (value == null || Number.isNaN(value)) return ['-', name];
    return [Number(value).toFixed(1) + unit, name];
  };
  const labelFormatter = (ts) => (range === 'today' ? fmtDateTime(ts) : fmtDate(ts));
  const header = `${CONFIG[type].title} (${range === 'today' ? 'Today' : RANGES.find(r => r.key === range)?.label})`;

  // Y-domain per type
  const yKeys = range === 'today' ? [CONFIG[type].todayKey] : CONFIG[type].daily.series.map(s => s.key);
  const yDomain = yDomainFor(type, data, yKeys);

  // Draw dots only when we have fewer than 50 points
  const SHOW_DOT_THRESHOLD = 50;
  const showDots = Array.isArray(data) && data.length > 0 && data.length < SHOW_DOT_THRESHOLD;
  const dotProps = showDots ? { r: 3, strokeWidth: 0 } : false;
  const activeDotProps = showDots ? { r: 5 } : false;

  // Colors
  const dailyColors = CONFIG[type].daily.colors;
  const todayColor  = CONFIG[type].todayColor;

  return (
    <div className="w-full bg-brand-deep p-4 rounded-lg shadow-md overflow-hidden">
      {/* header row that wraps gracefully */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2 min-w-0">
        <h2 className="text-base sm:text-lg font-semibold truncate">
          {header}
        </h2>

        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <label className="text-xs sm:text-sm opacity-80 whitespace-nowrap">Smoothing</label>
          <select
            value={smoothLevel}
            onChange={(e) => setSmoothLevel(e.target.value)}
            className="bg-brand-mid text-white px-2 py-1 rounded text-xs sm:text-sm max-w-full"
          >
            <option value="off">Off</option>
            <option value="low">Low</option>
            <option value="auto">Auto</option>
            <option value="med">Med</option>
            <option value="high">High</option>
          </select>

          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="bg-brand-mid text-white px-2 py-1 rounded text-xs sm:text-sm max-w-full"
          >
            {RANGES.map((r) => (
              <option key={r.key} value={r.key}>{r.label}</option>
            ))}
          </select>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ left: 16, right: 12, top: 8, bottom: 28 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="__x"
            type="number"
            domain={['dataMin', 'dataMax']}
            ticks={ticks}
            interval="preserveStartEnd"
            tickFormatter={xTickFormatter}
            minTickGap={40}
            tick={{ fill: '#fff' }}
            tickLine={false}
            padding={{ left: 8, right: 8 }}
          />
          <YAxis
            domain={yDomain}
            tickFormatter={yTickNumber}                 // numbers only; unit moved to axis label
            tick={{ fill: '#fff', fontSize: 12 }}
            tickLine={false}
            tickMargin={10}
            width={yAxisWidthFor(type)}                // type-specific width (pressure needs more)
            allowDecimals
            label={{
              value: axisLabelFor(type),               // unit here
              angle: -90,
              position: 'left',
              style: { fill: '#fff', opacity: 0.8, fontSize: 12 },
              offset: 0,
            }}
          />
          <Tooltip
            labelFormatter={labelFormatter}
            formatter={valueFormatter}
            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', color: '#fff' }}
          />
          <Legend />

          {range === 'today' ? (
            <Line
              type={lineTypeFor(smoothLevel)}
              dataKey={CONFIG[type].todayKey}
              stroke={todayColor}
              strokeWidth={2}
              dot={dotProps}
              activeDot={activeDotProps}
              isAnimationActive={false}
              connectNulls={false}
            />
          ) : (
            CONFIG[type].daily.series.map((s, i) => (
              <Line
                key={s.key}
                type={lineTypeFor(smoothLevel)}
                dataKey={s.key}
                name={s.name}
                stroke={dailyColors[i] || '#8884d8'}
                strokeWidth={2}
                dot={dotProps}
                activeDot={activeDotProps}
                isAnimationActive={false}
                connectNulls={false}
              />
            ))
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
