import type { Guardian, LoopStep } from '../lib/chain';
import { explorerTxUrl, NETWORKS } from '../lib/chain';
import { fmtDayTime, fmtNum, fmtUsd, timeAgo, truncateMiddle } from '../lib/format';
import { Card, MicroLabel, Pill, SectionHeading } from './ui';

export function Guardians({
  guardians,
  currentPrice,
}: {
  guardians: Guardian[];
  currentPrice: number;
}) {
  const watching = guardians.filter((g) => g.status === 'watching').length;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionHeading
          eyebrow="My guardians"
          title="Watching so you don't have to"
          copy="Every guardian is a rule living inside the Reflex contract. When the market crosses one, the full automation loop — event, evaluation, execution — is written on-chain for anyone to verify."
        />
        <div className="flex gap-2 pb-1">
          <Pill tone="volt" dot>
            {watching} watching
          </Pill>
          <Pill tone="neutral">{guardians.length} total</Pill>
        </div>
      </div>

      <div className="mt-7 space-y-5">
        {guardians.map((guardian, i) => (
          <GuardianCard
            key={guardian.id}
            guardian={guardian}
            currentPrice={currentPrice}
            fresh={i === 0 && guardian.status === 'watching'}
          />
        ))}
      </div>
    </div>
  );
}

function statusPill(guardian: Guardian) {
  switch (guardian.status) {
    case 'watching':
      return (
        <Pill tone="volt" dot>
          Watching
        </Pill>
      );
    case 'triggered-sl':
      return <Pill tone="rose">Triggered · Stop-loss</Pill>;
    case 'triggered-tp':
      return <Pill tone="pulse">Triggered · Take-profit</Pill>;
  }
}

function GuardianCard({
  guardian,
  currentPrice,
  fresh,
}: {
  guardian: Guardian;
  currentPrice: number;
  fresh?: boolean;
}) {
  const isWatching = guardian.status === 'watching';
  const refPrice = isWatching ? currentPrice : (guardian.triggerPrice ?? currentPrice);
  const position =
    ((refPrice - guardian.stopLoss) / (guardian.takeProfit - guardian.stopLoss)) * 100;
  const clamped = Math.max(0, Math.min(100, position));
  const distToSl = ((currentPrice - guardian.stopLoss) / currentPrice) * 100;
  const distToTp = ((guardian.takeProfit - currentPrice) / currentPrice) * 100;

  return (
    <Card className={`overflow-hidden ${fresh ? 'animate-fade-up' : ''}`}>
      <div className="grid lg:grid-cols-[1fr_380px]">
        {/* Left — position summary */}
        <div className="p-6 sm:p-7">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="font-display text-[17px] font-semibold tracking-tight text-mist-100">
              {guardian.pairLabel}
            </h3>
            <span className="font-mono text-[12px] text-mist-500">{guardian.id}</span>
            {statusPill(guardian)}
            <span className="ml-auto text-[12px] text-mist-500">
              Armed {timeAgo(guardian.createdAt)}
            </span>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4">
            <div>
              <MicroLabel>Protected</MicroLabel>
              <p className="tnum mt-1 text-[17px] font-semibold text-mist-100">
                {fmtNum(guardian.amount)} {guardian.baseSymbol}
              </p>
              <p className="tnum text-[12px] text-mist-500">
                ≈ {fmtUsd(guardian.amount * currentPrice, 0)}
              </p>
            </div>
            <div>
              <MicroLabel>Stop-loss</MicroLabel>
              <p className="tnum mt-1 text-[17px] font-semibold text-rose-300">
                {fmtUsd(guardian.stopLoss)}
              </p>
              {isWatching && (
                <p className="tnum text-[12px] text-mist-500">{distToSl.toFixed(1)}% away</p>
              )}
            </div>
            <div>
              <MicroLabel>Take-profit</MicroLabel>
              <p className="tnum mt-1 text-[17px] font-semibold text-volt-300">
                {fmtUsd(guardian.takeProfit)}
              </p>
              {isWatching && (
                <p className="tnum text-[12px] text-mist-500">{distToTp.toFixed(1)}% away</p>
              )}
            </div>
          </div>

          {/* Distance-to-trigger range bar */}
          <div className="mt-7">
            <div className="relative h-2 rounded-full bg-gradient-to-r from-rose-500/50 via-ink-600 to-volt-400/50">
              <div
                className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-ink-850 bg-mist-100 shadow-pop transition-all duration-700"
                style={{ left: `${clamped}%` }}
                title={`Current price ${fmtUsd(refPrice)}`}
              />
            </div>
            <div className="mt-2 flex justify-between text-[11px] font-medium text-mist-500">
              <span className="tnum">{fmtUsd(guardian.stopLoss, 0)}</span>
              <span className="tnum text-mist-300">
                {isWatching ? `Now ${fmtUsd(currentPrice)}` : `Fired at ${fmtUsd(guardian.triggerPrice ?? 0)}`}
              </span>
              <span className="tnum">{fmtUsd(guardian.takeProfit, 0)}</span>
            </div>
          </div>

          {!isWatching && guardian.receivedQuote && (
            <div className="mt-5 inline-flex items-center gap-2 rounded-lg bg-white/[0.03] px-3 py-2 text-[13px] text-mist-300 ring-1 ring-line">
              <span aria-hidden>→</span>
              Position closed for{' '}
              <strong className="tnum font-semibold text-mist-100">
                {fmtNum(guardian.receivedQuote)} {guardian.quoteSymbol}
              </strong>
              — no slippage beyond the trigger print.
            </div>
          )}
        </div>

        {/* Right — the automation loop */}
        <div className="border-t border-line bg-ink-900/60 p-6 sm:p-7 lg:border-l lg:border-t-0">
          <div className="flex items-center justify-between">
            <MicroLabel>Automation loop</MicroLabel>
            <span className="text-[11px] font-medium text-mist-500">
              {guardian.steps.every((s) => s.status === 'done')
                ? 'Complete · on-chain'
                : 'Subscribed · Lasna'}
            </span>
          </div>
          <ol className="mt-4">
            {guardian.steps.map((step, i) => (
              <LoopStepRow
                key={step.kind}
                step={step}
                isLast={i === guardian.steps.length - 1}
              />
            ))}
          </ol>
        </div>
      </div>
    </Card>
  );
}

