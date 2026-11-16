import { useCallback, useEffect, useState } from 'react';
import { chain, type Guardian, type MarketData } from './lib/chain';
import { useWallet } from './hooks/useWallet';
import { useLiveLoop, type LiveCheckStatus } from './hooks/useLiveLoop';
import { EVIDENCE_LOOPS, EVIDENCE_META } from './data/evidence';
import { Nav } from './components/Nav';
import { MarketCard } from './components/MarketCard';
import { CreateGuardian } from './components/CreateGuardian';
import { Guardians } from './components/Guardians';
import { LoopLedger } from './components/LoopLedger';
import { EvidenceSection } from './components/EvidenceSection';
import { BandGauge } from './components/BandGauge';
import { HowItWorks } from './components/HowItWorks';
import { Footer } from './components/Footer';
import { fmtNum, fmtUsd } from './lib/format';

export default function App() {
  const wallet = useWallet();
  const live = useLiveLoop();
  const [market, setMarket] = useState<MarketData | null>(null);
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [preview, setPreview] = useState<{ sl?: number; tp?: number }>({});

  // Initial load + gentle live ticking from the adapter.
  useEffect(() => {
    let cancelled = false;
    Promise.all([chain.getMarket(), chain.getGuardians()]).then(([m, g]) => {
      if (cancelled) return;
      setMarket(m);
      setGuardians(g);
    });
    const id = window.setInterval(() => {
      chain.tickMarket().then((m) => {
        if (!cancelled) setMarket(m);
      });
    }, 5000);
    const guardiansId = window.setInterval(() => {
      chain.getGuardians().then((g) => {
        if (!cancelled) setGuardians(g);
      });
    }, 20000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
      window.clearInterval(guardiansId);
    };
  }, []);

  const handlePreview = useCallback((sl?: number, tp?: number) => {
    setPreview({ sl, tp });
  }, []);

  const handleArmed = useCallback((guardian: Guardian) => {
    setGuardians((prev) => [guardian, ...prev]);
    window.setTimeout(() => {
      document.getElementById('guardians')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  }, []);

  const totalProtected = guardians
    .filter((g) => g.status === 'watching')
    .reduce((sum, g) => sum + g.amount, 0);

  // Hero live values: the chain snapshot wins; the market snapshot and the
  // evidence band are the fallbacks while the first read is in flight.
  const heroPrice = live.state?.price ?? market?.price;
  const heroStopLoss = live.state?.stopLoss ?? EVIDENCE_META.stopLoss;
  const heroTakeProfit = live.state?.takeProfit ?? EVIDENCE_META.takeProfit;
  const guardianStatus = live.state
    ? live.state.watching
      ? 'Watching'
      : live.state.guardianState === 2 || live.state.callbackStatus === 1
        ? 'Triggered'
        : 'Standby'
    : live.check === 'error'
      ? 'Check unavailable'
      : 'Reading chain…';

  return (
    <div id="top" className="min-h-screen bg-ink-950">
      <Nav wallet={wallet} />

      {/* ---------- Hero ---------- */}
      <div className="hero-glow border-b border-line">
        <div className="mx-auto max-w-7xl px-4 pb-12 pt-12 sm:px-6 sm:pt-16 lg:px-8">
          <div className="max-w-3xl animate-fade-up">
            <p className="inline-flex items-center gap-2 rounded-full border border-line bg-ink-850 px-3 py-1.5 text-[11.5px] font-semibold uppercase tracking-[0.14em] text-mist-300">
              <span className="h-1.5 w-1.5 rounded-full bg-volt-400" />
              Stop-loss &amp; take-profit, on-chain
            </p>
            <h1 className="mt-5 font-display text-display-lg font-bold text-mist-100 sm:text-display-xl">
              Your portfolio's reflexes.
              <span className="block text-mist-400">Positions that protect themselves.</span>
            </h1>
            <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-mist-400">
              Reflex puts a guardian inside a Reactive smart contract. It watches the market the way
              your nervous system watches your hand near a flame — and pulls back before you even
              know there was danger. No keeper, no bot, no 3 a.m. margin call.
            </p>
          </div>

          <dl className="mt-10 grid grid-cols-2 gap-x-8 gap-y-6 lg:grid-cols-4">
            <div>
              <dt className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-mist-500">
                Loops executed
                <ExecutionBadge check={live.check} />
              </dt>
              <dd className="tnum mt-1.5 font-display text-[34px] font-bold leading-none text-mist-100">
                {live.evidenceCount}
              </dd>
              <dd className="mt-1.5 text-[12px] leading-snug text-mist-500">
                {live.check === 'verified'
                  ? 'Last execution confirmed on-chain just now'
                  : live.check === 'syncing'
                    ? 'Newest executions settling into the evidence pack'
                    : 'From the verified evidence pack'}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mist-500">
                Guardian status
              </dt>
              <dd className="mt-1.5 flex items-center gap-2 font-display text-[20px] font-semibold leading-8 text-mist-100">
                {live.state?.watching && (
                  <span className="relative flex h-2 w-2" aria-hidden>
                    <span className="absolute h-full w-full animate-ping-soft rounded-full bg-volt-400" />
                    <span className="relative h-2 w-2 rounded-full bg-volt-400" />
                  </span>
                )}
                {guardianStatus}
              </dd>
              <dd className="mt-1 text-[12px] leading-snug text-mist-500">
                Guardian on Lasna · callback on Base Sepolia
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mist-500">
                Current price
              </dt>
              <dd className="tnum mt-1.5 font-display text-[20px] font-semibold leading-8 text-mist-100">
                {heroPrice ? fmtUsd(heroPrice) : '—'}
              </dd>
              <dd className="mt-1 text-[12px] leading-snug text-mist-500">
                Live from ReflexPair reserves
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mist-500">
                WETH protected
              </dt>
              <dd className="tnum mt-1.5 font-display text-[20px] font-semibold leading-8 text-mist-100">
                {fmtNum(totalProtected)} WETH
              </dd>
              <dd className="mt-1 text-[12px] leading-snug text-mist-500">
                {guardians.filter((g) => g.status === 'watching').length} guardian
                {guardians.filter((g) => g.status === 'watching').length === 1 ? '' : 's'} armed ·
                no off-chain bots
              </dd>
            </div>
          </dl>

          {/* Price band gauge */}
          <div className="mt-9 rounded-card border border-line bg-ink-850/80 px-5 py-5 shadow-card sm:px-7">
            {heroPrice ? (
              <BandGauge price={heroPrice} stopLoss={heroStopLoss} takeProfit={heroTakeProfit} />
            ) : (
              <div className="h-[104px] animate-pulse rounded-panel bg-ink-800/60" />
            )}
          </div>
        </div>
      </div>

      {/* ---------- Console ---------- */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-start gap-6 py-10 lg:grid-cols-[1fr_400px]">
          {market ? (
            <>
              <MarketCard
                market={market}
                previewStopLoss={preview.sl}
                previewTakeProfit={preview.tp}
              />
              <CreateGuardian market={market} onArmed={handleArmed} onPreview={handlePreview} />
            </>
          ) : (
            <>
              <div className="h-[430px] animate-pulse rounded-card border border-line bg-ink-850" />
              <div className="h-[430px] animate-pulse rounded-card border border-line bg-ink-850" />
            </>
          )}
        </div>

        <div className="border-t border-line py-12">
          <LoopLedger loops={EVIDENCE_LOOPS} check={live.check} />
        </div>

        <div id="guardians" className="scroll-mt-24 border-t border-line py-12">
          {market && <Guardians guardians={guardians} currentPrice={market.price} />}
        </div>

        <div className="border-t border-line py-12">
          <HowItWorks />
        </div>

        <div className="border-t border-line py-12 pb-16">
          <EvidenceSection />
        </div>
      </main>

      <Footer />
    </div>
  );
}

function ExecutionBadge({ check }: { check: LiveCheckStatus }) {
  if (check === 'verified') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-volt-400/15 px-1.5 py-0.5 text-[9.5px] font-bold tracking-[0.1em] text-volt-300 ring-1 ring-volt-400/30">
        <span className="h-1 w-1 rounded-full bg-volt-400" aria-hidden />
        Live
      </span>
    );
  }
  if (check === 'syncing') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-pulse-400/10 px-1.5 py-0.5 text-[9.5px] font-bold tracking-[0.1em] text-pulse-300 ring-1 ring-pulse-400/25">
        Syncing
      </span>
    );
  }
  if (check === 'loading') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.04] px-1.5 py-0.5 text-[9.5px] font-bold tracking-[0.1em] text-mist-400 ring-1 ring-line">
        Checking
      </span>
    );
  }
  return null;
}
