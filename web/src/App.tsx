import { useCallback, useEffect, useState } from 'react';
import { chain, type Guardian, type MarketData } from './lib/chain';
import { useWallet } from './hooks/useWallet';
import { Nav } from './components/Nav';
import { MarketCard } from './components/MarketCard';
import { CreateGuardian } from './components/CreateGuardian';
import { Guardians } from './components/Guardians';
import { HowItWorks } from './components/HowItWorks';
import { Footer } from './components/Footer';
import { fmtNum } from './lib/format';

export default function App() {
  const wallet = useWallet();
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
    return () => {
      cancelled = true;
      window.clearInterval(id);
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

          <dl className="mt-9 flex flex-wrap gap-x-10 gap-y-4">
            {[
              {
                k: 'Guardians armed',
                v: guardians.filter((g) => g.status === 'watching').length.toString(),
              },
              { k: 'WETH protected', v: `${fmtNum(totalProtected)} WETH` },
              { k: 'Reaction time', v: '~1 block' },
              { k: 'Off-chain bots', v: 'None' },
            ].map((stat) => (
              <div key={stat.k}>
                <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mist-500">
                  {stat.k}
                </dt>
                <dd className="tnum mt-1 font-display text-[20px] font-semibold text-mist-100">
                  {stat.v}
                </dd>
              </div>
            ))}
          </dl>
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

        <div id="guardians" className="scroll-mt-24 border-t border-line py-12">
          {market && <Guardians guardians={guardians} currentPrice={market.price} />}
        </div>

        <div className="border-t border-line py-12 pb-16">
          <HowItWorks />
        </div>
      </main>

      <Footer />
    </div>
  );
}
