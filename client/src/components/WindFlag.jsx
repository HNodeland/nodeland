import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

const units = ['kts', 'm/s', 'km/h', 'mph'];
const unitLabels = { kts: 'kn', 'm/s': 'm/s', 'km/h': 'km/h', mph: 'mph' };

const conversions = {
  kts: (v) => (v ?? 0).toFixed(1),
  'm/s': (v) => ((v ?? 0) * 0.514444).toFixed(1),
  'km/h': (v) => ((v ?? 0) * 1.852).toFixed(1),
  mph: (v) => ((v ?? 0) * 1.15078).toFixed(1),
};

const lerp = (a, b, t) => a + (b - a) * t;

function VerticalBar({
  valueKnots,
  selectedUnit,
  max = 15,
  label,
  width = 75,
  barBackground = 'rgba(105, 112, 117, 1)',
  fillColor = '#2a7bc1ff',
}) {
  const clamped = Math.min(Math.max(valueKnots ?? 0, 0), max);
  const normalized = clamped / max;
  const displayValue = `${conversions[selectedUnit](valueKnots)} ${unitLabels[selectedUnit]}`;

  return (
    <div
      className="relative flex flex-col items-center text-white flex-shrink-0"
      style={{ width: width, height: 220 }}
      aria-label={`${label}: ${displayValue}`}
    >
      <div className="relative flex-1 w-full rounded-md overflow-hidden flex flex-col justify-end">
        <div
          style={{
            backgroundColor: barBackground,
            position: 'absolute',
            inset: 0,
            borderRadius: 6,
          }}
        />
        <div
          style={{
            height: `${normalized * 100}%`,
            transition: 'height 0.2s ease',
            backgroundColor: fillColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 600,
            position: 'relative',
            borderRadius: 6,
          }}
        >
          <div
            className="truncate"
            style={{
              padding: '0 2px',
              lineHeight: 1,
              pointerEvents: 'none',
              textAlign: 'center',
            }}
          >
            {displayValue}
          </div>
        </div>
      </div>
      <div className="mt-1 text-xs text-center" style={{ fontWeight: 600 }}>
        {label}
      </div>
    </div>
  );
}