function LoopStepRow({ step, isLast }: { step: LoopStep; isLast: boolean }) {
  const done = step.status === 'done';
  return (
    <li className="relative flex gap-3.5 pb-5 last:pb-0">
      {!isLast && (
        <span
          className={`absolute left-[9px] top-6 h-[calc(100%-18px)] w-px ${
            done ? 'bg-volt-400/40' : 'bg-line'
          }`}
          aria-hidden
        />
      )}
      <span
        className={`relative z-10 mt-0.5 grid h-[19px] w-[19px] shrink-0 place-items-center rounded-full ring-1 ${
          done
            ? 'bg-volt-400 text-[10px] font-bold text-ink-950 ring-volt-400'
            : 'bg-ink-800 text-mist-500 ring-line'
        }`}
        aria-hidden
      >
        {done ? '✓' : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3">
          <p
            className={`text-[13.5px] font-semibold ${done ? 'text-mist-100' : 'text-mist-400'}`}
          >
            {step.title}
          </p>
          <span className="text-[11px] font-medium text-mist-500">
            {NETWORKS[step.network].label}
          </span>
        </div>
        <p className="mt-0.5 text-[12.5px] leading-relaxed text-mist-500">{step.detail}</p>
        {done && step.txHash && (
          <a
            href={explorerTxUrl(step.network, step.txHash)}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-flex items-center gap-1.5 font-mono text-[11.5px] text-pulse-300 underline decoration-pulse-400/30 underline-offset-4 transition hover:text-pulse-200 hover:decoration-pulse-300"
          >
            {truncateMiddle(step.txHash, 10, 8)}
            <span aria-hidden>↗</span>
            {step.at && <span className="font-sans text-mist-500">· {fmtDayTime(step.at)}</span>}
          </a>
        )}
        {!done && (
          <p className="mt-1 text-[11.5px] font-medium text-mist-500">Pending — fires automatically</p>
        )}
      </div>
    </li>
  );
}
