import { explorerTxUrl } from '../lib/chain';
import { fmtNum, fmtUsd, truncateMiddle } from '../lib/format';
import type { LiveCheckStatus } from '../hooks/useLiveLoop';
import type { EvidenceLoop } from '../data/evidence';
import { EVIDENCE_META } from '../data/evidence';
import { Card, MicroLabel, Pill, SectionHeading } from './ui';

/**
 * The Loop Ledger — every executed protection, newest first, with the
 * full three-transaction chain (origin swap on Base Sepolia, reactive
 * transaction on Lasna, callback execution on Base Sepolia) linked to
 * its explorer. Rows come from the bundled verified evidence pack; the
 * banner above the table reports the live check of that pack against
 * the callback contract's on-chain lastExecution record.
 */
export function LoopLedger({
  loops,
  check,
}: {
  loops: EvidenceLoop[];
  check: LiveCheckStatus;
}) {
  const rows = [...loops].reverse();
  const slCount = loops.filter((l) => l.kind === 'stop-loss').length;
  const tpCount = loops.filter((l) => l.kind === 'take-profit').length;
  const totalOut = loops.reduce((sum, l) => sum + l.amountOutUSDC, 0);
  const latencies = loops.map((l) => l.latencyBlocksBase);
  const minLatency = latencies.length ? Math.min(...latencies) : 0;
  const maxLatency = latencies.length ? Math.max(...latencies) : 0;

  return (
    <div id="ledger" className="scroll-mt-24">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionHeading
          eyebrow="Loop ledger"
          title="Every execution, on the record"
          copy={`${loops.length} times the market crossed the band, and ${loops.length} times Reflex fired, evaluated and settled without a human or a bot in the loop. Each row is one complete loop — check any of the three transactions on its explorer.`}
        />
        <div className="pb-1">
          <VerificationBadge check={check} />
        </div>
      </div>

      {/* Summary strip */}
      <div className="mt-7 grid grid-cols-2 gap-px overflow-hidden rounded-card border border-line bg-line/40 sm:grid-cols-3 lg:grid-cols-5">
        {[
          { label: 'Executed loops', value: loops.length.toString() },
          { label: 'Stop-loss', value: `${slCount} fired` },
          { label: 'Take-profit', value: `${tpCount} fired` },
          { label: 'Protective sales', value: `$${fmtNum(totalOut, 0)}` },
          {
            label: 'Latency · origin to callback',
            value: loops.length ? `${minLatency}–${maxLatency} blocks` : '—',
          },
        ].map((stat, i, arr) => (
          <div
            key={stat.label}
            className={`bg-ink-850 px-5 py-4 ${
              i === arr.length - 1 ? 'col-span-2 sm:col-span-2 lg:col-span-1' : ''
            }`}
          >
            <MicroLabel>{stat.label}</MicroLabel>
            <p className="tnum mt-1 font-display text-[19px] font-semibold text-mist-100">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <VerificationNote check={check} />

      {loops.length === 0 ? (
        <Card className="mt-5 p-8 text-center">
          <p className="text-[14px] text-mist-400">
            No executed loops in the evidence pack yet. When the guardian fires, its loop lands
            here with all three transaction hashes.
          </p>
        </Card>
      ) : (
        <>
          {/* Desktop table */}
          <div className="mt-5 hidden overflow-hidden rounded-card border border-line bg-ink-850/90 shadow-card lg:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[880px] text-left text-[13px]">
                <thead>
                  <tr className="border-b border-line bg-ink-900/70 text-[11px] uppercase tracking-[0.14em] text-mist-500">
                    <th className="px-5 py-3.5 font-semibold">Loop</th>
                    <th className="px-3 py-3.5 font-semibold">Kind</th>
                    <th className="px-3 py-3.5 text-right font-semibold">Trigger</th>
                    <th className="px-3 py-3.5 text-right font-semibold">Executed</th>
                    <th className="px-3 py-3.5 text-right font-semibold">In</th>
                    <th className="px-3 py-3.5 text-right font-semibold">USDC out</th>
                    <th className="px-3 py-3.5 text-right font-semibold">Latency</th>
                    <th className="px-5 py-3.5 font-semibold">Transactions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((loop) => (
                    <tr
                      key={loop.n}
                      className="border-b border-line/60 transition-colors last:border-0 hover:bg-white/[0.02]"
                    >
                      <td className="tnum px-5 py-3.5 font-display font-semibold text-mist-100">
                        #{loop.n}
                      </td>
                      <td className="px-3 py-3.5">
                        <KindBadge loop={loop} />
                      </td>
                      <td className="tnum px-3 py-3.5 text-right text-mist-300">
                        {fmtUsd(loop.triggerPrice)}
                      </td>
                      <td className="tnum px-3 py-3.5 text-right font-medium text-mist-100">
                        {fmtUsd(loop.executedPrice)}
                      </td>
                      <td className="tnum whitespace-nowrap px-3 py-3.5 text-right text-mist-300">
                        {fmtNum(loop.amountInWETH, 0)} WETH
                      </td>
                      <td className="tnum px-3 py-3.5 text-right font-semibold text-mist-100">
                        {fmtNum(loop.amountOutUSDC)}
                      </td>
                      <td className="tnum px-3 py-3.5 text-right text-mist-300">
                        {loop.latencyBlocksBase} blk
                      </td>
                      <td className="px-5 py-3.5">
                        <TxLinks loop={loop} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="mt-5 space-y-3 lg:hidden">
            {rows.map((loop) => (
              <Card key={loop.n} className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="tnum font-display text-[15px] font-semibold text-mist-100">
                    Loop #{loop.n}
                  </span>
                  <KindBadge loop={loop} />
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
                  <LedgerStat label="Trigger price" value={fmtUsd(loop.triggerPrice)} />
                  <LedgerStat label="Executed price" value={fmtUsd(loop.executedPrice)} strong />
                  <LedgerStat label="Amount in" value={`${fmtNum(loop.amountInWETH, 0)} WETH`} />
                  <LedgerStat label="USDC out" value={fmtNum(loop.amountOutUSDC)} strong />
                  <LedgerStat label="Latency" value={`${loop.latencyBlocksBase} blocks`} />
                  <LedgerStat
                    label="Callback block"
                    value={loop.callbackBlock.toLocaleString('en-US')}
                  />
                </dl>
                <div className="mt-4 border-t border-line pt-3.5">
                  <TxLinks loop={loop} stacked />
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      <p className="mt-4 text-[12px] leading-relaxed text-mist-500">
        Band for every loop: stop-loss {fmtUsd(EVIDENCE_META.stopLoss, 0)} · take-profit{' '}
        {fmtUsd(EVIDENCE_META.takeProfit, 0)} · {fmtNum(EVIDENCE_META.protectedAmountWETH, 0)} WETH
        protected per loop. Latency counts Base Sepolia blocks from the origin swap to the callback
        execution. Rows are bundled from the verified evidence pack (updated{' '}
        {new Date(EVIDENCE_META.updatedAt).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })}
        ) because the callback contract stores only its latest execution and public RPC log scans
        are windowed — the live badge above is what ties this table to the chain today.
      </p>
    </div>
  );
}

function LedgerStat({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div>
      <MicroLabel>{label}</MicroLabel>
      <p
        className={`tnum mt-0.5 text-[14px] ${strong ? 'font-semibold text-mist-100' : 'text-mist-300'}`}
      >
        {value}
      </p>
    </div>
  );
}

export function KindBadge({ loop }: { loop: EvidenceLoop }) {
  return loop.kind === 'stop-loss' ? (
    <Pill tone="rose">Stop-loss</Pill>
  ) : (
    <Pill tone="volt">Take-profit</Pill>
  );
}

function TxLinks({ loop, stacked = false }: { loop: EvidenceLoop; stacked?: boolean }) {
  const links = [
    { label: 'Origin', hash: loop.originTx, url: explorerTxUrl('baseSepolia', loop.originTx) },
    { label: 'Reactive', hash: loop.reactiveTx, url: explorerTxUrl('lasna', loop.reactiveTx) },
    { label: 'Callback', hash: loop.callbackTx, url: explorerTxUrl('baseSepolia', loop.callbackTx) },
  ];
  return (
    <div className={stacked ? 'flex flex-col gap-1.5' : 'flex flex-wrap gap-x-4 gap-y-1'}>
      {links.map((link) => (
        <a
          key={link.label}
          href={link.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-baseline gap-1.5 text-[12px] transition hover:text-pulse-200"
        >
          <span className="font-semibold text-mist-400">{link.label}</span>
          <span className="font-mono text-[11.5px] text-pulse-300 underline decoration-pulse-400/30 underline-offset-4">
            {truncateMiddle(link.hash, 8, 6)}
          </span>
          <span aria-hidden className="text-mist-500">
            ↗
          </span>
        </a>
      ))}
    </div>
  );
}

function VerificationBadge({ check }: { check: LiveCheckStatus }) {
  switch (check) {
    case 'verified':
      return (
        <Pill tone="volt" dot>
          Verified live on-chain
        </Pill>
      );
    case 'syncing':
      return <Pill tone="pulse" dot>Chain ahead · syncing</Pill>;
    case 'error':
      return <Pill tone="neutral">Live check unavailable</Pill>;
    case 'loading':
      return <Pill tone="neutral">Checking chain…</Pill>;
  }
}

function VerificationNote({ check }: { check: LiveCheckStatus }) {
  if (check === 'verified') {
    return (
      <p className="mt-4 flex items-start gap-2 text-[13px] leading-relaxed text-mist-400">
        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-volt-400" aria-hidden />
        Live check passed: the callback contract's stored last execution on Base Sepolia matches
        the newest row in this ledger — kind, executed price and USDC out. What you are reading is
        what the chain last did.
      </p>
    );
  }
  if (check === 'syncing') {
    return (
      <p className="mt-4 flex items-start gap-2 text-[13px] leading-relaxed text-mist-400">
        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-pulse-400" aria-hidden />
        The chain's last execution does not match the newest bundled row yet — newer executions
        are settling into the evidence pack. The hero counter already reflects the live chain
        state; this table updates when the next pack is published.
      </p>
    );
  }
  if (check === 'error') {
    return (
      <p className="mt-4 flex items-start gap-2 text-[13px] leading-relaxed text-mist-400">
        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-mist-500" aria-hidden />
        The live chain check could not be completed, so the rows below are shown from the verified
        evidence pack without a live badge. Every transaction link still resolves on its explorer.
      </p>
    );
  }
  return (
    <p className="mt-4 flex items-start gap-2 text-[13px] leading-relaxed text-mist-500">
      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-mist-500" aria-hidden />
      Reading the callback contract's last execution from Base Sepolia to verify this ledger…
    </p>
  );
}
