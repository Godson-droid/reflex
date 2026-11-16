import { fmtUsd } from '../lib/format';
import { MicroLabel } from './ui';

/**
 * Price band gauge — a horizontal track showing the guard band
 * (stop-loss floor to take-profit ceiling) and where the live price
 * sits against it. The track domain always extends past the band on
 * both sides, so a price that has fallen through the floor (the normal
 * state right after a stop-loss execution moves the pool) is shown
 * clamped at the edge with an explicit out-of-band marker instead of
 * disappearing or pretending to be inside.
 */
export function BandGauge({
  price,
  stopLoss,
  takeProfit,
}: {
  price: number;
  stopLoss: number;
  takeProfit: number;
}) {
  // Domain: the band plus headroom on both sides, widened to include the
  // live price when it sits outside, with a small pad so markers at the
  // extremes never clip.
  const span = takeProfit - stopLoss;
  let lo = stopLoss - span * 0.55;
  let hi = takeProfit + span * 0.55;
  if (price < lo) lo = price - span * 0.12;
  if (price > hi) hi = price + span * 0.12;
  const pct = (v: number) => ((v - lo) / (hi - lo)) * 100;

  const slPct = pct(stopLoss);
  const tpPct = pct(takeProfit);
  const pricePct = Math.max(0, Math.min(100, pct(price)));
  const below = price <= stopLoss;
  const above = price >= takeProfit;
  const outside = below || above;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <MicroLabel>Price band · WETH / USDC</MicroLabel>
        {outside ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-2.5 py-1 text-[11px] font-semibold text-rose-300 ring-1 ring-rose-400/25">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400" aria-hidden />
            {below ? 'Below the stop-loss floor' : 'Above the take-profit ceiling'}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-volt-400/10 px-2.5 py-1 text-[11px] font-semibold text-volt-300 ring-volt-400/25">
            <span className="h-1.5 w-1.5 rounded-full bg-volt-400" aria-hidden />
            Inside the band
          </span>
        )}
      </div>

      {/* Track */}
      <div className="relative mt-4 h-9" role="img" aria-label={`Current price ${fmtUsd(price)}, stop loss ${fmtUsd(stopLoss)}, take profit ${fmtUsd(takeProfit)}`}>
        {/* full domain */}
        <div className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-ink-700" />
        {/* below-band zone */}
        <div
          className="absolute top-1/2 h-2 -translate-y-1/2 rounded-l-full bg-rose-500/35"
          style={{ left: 0, width: `${slPct}%` }}
        />
        {/* in-band zone */}
        <div
          className="absolute top-1/2 h-2 -translate-y-1/2 bg-volt-400/30"
          style={{ left: `${slPct}%`, width: `${tpPct - slPct}%` }}
        />
        {/* above-band zone */}
        <div
          className="absolute top-1/2 h-2 -translate-y-1/2 rounded-r-full bg-volt-400/35"
          style={{ left: `${tpPct}%`, right: 0 }}
        />
        {/* threshold ticks */}
        <span
          className="absolute top-1/2 h-5 w-[2px] -translate-x-1/2 -translate-y-1/2 rounded bg-rose-400"
          style={{ left: `${slPct}%` }}
          aria-hidden
        />
        <span
          className="absolute top-1/2 h-5 w-[2px] -translate-x-1/2 -translate-y-1/2 rounded bg-volt-300"
          style={{ left: `${tpPct}%` }}
          aria-hidden
        />
        {/* live price marker */}
        <span
          className="absolute top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 transition-all duration-700"
          style={{ left: `${pricePct}%` }}
          aria-hidden
        >
          <span
            className={`block h-[18px] w-[18px] rounded-full border-[3px] border-ink-950 shadow-pop ${
              outside ? 'bg-rose-400' : 'bg-mist-100'
            }`}
          />
        </span>
      </div>

      {/* Labels */}
      <div className="relative h-12 text-[11px] font-medium text-mist-500">
        <span className="absolute top-0 -translate-x-1/2 text-center" style={{ left: `${slPct}%` }}>
          <span className="tnum block font-semibold text-rose-300">{fmtUsd(stopLoss, 0)}</span>
          stop-loss
        </span>
        <span
          className="absolute top-0 z-10 -translate-x-1/2 whitespace-nowrap text-center"
          style={{
            left: `${Math.max(9, Math.min(91, pricePct))}%`,
            // On narrow screens the price label collides with a band label when
            // the marker sits near a tick; drop the word "now" there and let
            // the value ride slightly higher instead.
            transform:
              Math.abs(pricePct - slPct) < 15 || Math.abs(pricePct - tpPct) < 15
                ? 'translate(-50%, -13px)'
                : undefined,
          }}
        >
          <span className="tnum block text-[12.5px] font-bold text-mist-100">{fmtUsd(price)}</span>
          {Math.abs(pricePct - slPct) >= 15 && Math.abs(pricePct - tpPct) >= 15 ? 'now' : null}
        </span>
        <span className="absolute top-0 -translate-x-1/2 text-center" style={{ left: `${tpPct}%` }}>
          <span className="tnum block font-semibold text-volt-300">{fmtUsd(takeProfit, 0)}</span>
          take-profit
        </span>
      </div>

      {outside && (
        <p className="mt-1 text-[12.5px] leading-relaxed text-mist-500">
          {below
            ? 'The last stop-loss execution sold into this pool and left the print below the floor. The guardian is re-armed on the same band — the next Sync that lands is evaluated against it exactly the same way.'
            : 'The print sits above the ceiling after the last take-profit execution moved the pool. The guardian is re-armed on the same band and evaluates the next Sync against it.'}
        </p>
      )}
    </div>
  );
}
