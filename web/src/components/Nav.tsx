import { NETWORKS } from '../lib/chain';
import { truncateMiddle } from '../lib/format';
import type { Wallet } from '../hooks/useWallet';
import { LiveDot, LogoMark } from './ui';

export function Nav({ wallet }: { wallet: Wallet }) {
  const { status, address, error } = wallet;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ink-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <a href="#top" className="flex items-center gap-3">
          <LogoMark />
          <span className="flex items-baseline gap-2">
            <span className="font-display text-[21px] font-bold tracking-tight text-mist-100">
              Reflex
            </span>
            <span className="hidden text-[12px] font-medium text-mist-500 md:inline">
              by Reactive Network
            </span>
          </span>
        </a>

        {/* Right cluster */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <span className="hidden items-center gap-2 rounded-full border border-line bg-ink-850 py-1.5 pl-3 pr-3.5 text-[12px] font-medium text-mist-300 sm:inline-flex">
            <LiveDot />
            {NETWORKS.baseSepolia.label}
            <span className="text-mist-500">testnet</span>
          </span>

          {status === 'connected' && address ? (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-volt-400 py-2 pl-3.5 pr-2 text-[13px] font-semibold text-ink-950">
                <span className="h-2 w-2 rounded-full bg-ink-950/70" />
                <span className="tnum">{truncateMiddle(address)}</span>
                <button
                  onClick={wallet.disconnect}
                  className="grid h-5 w-5 place-items-center rounded-full bg-ink-950/15 text-[11px] font-bold transition hover:bg-ink-950/30"
                  aria-label="Disconnect wallet"
                  title="Disconnect"
                >
                  ✕
                </button>
              </span>
            </div>
          ) : (
            <button
              onClick={wallet.connect}
              disabled={status === 'connecting'}
              className="inline-flex items-center gap-2 rounded-full bg-volt-400 px-4 py-2 text-[13px] font-semibold text-ink-950 shadow-glow transition-all duration-200 hover:bg-volt-300 active:scale-[0.98] disabled:cursor-wait disabled:opacity-70 sm:px-5"
            >
              {status === 'connecting' ? (
                <>
                  <Spinner /> Connecting…
                </>
              ) : (
                'Connect Wallet'
              )}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="border-t border-rose-400/20 bg-rose-500/10 px-4 py-2 text-center text-[12.5px] text-rose-300">
          {error}
        </div>
      )}
    </header>
  );
}

export function Spinner({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
