import { ABORT_PROOF, NEGATIVE_PROOF } from '../data/evidence';
import { fmtUsd } from '../lib/format';
import { Card, MicroLabel, SectionHeading } from './ui';

const REPO = 'https://github.com/Godson-droid/reflex';

const PACK_LINKS = [
  {
    title: 'Evidence pack',
    copy: 'The full machine-readable record: every loop, balance snapshot and reconciliation in one JSON file, plus the summary table.',
    href: `${REPO}/tree/main/evidence`,
    cta: 'evidence/ on GitHub',
  },
  {
    title: 'LOOPS.md',
    copy: 'The human-readable ledger — the same table as above with the in-band negative proof and the recovery abort attempt written out in full.',
    href: `${REPO}/blob/main/evidence/LOOPS.md`,
    cta: 'Read LOOPS.md',
  },
  {
    title: 'Receipts',
    copy: 'One JSON receipt per loop with trigger swap sizing, balances before and after, and the re-arm transactions — the raw material the ledger is built from.',
    href: `${REPO}/tree/main/evidence/receipts`,
    cta: 'evidence/receipts/ on GitHub',
  },
];

/**
 * Evidence section — where a judge (or anyone) can re-derive every
 * number on this page: the published evidence pack, the per-loop
 * receipts, the two control proofs, and the one-command loop runner.
 */
export function EvidenceSection() {
  return (
    <div id="evidence" className="scroll-mt-24">
      <SectionHeading
        eyebrow="Evidence"
        title="Do not trust this page. Verify it."
        copy="Everything above is published in the open. The evidence pack reconciles each execution against the owner's balances to the token, and the loop runner that produced these rows is one command in the repo."
      />

      <div className="mt-7 grid gap-5 md:grid-cols-3">
        {PACK_LINKS.map((link) => (
          <a
            key={link.title}
            href={link.href}
            target="_blank"
            rel="noreferrer"
            className="group rounded-card border border-line bg-ink-850/90 p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-ink-600"
          >
            <h3 className="font-display text-[17px] font-semibold tracking-tight text-mist-100">
              {link.title}
            </h3>
            <p className="mt-2 text-[13.5px] leading-relaxed text-mist-400">{link.copy}</p>
            <p className="mt-4 text-[13px] font-semibold text-pulse-300 transition group-hover:text-pulse-200">
              {link.cta} <span aria-hidden>↗</span>
            </p>
          </a>
        ))}
      </div>

      {/* Control proofs */}
      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <Card className="p-6">
          <MicroLabel>Negative proof · in-band move ignored</MicroLabel>
          <p className="mt-2.5 text-[13.5px] leading-relaxed text-mist-400">
            A swap moved the price from {fmtUsd(NEGATIVE_PROOF.priceBefore)} to{' '}
            {fmtUsd(NEGATIVE_PROOF.priceAfterSwap)} — inside the band. The guardian priced the Sync,
            updated its last price, and did not fire: zero Triggered events in the window, no
            callback, balances untouched. A guardian that only fires is a liability; this is the
            proof it can also hold.
          </p>
          <a
            href={`${REPO}/blob/main/evidence/receipts/negative-proof.json`}
            target="_blank"
            rel="noreferrer"
            className="mt-3.5 inline-block text-[13px] font-semibold text-pulse-300 transition hover:text-pulse-200"
          >
            negative-proof.json <span aria-hidden>↗</span>
          </a>
        </Card>
        <Card className="p-6">
          <MicroLabel>Abort path · recovery attempt, loop #{ABORT_PROOF.loopN}</MicroLabel>
          <p className="mt-2.5 text-[13.5px] leading-relaxed text-mist-400">
            When loop #{ABORT_PROOF.loopN} triggered at $2,300, a recovery buy-back to $3,000 was
            sent the moment the trigger was seen on Lasna. It landed 57 Base blocks after the trigger swap, 51 after the callback, which had already executed in 6. The race is documented, not hidden — beating the
            callback by hand is not possible on this deployment, and the abort branch itself is
            covered by the callback test suite.
          </p>
          <a
            href={`${REPO}/blob/main/evidence/receipts/abort-attempt.json`}
            target="_blank"
            rel="noreferrer"
            className="mt-3.5 inline-block text-[13px] font-semibold text-pulse-300 transition hover:text-pulse-200"
          >
            abort-attempt.json <span aria-hidden>↗</span>
          </a>
        </Card>
      </div>

      {/* Loop runner */}
      <Card className="mt-5 overflow-hidden">
        <div className="grid md:grid-cols-[1fr_auto] md:items-center">
          <div className="p-6 sm:p-7">
            <MicroLabel>Reproduce a loop</MicroLabel>
            <h3 className="mt-2 font-display text-[19px] font-semibold tracking-tight text-mist-100">
              One command fires the whole loop
            </h3>
            <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-mist-400">
              The runner sizes a trigger swap from live reserves, lands the price on your target,
              waits for the guardian to trigger and the callback to execute, re-arms both
              contracts, and prints the three transaction hashes. Testnet only; needs Foundry,
              python3, and the deployer wallet key in a local .env, because the runner fires
              from the deployer wallet. Verifying any published hash needs no key at all.
            </p>
          </div>
          <div className="border-t border-line bg-ink-900/70 p-6 sm:p-7 md:border-l md:border-t-0">
            <p className="whitespace-nowrap font-mono text-[12.5px] leading-relaxed text-volt-300">
              <span className="text-mist-500"># from contracts/ in the repo</span>
              <br />
              script/run-loop.sh stop-loss 2200
              <br />
              script/run-loop.sh take-profit 3600
            </p>
            <a
              href={`${REPO}/blob/main/contracts/script/run-loop.sh`}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block text-[13px] font-semibold text-pulse-300 transition hover:text-pulse-200"
            >
              contracts/script/run-loop.sh <span aria-hidden>↗</span>
            </a>
          </div>
        </div>
      </Card>
    </div>
  );
}
