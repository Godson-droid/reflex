import { SectionHeading } from './ui';

const STEPS = [
  {
    n: '01',
    chain: 'Base Sepolia',
    title: 'The pair moves',
    copy: 'Every trade on the WETH/USDC pair emits a Sync event with fresh reserves — a public, on-chain price print that nobody can fake or hide.',
    chip: 'Sync(reserve0, reserve1)',
    chipTone: 'text-pulse-300 ring-pulse-400/25 bg-pulse-400/10',
  },
  {
    n: '02',
    chain: 'Reactive Lasna',
    title: 'Reflex evaluates',
    copy: 'The Reflex contract is subscribed to those events. Each print is checked against your stop-loss and take-profit inside react() — no server polls, no keeper network, no one who can go offline.',
    chip: 'react() · price ≤ stop-loss?',
    chipTone: 'text-volt-300 ring-volt-400/25 bg-volt-400/10',
  },
  {
    n: '03',
    chain: 'Base Sepolia',
    title: 'The swap executes itself',
    copy: 'On a cross, the contract requests a callback and the destination chain settles the protective swap in the same block window — roughly a second after the price moved, not whenever a bot wakes up.',
    chip: 'callback · sell 2.5 WETH',
    chipTone: 'text-volt-300 ring-volt-400/25 bg-volt-400/10',
  },
];

export function HowItWorks() {
  return (
    <div>
      <SectionHeading
        eyebrow="How it works"
        title="A reflex, not a reminder"
        copy="Traditional stop-losses live on an exchange's server or in a bot you have to babysit. Reflex moves the trigger into the chain itself, using Reactive Network's inverted model: contracts that subscribe to events and act on them."
      />

      <div className="dot-grid relative mt-9 rounded-card border border-line bg-ink-900/40 p-5 sm:p-7">
        <div className="grid gap-5 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <article
              key={step.n}
              className="group relative rounded-panel border border-line bg-ink-850 p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-ink-600"
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-[13px] font-bold tracking-widest text-mist-500">
                  {step.n}
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-mist-400">
                  {step.chain}
                </span>
              </div>
              <h3 className="mt-4 font-display text-[19px] font-semibold tracking-tight text-mist-100">
                {step.title}
              </h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-mist-400">{step.copy}</p>
              <p
                className={`mt-4 inline-block rounded-lg px-2.5 py-1.5 font-mono text-[11.5px] ring-1 ${step.chipTone}`}
              >
                {step.chip}
              </p>

              {/* connector arrow to the next card */}
              {i < STEPS.length - 1 && (
                <span
                  className="absolute -right-[22px] top-1/2 z-10 hidden -translate-y-1/2 text-volt-400 md:block"
                  aria-hidden
                >
                  <svg width="26" height="14" viewBox="0 0 26 14" fill="none">
                    <path
                      d="M1 7h22M18 1.5 23.5 7 18 12.5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              )}
            </article>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-center text-[12.5px] text-mist-500">
          <span>
            <strong className="font-semibold text-mist-200">~1 block</strong> from print to protection
          </span>
          <span aria-hidden className="hidden h-1 w-1 rounded-full bg-mist-500 sm:block" />
          <span>
            <strong className="font-semibold text-mist-200">Zero</strong> off-chain components to keep awake
          </span>
          <span aria-hidden className="hidden h-1 w-1 rounded-full bg-mist-500 sm:block" />
          <span>
            <strong className="font-semibold text-mist-200">Every step</strong> verifiable on a public explorer
          </span>
        </div>
      </div>
    </div>
  );
}
