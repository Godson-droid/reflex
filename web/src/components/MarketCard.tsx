import type { MarketData } from '../lib/chain';
import { fmtNum, fmtPct, fmtUsd } from '../lib/format';
import { Card, LiveDot, MicroLabel } from './ui';
import { PriceChart } from './PriceChart';

function TokenBadge({ symbol, tone }: { symbol: string; tone: 'volt' | 'pulse' }) {
  return (
    <span
      className={`grid h-11 w-11 place-items-center rounded-full font-display text-[15px] font-bold ring-1 ${
        tone === 'volt'
          ? 'bg-volt-400/15 text-volt-300 ring-volt-400/30'
          : 'bg-pulse-400/10 text-pulse-300 ring-pulse-400/25'
      }`}
      aria-hidden
    >
      {symbol === 'WETH' ? 'Ξ' : '$'}
    </span>
  );
}

export function MarketCard({
  market,
  previewStopLoss,
  previewTakeProfit,
}: {
  market: MarketData;
  previewStopLoss?: number;
  previewTakeProfit?: number;
}) {
  const up = market.change24hPct >= 0;

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-4 p-6 pb-2 sm:p-7 sm:pb-2">
        {/* Pair identity */}
        <div className="flex items-center gap-3.5">
          <div className="flex -space-x-2.5">
            <TokenBadge symbol="WETH" tone="volt" />
            <TokenBadge symbol="USDC" tone="pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-[19px] font-semibold tracking-tight text-mist-100">
                {market.pairLabel}
              </h3>
              <span className="rounded-md bg-white/[0.05] px-1.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider text-mist-400 ring-1 ring-line">
                Watched pair
              </span>
            </div>
            <p className="mt-0.5 text-[13px] text-mist-400">{market.venue}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[12px] font-medium text-mist-400">
          <LiveDot />
          Live · Sync events streaming
        </div>
      </div>

      {/* Price block */}
      <div className="flex flex-wrap items-end gap-x-5 gap-y-2 px-6 pt-3 sm:px-7">
        <p className="tnum font-display text-price font-bold text-mist-100">
          {fmtUsd(market.price)}
        </p>
        <span
          className={`mb-1.5 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12.5px] font-semibold ring-1 ${
            up
              ? 'bg-volt-400/10 text-volt-300 ring-volt-400/25'
              : 'bg-rose-500/10 text-rose-300 ring-rose-400/25'
          }`}
        >
          <span aria-hidden>{up ? '▲' : '▼'}</span>
          <span className="tnum">{fmtPct(market.change24hPct)} · 24h</span>
        </span>
      </div>

      <div className="px-4 pt-2 sm:px-5">
        <PriceChart
          data={market.history}
          stopLoss={previewStopLoss}
          takeProfit={previewTakeProfit}
        />
      </div>

      {/* Stat strip */}
      <div className="grid grid-cols-2 gap-px border-t border-line bg-line/40 sm:grid-cols-4">
        {[
          { label: '24h high', value: fmtUsd(market.high24h) },
          { label: '24h low', value: fmtUsd(market.low24h) },
          { label: '24h volume', value: `$${fmtNum(market.volume24hUsd / 1_000_000, 1)}M` },
          { label: 'Loop latency', value: '5–17 blocks · measured' },
        ].map((stat) => (
          <div key={stat.label} className="bg-ink-850 px-6 py-4">
            <MicroLabel>{stat.label}</MicroLabel>
            <p className="tnum mt-1 text-[15px] font-semibold text-mist-100">{stat.value}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
