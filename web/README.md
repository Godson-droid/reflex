# Reflex — Frontend

**Your portfolio's reflexes — positions that protect themselves.**

The web interface for Reflex, a stop-loss / take-profit guardian that lives inside a
Reactive smart contract (Reactive Omni Buildathon · Every Second Counts track).
Set two prices; the contract watches the WETH/USDC pair on Base Sepolia and executes
the protective swap itself via a callback from Reactive Lasna. No keeper, no bot.

Design system, tokens, and component inventory: see [DESIGN.md](./DESIGN.md).
Screenshots: [docs/screenshots](./docs/screenshots).

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build into dist/
npm run preview    # serve the production build
```

## Stack

Vite · React · TypeScript · Tailwind CSS v3 · ethers v6 · Fontsource
(Inter, Space Grotesk, JetBrains Mono).

## Data layer

All chain access is behind `src/lib/chain.ts` (the `ChainAdapter` interface).
It currently runs on a mock implementation — seeded price history, a gently
ticking live price, and two sample guardians — so the UI demos end-to-end with
no contracts deployed. Wallet connect is real (`window.ethereum`).

To wire the real contracts, fill in the `CONTRACTS` object at the top of
`src/lib/chain.ts` (guardian on Lasna, callback + pair on Base Sepolia) and
replace the mock functions with ethers calls. No component changes needed.
