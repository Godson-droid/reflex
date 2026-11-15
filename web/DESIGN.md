# Reflex — Design System & Handoff Notes

Reflex is the interface for a stop-loss / take-profit guardian that lives inside a
Reactive smart contract. The design goal: feel like a shipped DeFi product, not a
hackathon demo — quiet, dense where it matters, and confident about one accent.

**Brand line:** *Your portfolio's reflexes — positions that protect themselves.*
The mark is a lightning bolt (the reflex arc) set in a dark rounded tile; the bolt
is the only place the accent appears at full strength in the brand lockup.

---

## Color tokens

Defined in `tailwind.config.js`; never hard-code hex values in components.

| Token | Value | Usage |
| --- | --- | --- |
| `ink-950` | `#07080a` | Page background |
| `ink-900` | `#0a0c0f` | Sunken sections, inset panels |
| `ink-850` | `#0e1116` | Card surface |
| `ink-800` | `#12161d` | Raised elements, tooltips, logo tile |
| `ink-700` | `#1a202a` | Hover states |
| `ink-600` | `#262e3b` | Strong borders, scrollbar |
| `line` | `rgba(235,242,235,.08)` | Default 1px border everywhere |
| `volt-400` | `#cff94d` | **Primary accent** — CTA, take-profit, live states, chart line |
| `volt-300 / 500 / 600` | `#e2ff7a / #b8e62e / #92c418` | Accent text on dark, pressed states |
| `pulse-400` | `#67e8f9` | Secondary signal — Reactive network, in-flight, explorer links |
| `rose-400 / 500` | `#fb7185 / #f43f5e` | Stop-loss, errors, negative movement |
| `mist-100` | `#f2f5f0` | Primary text |
| `mist-300 / 400` | `#b7beb4 / #939c92` | Secondary text |
| `mist-500` | `#68736a` | Captions, micro-labels, hints |

Rules: the accent is rationed — one primary CTA per view, the chart line, and
"watching" states. Rose is reserved for downside (stop-loss, losses); volt never
means "down". Cyan (`pulse`) always refers to the Reactive network layer.

## Typography

| Role | Face | Notes |
| --- | --- | --- |
| Display / headings / wordmark | **Space Grotesk** 500–700 | Tight tracking (`-0.025em`); sizes 56 / 40 / 32 / 28 / 19 |
| UI / body | **Inter** 400–700 | 15px base in panels, 13–13.5px for dense data rows |
| Hashes / code chips | **JetBrains Mono** 400–500 | Tx hashes, event signatures |
| Numbers | Inter or Space Grotesk + `.tnum` | Tabular figures are mandatory for every price, amount, and percentage so live ticks never jitter the layout |

Type scale: display-xl 56 · display-lg 40 · h2 32/28 · card title 19 · body 15 ·
dense 13.5 · small 12.5 · micro-label 11 (uppercase, `0.16em` tracking).

## Spacing & shape

- 4px base grid; section rhythm is `py-12` between bands, `gap-6` between cards.
- Page container: `max-w-7xl` with 16/24/32px gutters.
- Radii: cards `20px` (`rounded-card`), inner panels `16px` (`rounded-panel`),
  inputs `12px`, pills full.
- Cards: `ink-850` at 90% over a hairline `line` border, `shadow-card`
  (inset top highlight + deep soft drop). No gradients on surfaces; the only
  gradient is the chart area fill and the hero's ambient glow.

## Component inventory

| Component | File | Notes |
| --- | --- | --- |
| `Nav` | `components/Nav.tsx` | Sticky, blurred; network badge + wallet connect (connected = volt pill w/ truncated address + disconnect) |
| `LogoMark`, `Card`, `Pill`, `LiveDot`, `MicroLabel`, `SectionHeading` | `components/ui.tsx` | Shared primitives — extend here, not inline |
| `MarketCard` | `components/MarketCard.tsx` | Pair identity, price block, 24h stat strip |
| `PriceChart` | `components/PriceChart.tsx` | Hand-rolled SVG area chart; hover crosshair + readout; dashed SL/TP guides driven by the form preview |
| `CreateGuardian` | `components/CreateGuardian.tsx` | Validated form; the plain-English summary is the emotional core — it restates the rule in the user's words before they sign anything |
| `Guardians` / `GuardianCard` / `LoopStepRow` | `components/Guardians.tsx` | Distance-to-trigger range bar; per-guardian **automation loop timeline** (origin event → reactive tx → callback tx) with explorer links — this is the Execution-criterion evidence, so it is visually first-class, not an afterthought |
| `HowItWorks` | `components/HowItWorks.tsx` | 3-step Reactive explainer over a dot grid, mono event chips, connector arrows |
| `Footer` | `components/Footer.tsx` | Testnet disclaimer, docs/explorer links |

## Interaction notes

- Live price ticks every 5s from the adapter; the range-bar marker and distances
  animate (`transition-all duration-700`) instead of jumping.
- Chart line draws in once on mount (`draw-line` keyframe); guardian cards fade
  up when newly armed; buttons compress 1% on press. Nothing else moves —
  motion is a signal, not decoration.
- Form errors appear on submit (or stay live once touched) in rose, with the
  summary sentence degrading gracefully to an instruction when inputs are invalid.
- Focus states: volt ring at 10% + border at 60% on all inputs; visible and
  consistent.

## Data & integration

All chain access sits behind `src/lib/chain.ts` (`ChainAdapter` interface).
The mock returns a seeded 48-point price history, a gently ticking live price,
and two guardians (one watching, one triggered stop-loss with a complete loop).
To go live: fill `CONTRACTS` (guardian on Lasna, callback + pair on Base
Sepolia), replace the mock functions with ethers v6 calls, and delete the mock
state — components do not change. Wallet connect is already real
(`window.ethereum` via ethers `BrowserProvider`, account/chain listeners in
`hooks/useWallet.ts`).

## Responsive behavior

Single column under `lg`: market card stacks above the form; guardian cards
collapse the loop timeline below the position summary; hero type drops to
40px. The nav sheds the "by Reactive Network" caption and network badge text
progressively (`md`/`sm`) before it ever wraps.
