import { NETWORKS } from '../lib/chain';
import { LogoMark } from './ui';

const LINKS = [
  // TODO(integration): point at the published Reflex repo once it is pushed.
  { label: 'GitHub repository', href: 'https://github.com/Godson-droid/reflex' },
  { label: 'Reactive docs', href: 'https://dev.reactive.network/' },
  { label: 'Base Sepolia explorer', href: NETWORKS.baseSepolia.explorer },
  { label: 'Lasna explorer', href: NETWORKS.lasna.explorer },
  { label: 'Buildathon', href: 'https://dorahacks.io/hackathon/reactive-omni-buildathon' },
];

export function Footer() {
  return (
    <footer className="border-t border-line bg-ink-900/50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-3">
              <LogoMark size={30} />
              <span className="font-display text-[17px] font-bold tracking-tight text-mist-100">
                Reflex
              </span>
            </div>
            <p className="mt-3 text-[13px] leading-relaxed text-mist-500">
              Your portfolio's reflexes — positions that protect themselves. Built on Reactive
              Network for the Reactive Omni Buildathon.
            </p>
          </div>

          <nav className="grid grid-cols-2 gap-x-12 gap-y-2.5 sm:grid-cols-3" aria-label="Footer">
            {LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="text-[13px] font-medium text-mist-400 transition hover:text-volt-300"
              >
                {link.label} <span aria-hidden className="text-mist-500">↗</span>
              </a>
            ))}
          </nav>
        </div>

        <div className="mt-9 flex flex-col gap-2 border-t border-line pt-5 text-[12px] leading-relaxed text-mist-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Reflex runs entirely on public testnets — Base Sepolia and Reactive Lasna. Testnet
            assets have no value, and nothing here is financial advice.
          </p>
          <p className="shrink-0">© 2026 Reflex · Reactive Omni Buildathon</p>
        </div>
      </div>
    </footer>
  );
}
