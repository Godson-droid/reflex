import { useId, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react';
import type { PricePoint } from '../lib/chain';
import { fmtClockTime, fmtUsd } from '../lib/format';

/**
 * Hand-rolled SVG area chart — no chart library, so the bundle stays lean
 * and the styling matches the design system exactly. Supports hover
 * crosshair with a value readout.
 */
export function PriceChart({
  data,
  stopLoss,
  takeProfit,
  height = 240,
}: {
  data: PricePoint[];
  stopLoss?: number;
  takeProfit?: number;
  height?: number;
}) {
  const gradientId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  const W = 840;
  const H = 260;
  const PAD = { top: 14, right: 8, bottom: 8, left: 8 };

  const { line, area, min, max, points } = useMemo(() => {
    const prices = data.map((d) => d.price);
    const extras = [stopLoss, takeProfit].filter((v): v is number => typeof v === 'number');
    const lo = Math.min(...prices, ...extras);
    const hi = Math.max(...prices, ...extras);
    const span = hi - lo || 1;
    const minV = lo - span * 0.08;
    const maxV = hi + span * 0.08;
    const x = (i: number) =>
      PAD.left + (i / Math.max(1, data.length - 1)) * (W - PAD.left - PAD.right);
    const y = (v: number) =>
      PAD.top + (1 - (v - minV) / (maxV - minV)) * (H - PAD.top - PAD.bottom);
    const pts = data.map((d, i) => ({ x: x(i), y: y(d.price), ...d }));
    const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
    const areaPath = `${linePath} L${x(data.length - 1).toFixed(1)},${H - PAD.bottom} L${x(0).toFixed(1)},${H - PAD.bottom} Z`;
    return { line: linePath, area: areaPath, min: minV, max: maxV, points: pts, y };
  }, [data, stopLoss, takeProfit]);

  const yFor = (v: number) =>
    PAD.top + (1 - (v - min) / (max - min)) * (H - PAD.top - PAD.bottom);

  const onMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect || points.length === 0) return;
    const ratio = (e.clientX - rect.left) / rect.width;
    const idx = Math.round(ratio * (points.length - 1));
    setHover(Math.max(0, Math.min(points.length - 1, idx)));
  };

  const hovered = hover !== null ? points[hover] : null;
  const last = points[points.length - 1];

  return (
    <div ref={wrapRef} className="relative" onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height }}
        role="img"
        aria-label="WETH price chart, last 48 hours"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#cff94d" stopOpacity="0.28" />
            <stop offset="55%" stopColor="#cff94d" stopOpacity="0.07" />
            <stop offset="100%" stopColor="#cff94d" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* horizontal gridlines */}
        {[0.25, 0.5, 0.75].map((f) => (
          <line
            key={f}
            x1={PAD.left}
            x2={W - PAD.right}
            y1={PAD.top + f * (H - PAD.top - PAD.bottom)}
            y2={PAD.top + f * (H - PAD.top - PAD.bottom)}
            stroke="rgba(235,242,235,0.05)"
            strokeDasharray="3 6"
          />
        ))}

        {/* threshold guides */}
        {typeof takeProfit === 'number' && (
          <g>
            <line
              x1={PAD.left}
              x2={W - PAD.right}
              y1={yFor(takeProfit)}
              y2={yFor(takeProfit)}
              stroke="#cff94d"
              strokeOpacity="0.55"
              strokeDasharray="6 5"
            />
            <text x={W - PAD.right - 4} y={yFor(takeProfit) - 7} textAnchor="end" fontSize="11" fill="#e2ff7a" fontWeight="600">
              TP {fmtUsd(takeProfit, 0)}
            </text>
          </g>
        )}
        {typeof stopLoss === 'number' && (
          <g>
            <line
              x1={PAD.left}
              x2={W - PAD.right}
              y1={yFor(stopLoss)}
              y2={yFor(stopLoss)}
              stroke="#fb7185"
              strokeOpacity="0.6"
              strokeDasharray="6 5"
            />
            <text x={W - PAD.right - 4} y={yFor(stopLoss) + 16} textAnchor="end" fontSize="11" fill="#fda4af" fontWeight="600">
              SL {fmtUsd(stopLoss, 0)}
            </text>
          </g>
        )}

        <path d={area} fill={`url(#${gradientId})`} />
        <path
          d={line}
          fill="none"
          stroke="#cff94d"
          strokeWidth="2.25"
          strokeLinejoin="round"
          strokeLinecap="round"
          pathLength={1200}
          strokeDasharray={1200}
          className="animate-[draw-line_1.4s_ease-out_both]"
        />

        {/* hover crosshair */}
        {hovered && (
          <g>
            <line
              x1={hovered.x}
              x2={hovered.x}
              y1={PAD.top}
              y2={H - PAD.bottom}
              stroke="rgba(235,242,235,0.25)"
              strokeDasharray="3 4"
            />
            <circle cx={hovered.x} cy={hovered.y} r="4.5" fill="#0e1116" stroke="#cff94d" strokeWidth="2.5" />
          </g>
        )}

        {/* live end point */}
        {last && !hovered && (
          <g>
            <circle cx={last.x} cy={last.y} r="9" fill="#cff94d" opacity="0.18" />
            <circle cx={last.x} cy={last.y} r="4" fill="#cff94d" stroke="#0e1116" strokeWidth="2" />
          </g>
        )}
      </svg>

      {hovered && (
        <div
          className="pointer-events-none absolute top-2 z-10 -translate-x-1/2 rounded-lg border border-line bg-ink-800/95 px-3 py-1.5 text-center shadow-pop backdrop-blur"
          style={{ left: `${(hovered.x / W) * 100}%` }}
        >
          <p className="tnum text-[13px] font-semibold text-mist-100">{fmtUsd(hovered.price)}</p>
          <p className="text-[10.5px] text-mist-500">
            {new Date(hovered.t).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ·{' '}
            {fmtClockTime(new Date(hovered.t).toISOString())}
          </p>
        </div>
      )}
    </div>
  );
}
