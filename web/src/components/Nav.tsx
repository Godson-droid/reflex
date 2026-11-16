import { useEffect, useRef, useState, type ReactNode } from 'react';
import { NETWORKS } from '../lib/chain';
import { truncateMiddle } from '../lib/format';
import type { Wallet, WalletKind } from '../hooks/useWallet';
import { LiveDot, LogoMark } from './ui';

export function Nav({ wallet }: { wallet: Wallet }) {
  const { status, address, error, kind, hasInjected } = wallet;
  const [chooserOpen, setChooserOpen] = useState(false);
  const chooserRef = useRef<HTMLDivElement>(null);

  // Close the chooser once a connection lands.
  useEffect(() => {
    if (status === 'connected') setChooserOpen(false);
  }, [status]);

  // Close on outside click / Escape.
  useEffect(() => {
    if (!chooserOpen) return;
    const onDown = (event: MouseEvent) => {
      if (chooserRef.current && !chooserRef.current.contains(event.target as Node)) {
        setChooserOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setChooserOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [chooserOpen]);

  const pick = (connectKind: WalletKind) => {
    setChooserOpen(false);
    void wallet.connect(connectKind);
  };

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

        {/* Section links */}
        <nav className="hidden items-center gap-6 lg:flex" aria-label="Sections">
          {[
            { label: 'Ledger', href: '#ledger' },
            { label: 'Guardians', href: '#guardians' },
            { label: 'Evidence', href: '#evidence' },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[13px] font-medium text-mist-400 transition hover:text-mist-100"
            >
              {link.label}
            </a>
          ))}
        </nav>

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
                {kind === 'walletconnect' && (
                  <span
                    className="rounded bg-ink-950/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                    title="Connected with WalletConnect"
                  >
                    WC
                  </span>
                )}
                <button
                  onClick={() => void wallet.disconnect()}
                  className="grid h-5 w-5 place-items-center rounded-full bg-ink-950/15 text-[11px] font-bold transition hover:bg-ink-950/30"
                  aria-label="Disconnect wallet"
                  title="Disconnect"
                >
                  ✕
                </button>
              </span>
            </div>
          ) : (
            <div className="relative" ref={chooserRef}>
              <button
                onClick={() => setChooserOpen((open) => !open)}
                disabled={status === 'connecting'}
                aria-haspopup="menu"
                aria-expanded={chooserOpen}
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

              {chooserOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-[calc(100%+10px)] z-50 w-[292px] max-w-[calc(100vw-2rem)] rounded-2xl border border-line bg-ink-850 p-2 shadow-card"
                >
                  <p className="px-3 pb-1.5 pt-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-mist-500">
                    Connect a wallet
                  </p>
                  {hasInjected && (
                    <ChooserOption
                      onClick={() => pick('injected')}
                      icon={<BrowserWalletIcon />}
                      title="Browser wallet"
                      sub="MetaMask extension or in-app browser"
                    />
                  )}
                  <ChooserOption
                    onClick={() => pick('walletconnect')}
                    icon={<WalletConnectIcon />}
                    title="WalletConnect"
                    sub="Scan or tap to open your mobile wallet"
                  />
                  <p className="px-3 pb-2 pt-2 text-[11.5px] leading-relaxed text-mist-500">
                    Testnet only. Nothing moves without your signature in the wallet.
                  </p>
                </div>
              )}
            </div>
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

function ChooserOption({
  onClick,
  icon,
  title,
  sub,
}: {
  onClick: () => void;
  icon: ReactNode;
  title: string;
  sub: string;
}) {
  return (
    <button
      role="menuitem"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-white/[0.04] active:scale-[0.99]"
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-white/[0.04] text-mist-300 ring-1 ring-line">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-[13.5px] font-semibold text-mist-100">{title}</span>
        <span className="block text-[12px] leading-snug text-mist-500">{sub}</span>
      </span>
    </button>
  );
}

function BrowserWalletIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="3" y="4.5" width="18" height="15" rx="2.5" />
      <path d="M3 9.2h18" />
      <circle cx="6.3" cy="6.9" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="9.3" cy="6.9" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

function WalletConnectIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
      <path d="M4 8.5v-2A2.5 2.5 0 0 1 6.5 4h2" />
      <path d="M15.5 4h2A2.5 2.5 0 0 1 20 6.5v2" />
      <path d="M20 15.5v2A2.5 2.5 0 0 1 17.5 20h-2" />
      <path d="M8.5 20h-2A2.5 2.5 0 0 1 4 17.5v-2" />
      <rect x="9.2" y="9.2" width="5.6" height="5.6" rx="1.4" />
    </svg>
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