export default function WindFlag({ current, avg }) {
  const { t } = useTranslation();
  const [selectedUnit, setSelectedUnit] = useState('kts');
  const rootRef = useRef(null);
  const [scale, setScale] = useState(1);
  const BASE_LAYOUT_WIDTH = 375; // flag (200) + two bars (75*2) + gap (25)

  // Responsive scaling based on available width
  useEffect(() => {
    if (!rootRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const e of entries) {
        const w = e.contentRect.width;
        const newScale = Math.min(1, w / BASE_LAYOUT_WIDTH);
        setScale(newScale);
      }
    });
    observer.observe(rootRef.current);
    return () => observer.disconnect();
  }, []);

  // Demo fallback if no current provided
  const [demoKnots, setDemoKnots] = useState(1);
  useEffect(() => {
    let k = 1;
    const id = setInterval(() => {
      setDemoKnots(k);
      k = k === 15 ? 1 : k + 1;
    }, 2000);
    return () => clearInterval(id);
  }, []);

  // Demo fallback for avg if not provided
  const [demoAvgKnots, setDemoAvgKnots] = useState(5);
  useEffect(() => {
    let a = 5;
    const id = setInterval(() => {
      setDemoAvgKnots(a);
      a = a >= 10 ? 5 : a + 1;
    }, 5000);
    return () => clearInterval(id);
  }, []);

  // Raw and smoothed wind refs
  const rawKnotsRef = useRef(current ?? demoKnots);
  const smoothedKnotsRef = useRef(rawKnotsRef.current);
  const [displayKnots, setDisplayKnots] = useState(rawKnotsRef.current);

  useEffect(() => {
    rawKnotsRef.current = current ?? demoKnots;
  }, [current, demoKnots]);

  // Flag parameters
  const segments = 5;
  const initialHeight = 30;
  const taper = initialHeight / segments;
  const segLength = 40;
  const colors = ['red', 'white', 'red', 'white', 'red'];

  // Adjusted for lower frequency / higher amplitude overall
  const maxDelay = 0.35;
  const minDelay = 0.08;
  const baseFreq = 0.6; // lowered base frequency
  const maxFreq = 1.5; // lowered max frequency

  const smoothRef = useRef(Math.min(1 / 3, segments));
  const [smoothErectProgress, setSmoothErectProgress] = useState(smoothRef.current);
  const [perSegmentErect, setPerSegmentErect] = useState(
    Array.from({ length: segments }, (_, i) =>
      Math.min(Math.max(smoothRef.current - i, 0), 1)
    )
  );
  const perSegmentErectRef = useRef(perSegmentErect);

  const smoothedFreqRef = useRef(baseFreq);
  const smoothedTravelDelayRef = useRef(maxDelay);
  const smoothedWindInfluenceRef = useRef(0);
  const phaseRefs = useRef(Array.from({ length: segments }, () => Math.random() * Math.PI * 2));

  const [time, setTime] = useState(0);
  useEffect(() => {
    let raf;
    const step = (now) => {
      setTime(now / 1000);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Animation loop for flag smoothing/etc.
  useEffect(() => {
    let raf;
    let last = performance.now();

    const tick = (now) => {
      const dt = (now - last) / 1000;
      last = now;

      // ---- Wind smoothing ----
      const targetWind = rawKnotsRef.current;
      const tauWind = 0.3;
      const alphaWind = 1 - Math.exp(-dt / tauWind);
      smoothedKnotsRef.current += (targetWind - smoothedKnotsRef.current) * alphaWind;

      setDisplayKnots((prev) => {
        if (Math.abs(prev - smoothedKnotsRef.current) > 0.01) {
          return smoothedKnotsRef.current;
        }
        return prev;
      });

      // ---- Erect interpolation ----
      const targetGlobal = Math.min(smoothedKnotsRef.current / 3, segments);
      const tau = 0.15;
      const alpha = 1 - Math.exp(-dt / tau);
      smoothRef.current += (targetGlobal - smoothRef.current) * alpha;

      const newSmoothProgress = smoothRef.current;
      setSmoothErectProgress((prev) => {
        if (Math.abs(prev - newSmoothProgress) > 0.001) {
          return newSmoothProgress;
        }
        return prev;
      });

      const newPer = [...perSegmentErectRef.current];
      for (let i = 0; i < segments; i++) {
        const target_i = Math.min(Math.max(smoothRef.current - i, 0), 1);
        const current_i = newPer[i];
        const rate = target_i > current_i ? 8 / (1 + i * 0.5) : 8;
        const blend = 1 - Math.exp(-rate * dt);
        newPer[i] = current_i + (target_i - current_i) * blend;
      }

      let changed = false;
      for (let i = 0; i < segments; i++) {
        if (Math.abs(perSegmentErectRef.current[i] - newPer[i]) > 0.0005) {
          changed = true;
          break;
        }
      }
      if (changed) {
        perSegmentErectRef.current = newPer;
        setPerSegmentErect(newPer);
      }

      // ---- Derived wiggle drivers smoothing ----
      const targetNormalizedWind = Math.min(smoothedKnotsRef.current, 15) / 15;
      const targetFreq = lerp(baseFreq, maxFreq, targetNormalizedWind);
      const targetTravelDelay = lerp(maxDelay, minDelay, targetNormalizedWind);
      const targetWindInfluence = Math.pow(targetNormalizedWind, 1.2);
      const tauDerived = 0.2;
      const alphaDerived = 1 - Math.exp(-dt / tauDerived);
      smoothedFreqRef.current += (targetFreq - smoothedFreqRef.current) * alphaDerived;
      smoothedTravelDelayRef.current += (targetTravelDelay - smoothedTravelDelayRef.current) * alphaDerived;
      smoothedWindInfluenceRef.current += (targetWindInfluence - smoothedWindInfluenceRef.current) * alphaDerived;

      // ---- Phase advance ----
      for (let i = 0; i < segments; i++) {
        phaseRefs.current[i] += 2 * Math.PI * smoothedFreqRef.current * dt;
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [segments]);

  // Derived rendering values
  const knots = displayKnots;
  const normalizedWind = Math.min(knots, 15) / 15;

  const firstHangingIndex = useMemo(() => {
    const idx = perSegmentErect.findIndex((r) => r < 0.99);
    return idx === -1 ? segments : idx;
  }, [perSegmentErect, segments]);

  const angles = useMemo(() => {
    return Array.from({ length: segments }, (_, i) => {
      const erectRatio = Math.min(Math.max(perSegmentErect[i], 0), 1);
      let baseAngle = (1 - erectRatio) * 90;

      if (erectRatio < 1) {
        // hanging/vertical section gets extra sway at low wind
        let hangFactor = 1 - erectRatio;
        if (erectRatio < 0.05) hangFactor = 0; // dead zone

        const maxWiggle = 18; // increased amplitude

        // base smoothed wind influence (small at low wind)
        const baseInfluence = smoothedWindInfluenceRef.current;

        // stronger low-wind boost to make triple propagation visible early
        const lowWindBoost = (1 - normalizedWind) * 0.8; // up to 0.8 when wind is near zero
        const extraInfluence = lowWindBoost * hangFactor;

        const combinedInfluence = baseInfluence + extraInfluence;

        // effective frequency slightly reduced at low wind for slower sway
        const effectiveFreq =
          smoothedFreqRef.current * (0.7 + 0.3 * normalizedWind); // 0.7x at zero wind, up to 1x

        const wiggleAmp = maxWiggle * combinedInfluence * hangFactor;

        const propagationIndex = Math.max(0, i - firstHangingIndex);
        const phaseDelay =
          effectiveFreq *
          smoothedTravelDelayRef.current *
          propagationIndex *
          2 *
          Math.PI;

        const phase = phaseRefs.current[i] - phaseDelay;
        const wiggle = Math.sin(phase) * wiggleAmp;

        baseAngle += wiggle;
      }

      return baseAngle;
    });
  }, [perSegmentErect, firstHangingIndex, segments, time, normalizedWind]);

  const segmentRenderData = useMemo(() => {
    const data = [];
    let cursorX = 0;
    let cursorY = 0;

    for (let i = 0; i < segments; i++) {
      const angle = angles[i];
      const startWidth = initialHeight - i * taper;
      const endWidth = initialHeight - (i + 1) * taper;
      const erectRatio = Math.min(Math.max(perSegmentErect[i], 0), 1);

      data.push({
        x: cursorX,
        y: cursorY,
        angle,
        startWidth,
        endWidth,
        length: segLength,
        color: colors[i],
        erectRatio,
        key: i,
      });

      const rad = (angle * Math.PI) / 180;
      cursorX += Math.cos(rad) * segLength;
      cursorY += Math.sin(rad) * segLength;
    }

    return data;
  }, [angles, perSegmentErect, initialHeight, taper, segLength, colors, segments]);

  const rippleParamsRef = useRef(
    Array.from({ length: segments }, () => ({
      waveCount: 0.6 * (0.9 + Math.random() * 0.2),
      phaseOffsetRand: Math.random() * Math.PI * 0.6,
      ampJitter: 0.85 + Math.random() * 0.3,
      speedJitter: 0.9 + Math.random() * 0.2,
    }))
  );

  const makeRippledPolygon = useCallback(
    (startW, endW, length, erectRatio, segmentIndex) => {
      const subdivisions = 4;
      const ripple = rippleParamsRef.current[segmentIndex];
      const waveCount = ripple.waveCount;
      const rippleSpeed = (1 + normalizedWind) * ripple.speedJitter;
      const maxRippleAmp = 0.22;
      const rippleAmp = maxRippleAmp * normalizedWind * erectRatio * ripple.ampJitter;

      const topPoints = [];
      const bottomPoints = [];

      for (let j = 0; j <= subdivisions; j++) {
        const t = j / subdivisions;
        const x = t * length;
        const widthAtT = startW * (1 - t) + endW * t;
        const halfW = widthAtT / 2;

        const phase =
          2 * Math.PI * (t * waveCount - time * rippleSpeed) +
          segmentIndex * 0.4 +
          ripple.phaseOffsetRand;
        const yRipple = Math.sin(phase) * rippleAmp;

        topPoints.push(`${x},${-halfW + yRipple}`);
        bottomPoints.push(`${x},${halfW - yRipple}`);
      }

      return [...topPoints, ...bottomPoints.reverse()].join(' ');
    },
    [normalizedWind, time]
  );

  // Canvas particle system
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    let rafId;
    let particles = [];
    let lastFrame = performance.now();

    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      width = canvas.width = rect.width;
      height = canvas.height = rect.height;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement);

    const createParticle = () => {
      const currentSmoothedWind = Math.min(smoothedKnotsRef.current, 15) / 15;
      const speed = lerp(30, 120, currentSmoothedWind) * (0.8 + Math.random() * 0.4);
      return {
        x: Math.random() * width - 50,
        y: Math.random() * height * 0.4,
        length: 20 + Math.random() * 40,
        speed,
        alpha: 0.04 + Math.random() * 0.06,
        drift: (Math.random() - 0.5) * 6,
        offsetPhase: Math.random() * Math.PI * 2,
      };
    };

    const step = (t) => {
      const dt = (t - lastFrame) / 1000;
      lastFrame = t;

      const normalizedWindInside = Math.min(smoothedKnotsRef.current, 15) / 15;
      const targetCount = Math.round(lerp(8, 40, normalizedWindInside));
      while (particles.length < targetCount) {
        particles.push(createParticle());
      }
      if (particles.length > targetCount) {
        particles = particles.slice(0, targetCount);
      }

      ctx.clearRect(0, 0, width, height);
      ctx.lineWidth = 1;

      particles.forEach((p, idx) => {
        p.x += p.speed * dt;
        p.y += Math.sin(t * 2 + p.offsetPhase) * 2 * dt + p.drift * dt;

        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + p.length, p.y);
        ctx.strokeStyle = `rgba(255,255,255,${p.alpha * normalizedWindInside})`;
        ctx.stroke();

        if (p.x - p.length > width) {
          const newP = createParticle();
          newP.x = -newP.length;
          particles[idx] = newP;
        }
      });

      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, []);

  const toggleUnit = () => {
    const currentIndex = units.indexOf(selectedUnit);
    setSelectedUnit(units[(currentIndex + 1) % units.length]);
  };

  const avgKnots = avg ?? demoAvgKnots;

  return (
    <div
      ref={rootRef}
      className="relative bg-brand-deep rounded-lg shadow-md p-4 flex flex-col items-center justify-center cursor-pointer h-[300px]"
      onClick={toggleUnit}
    >
      {/* particle overlay */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 rounded-lg"
        aria-hidden="true"
        style={{ zIndex: 2 }}
      />

      <div className="w-full flex items-center mb-4">
        <div className="flex-none">
          <div
            className="w-10 h-10 rounded-full bg-brand-mid text-white flex items-center justify-center text-sm font-bold"
            aria-label={`Unit: ${unitLabels[selectedUnit]}`}
          >
            {unitLabels[selectedUnit]}
          </div>
        </div>
        <div className="flex-grow text-center">
          <h4 className="text-lg font-semibold text-white">
            {t('windStrengthTitle')}
          </h4>
        </div>
      </div>

      <div className="flex items-start gap-4 flex-nowrap min-w-0 md:pl-[100px] pl-4">
        <div
          style={{
            width: BASE_LAYOUT_WIDTH,
            transform: `scale(${scale})`,
            transformOrigin: 'left top',
            display: 'flex',
            gap: 25,
          }}
        >
          <svg
            width="200"
            height="190"
            viewBox="0 0 250 300"
            preserveAspectRatio="xMidYMid meet"
            className="flex-shrink-0"
            style={{ marginLeft: 10 }}
          >
            <rect x="10" y="0" width="5" height="290" fill="gray" />
            <g transform="translate(15, 30)">
              {segmentRenderData.map((sec) => {
                const points = makeRippledPolygon(
                  sec.startWidth + 15,
                  sec.endWidth + 15,
                  sec.length,
                  sec.erectRatio,
                  sec.key
                );
                return (
                  <g
                    key={sec.key}
                    transform={`translate(${sec.x}, ${sec.y}) rotate(${sec.angle})`}
                    style={{ transformOrigin: '100 0' }}
                  >
                    <polygon points={points} fill={sec.color} />
                  </g>
                );
              })}
            </g>
          </svg>

          <div className="flex flex-row flex-shrink-0" style={{ gap: 25 }}>
            <VerticalBar
              valueKnots={knots}
              selectedUnit={selectedUnit}
              max={15}
              label="Windspeed (current)"
            />
            <VerticalBar
              valueKnots={avgKnots}
              selectedUnit={selectedUnit}
              max={15}
              label="Windspeed (60s avg)"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
