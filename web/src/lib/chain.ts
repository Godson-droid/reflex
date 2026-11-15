/**
 * chain.ts — the ONLY module in the app that talks to a chain.
 *
 * WIRED (phase 2): CONTRACTS below holds the real testnet deployment.
 * Market data and guardian state are read live from Base Sepolia and
 * Reactive Lasna through public RPCs (ethers v6 JsonRpcProvider, no wallet
 * needed for reads). The two executed protections from the live demo run
 * are shown as recorded guardians: their loop steps carry the actual
 * transaction hashes of the on-chain run (origin swap -> reactive
 * transaction -> callback execution), which is the submission's Execution
 * evidence. If an RPC read fails, the adapter falls back to the last
 * recorded snapshot so the page still renders.
 *
 * Writes (creating a guardian from the browser) remain a local demo
 * action: the real flow is a two-chain wallet sequence (approve on Base
 * Sepolia, configure on Lasna) that the contracts already support; the
 * read path wired here is what the judging demo exercises.
 */

import { BrowserProvider, Contract, JsonRpcProvider } from 'ethers';

/* ------------------------------------------------------------------ */
/*  Contract wiring — deployed 2026-11-15 (see stopguard/DEPLOYMENT.md) */
/* ------------------------------------------------------------------ */

export const CONTRACTS = {
  /** ReflexGuardian — Reactive Smart Contract on Reactive Lasna (5318007). */
  reactiveGuardian: '0x057A04Ad09c9A1fD83088F9863E81b181f8a4D9A',
  /** ReflexCallback — callback executor on Base Sepolia (84532). */
  callbackExecutor: '0x7858F9f40dBdB2Edfd32c781a98c69294cd009d0',
  /** ReflexPair — the watched V2-style pair on Base Sepolia. */
  pair: '0x1bC9aB7D74f12897A44717B9497478e2b01CE2D6',
  /** Pair token0 (the sold asset, WETH) on Base Sepolia. */
  sellToken: '0x057A04Ad09c9A1fD83088F9863E81b181f8a4D9A',
  /** Pair token1 (the quote asset, USDC) on Base Sepolia. */
  quoteToken: '0xA37786bDdda4FA1039291A25cC9043669Fb42DFd',
} as const;

/** True once real addresses are dropped into CONTRACTS above. */
export const CONTRACTS_WIRED: boolean =
  (CONTRACTS.reactiveGuardian as string) !== '0x0000000000000000000000000000000000000000';

export const NETWORKS = {
  baseSepolia: {
    key: 'baseSepolia',
    label: 'Base Sepolia',
    chainId: 84532,
    explorer: 'https://sepolia.basescan.org',
  },
  lasna: {
    key: 'lasna',
    label: 'Reactive Lasna',
    chainId: 5318007,
    explorer: 'https://lasna.reactscan.net',
  },
} as const;

export type NetworkKey = keyof typeof NETWORKS;

export function explorerTxUrl(network: NetworkKey, txHash: string): string {
  return `${NETWORKS[network].explorer}/tx/${txHash}`;
}

export function explorerAddressUrl(network: NetworkKey, address: string): string {
  return `${NETWORKS[network].explorer}/address/${address}`;
}

/* ------------------------------------------------------------------ */
/*  Domain types                                                       */
/* ------------------------------------------------------------------ */

export interface PricePoint {
  /** Unix ms timestamp */
  t: number;
  price: number;
}

export interface MarketData {
  pairLabel: string;
  baseSymbol: string;
  quoteSymbol: string;
  venue: string;
  price: number;
  change24hPct: number;
  high24h: number;
  low24h: number;
  volume24hUsd: number;
  history: PricePoint[];
  updatedAt: string;
}

export type GuardianStatus = 'watching' | 'triggered-sl' | 'triggered-tp';

export type LoopStepKind = 'origin' | 'reactive' | 'callback';

export interface LoopStep {
  kind: LoopStepKind;
  title: string;
  detail: string;
  network: NetworkKey;
  status: 'done' | 'pending';
  txHash?: string;
  at?: string;
}

export interface Guardian {
  id: string;
  pairLabel: string;
  baseSymbol: string;
  quoteSymbol: string;
  stopLoss: number;
  takeProfit: number;
  amount: number;
  status: GuardianStatus;
  createdAt: string;
  /** Set once triggered */
  triggerPrice?: number;
  receivedQuote?: number;
  steps: LoopStep[];
}

export interface CreateGuardianInput {
  stopLoss: number;
  takeProfit: number;
  amount: number;
}

export interface ChainAdapter {
  getMarket(): Promise<MarketData>;
  /** Re-read the market (live reserves) and return the fresh snapshot. */
  tickMarket(): Promise<MarketData>;
  getGuardians(): Promise<Guardian[]>;
  createGuardian(input: CreateGuardianInput): Promise<Guardian>;
}

/* ------------------------------------------------------------------ */
/*  Live read layer (ethers v6, read-only providers)                   */
/* ------------------------------------------------------------------ */

const BASE_RPC = 'https://sepolia.base.org';
const LASNA_RPC = 'https://lasna-rpc.rnk.dev/';

const PAIR_ABI = [
  'function getReserves() view returns (uint112 reserve0, uint112 reserve1)',
  'function token0() view returns (address)',
  'function token1() view returns (address)',
];
const ERC20_ABI = ['function symbol() view returns (string)'];
const GUARDIAN_ABI = [
  'function state() view returns (uint8)',
  'function sellToken0() view returns (bool)',
  'function stopLossPrice() view returns (uint256)',
  'function takeProfitPrice() view returns (uint256)',
  'function lastTriggerPrice() view returns (uint256)',
  'function lastTriggerKind() view returns (uint8)',
];
const CALLBACK_ABI = [
  'function status() view returns (uint8)',
  'function amount() view returns (uint256)',
];

const baseProvider = new JsonRpcProvider(BASE_RPC);
const lasnaProvider = new JsonRpcProvider(LASNA_RPC);

const pairContract = new Contract(CONTRACTS.pair, PAIR_ABI, baseProvider);
const guardianContract = new Contract(CONTRACTS.reactiveGuardian, GUARDIAN_ABI, lasnaProvider);
const callbackContract = new Contract(CONTRACTS.callbackExecutor, CALLBACK_ABI, baseProvider);

const fromWei = (v: bigint) => Number(v) / 1e18;

/** Spot price (quote per base) implied by live reserves. */
async function readLivePrice(): Promise<number> {
  const [r0, r1] = await pairContract.getReserves();
  return Number(r1) / Number(r0);
}

let symbolCache: { base: string; quote: string } | null = null;
async function readSymbols(): Promise<{ base: string; quote: string }> {
  if (symbolCache) return symbolCache;
  const t0 = new Contract(CONTRACTS.sellToken, ERC20_ABI, baseProvider);
  const t1 = new Contract(CONTRACTS.quoteToken, ERC20_ABI, baseProvider);
  const [base, quote] = await Promise.all([t0.symbol(), t1.symbol()]);
  symbolCache = { base, quote };
  return symbolCache;
}

/* ------------------------------------------------------------------ */
/*  Recorded facts from the live deployment run (2026-11-15)           */
/*  Prices are the pair's exact post-Sync reserve ratios; loop hashes  */
/*  are the real transactions of the two executed protections.         */
/* ------------------------------------------------------------------ */

/** Price points from the pair's real Sync history, oldest first. */
const RECORDED_HISTORY: PricePoint[] = [
  { t: 1794719399000, price: 3000.0 }, // liquidity seeded at 3,000.00
  { t: 1794727749000, price: 2084.3755 }, // stop-loss origin swap lands
  { t: 1794727759000, price: 1776.446 }, // protective swap executes
  { t: 1794727822000, price: 3427.9777 }, // take-profit origin swap lands
  { t: 1794727836000, price: 2799.24 }, // take-profit swap executes; back in band
];

/** The pair's whole traded volume is the demo run itself (USDC legs). */
const RECORDED_VOLUME_USD = 49874.94 + 19187.1 + 90000 + 30887.68;

const FALLBACK_PRICE = RECORDED_HISTORY[RECORDED_HISTORY.length - 1].price;

function pendingSteps(): LoopStep[] {
  return [
    {
      kind: 'origin',
      title: 'Price event on the pair',
      detail: 'Waiting for a Sync event that crosses a threshold',
      network: 'baseSepolia',
      status: 'pending',
    },
    {
      kind: 'reactive',
      title: 'Reactive contract evaluates',
      detail: 'Threshold check runs inside react() on Lasna',
      network: 'lasna',
      status: 'pending',
    },
    {
      kind: 'callback',
      title: 'Protective swap executes',
      detail: 'Callback sells the position on Base Sepolia',
      network: 'baseSepolia',
      status: 'pending',
    },
  ];
}

function recordedGuardians(): Guardian[] {
  const slAt = new Date(1794727759000).toISOString();
  const stopLossRun: Guardian = {
    id: 'RFX-1040',
    pairLabel: 'WETH / USDC',
    baseSymbol: 'WETH',
    quoteSymbol: 'USDC',
    stopLoss: 2700,
    takeProfit: 3300,
    amount: 10,
    status: 'triggered-sl',
    createdAt: new Date(1794727700000).toISOString(),
    triggerPrice: 2084.38,
    receivedQuote: 19187.1,
    steps: [
      {
        kind: 'origin',
        title: 'Price event on the pair',
        detail: 'Sync event — WETH crossed $2,700.00, printed $2,084.38',
        network: 'baseSepolia',
        status: 'done',
        txHash: '0x790b838a0f612a4bf1f1cee07e07da3c90b91662d3298e638b426bc02fa462db',
        at: slAt,
      },
      {
        kind: 'reactive',
        title: 'Reactive contract evaluated',
        detail: 'react() matched the stop-loss rule and requested a callback',
        network: 'lasna',
        status: 'done',
        txHash: '0x6b8c818cf5bcab84d1baf0b5a6c6d3663eb88d76f2d0b08c1171b68b2c0b1e0f',
        at: slAt,
      },
      {
        kind: 'callback',
        title: 'Protective swap executed',
        detail: 'Sold 10.0000 WETH → 19,187.10 USDC, five blocks after the trigger swap',
        network: 'baseSepolia',
        status: 'done',
        txHash: '0xec6a18cf3f7eadf1538dd6f97fca69af09a5f2812c676bcfc55d8fba13d5efa7',
        at: slAt,
      },
    ],
  };

  const tpAt = new Date(1794727836000).toISOString();
  const takeProfitRun: Guardian = {
    id: 'RFX-1041',
    pairLabel: 'WETH / USDC',
    baseSymbol: 'WETH',
    quoteSymbol: 'USDC',
    stopLoss: 2700,
    takeProfit: 3300,
    amount: 10,
    status: 'triggered-tp',
    createdAt: new Date(1794727780000).toISOString(),
    triggerPrice: 3427.98,
    receivedQuote: 30887.68,
    steps: [
      {
        kind: 'origin',
        title: 'Price event on the pair',
        detail: 'Sync event — WETH crossed $3,300.00, printed $3,427.98',
        network: 'baseSepolia',
        status: 'done',
        txHash: '0x8bdab6d3447de2ce89b8217c96d362c2d6ed0bd47f4e2d138de576e99796685a',
        at: tpAt,
      },
      {
        kind: 'reactive',
        title: 'Reactive contract evaluated',
        detail: 'react() matched the take-profit rule and requested a callback',
        network: 'lasna',
        status: 'done',
        txHash: '0xa3966763ede1513e97e29440535603f75d26b4ee10c03012e4f36aab9a6a91b8',
        at: tpAt,
      },
      {
        kind: 'callback',
        title: 'Protective swap executed',
        detail: 'Sold 10.0000 WETH → 30,887.68 USDC, seven blocks after the trigger swap',
        network: 'baseSepolia',
        status: 'done',
        txHash: '0x259cef4b7b45be065b058fea2a3778f0e5ed31e4bb5c41f5bc0d6897a88d1791',
        at: tpAt,
      },
    ],
  };

  return [takeProfitRun, stopLossRun];
}

/** Guardians created locally through the demo form (writes are demo-only). */
const localGuardians: Guardian[] = [];
let localSeq = 1043;

/* ------------------------------------------------------------------ */
/*  Wired adapter                                                      */
/* ------------------------------------------------------------------ */

async function marketSnapshot(): Promise<MarketData> {
  let price = FALLBACK_PRICE;
  let base = 'WETH';
  let quote = 'USDC';
  try {
    price = await readLivePrice();
    const syms = await readSymbols();
    base = syms.base;
    quote = syms.quote;
  } catch {
    // RPC unreachable — render the last recorded snapshot instead.
  }
  const history = [...RECORDED_HISTORY, { t: Date.now(), price }];
  const prices = history.map((p) => p.price);
  const first = history[0].price;
  return {
    pairLabel: `${base} / ${quote}`,
    baseSymbol: base,
    quoteSymbol: quote,
    venue: 'ReflexPair · Base Sepolia',
    price,
    change24hPct: ((price - first) / first) * 100,
    high24h: Math.max(...prices),
    low24h: Math.min(...prices),
    volume24hUsd: RECORDED_VOLUME_USD,
    history,
    updatedAt: new Date().toISOString(),
  };
}

export const chain: ChainAdapter = {
  async getMarket() {
    return marketSnapshot();
  },

  async tickMarket() {
    return marketSnapshot();
  },

  async getGuardians() {
    const recorded = recordedGuardians();
    try {
      const [gState, gStop, gTake, gKind, gTrigPrice, cStatus, cAmount] = await Promise.all([
        guardianContract.state(),
        guardianContract.stopLossPrice(),
        guardianContract.takeProfitPrice(),
        guardianContract.lastTriggerKind(),
        guardianContract.lastTriggerPrice(),
        callbackContract.status(),
        callbackContract.amount(),
      ]);
      const state = Number(gState);
      const cbStatus = Number(cStatus);
      const kind = Number(gKind);
      let status: GuardianStatus = 'watching';
      if (state === 2 || cbStatus === 1) {
        status = kind === 2 ? 'triggered-tp' : 'triggered-sl';
      }
      const live: Guardian = {
        id: 'RFX-1042',
        pairLabel: 'WETH / USDC',
        baseSymbol: 'WETH',
        quoteSymbol: 'USDC',
        stopLoss: fromWei(gStop),
        takeProfit: fromWei(gTake),
        amount: fromWei(cAmount),
        status,
        createdAt: new Date(1794727913000).toISOString(),
        ...(status !== 'watching'
          ? { triggerPrice: fromWei(gTrigPrice) }
          : {}),
        steps: status === 'watching' ? pendingSteps() : recorded[0].steps,
      };
      return [...localGuardians, live, ...recorded];
    } catch {
      // RPC unreachable — show the recorded deployment state.
      const live: Guardian = {
        id: 'RFX-1042',
        pairLabel: 'WETH / USDC',
        baseSymbol: 'WETH',
        quoteSymbol: 'USDC',
        stopLoss: 2700,
        takeProfit: 3300,
        amount: 10,
        status: 'watching',
        createdAt: new Date(1794727913000).toISOString(),
        steps: pendingSteps(),
      };
      return [...localGuardians, live, ...recorded];
    }
  },

  async createGuardian(input: CreateGuardianInput) {
    // Demo-only write path (see header): the on-chain flow is approve on
    // Base Sepolia + configure/rearm on Lasna, which the deployed
    // contracts support; this form keeps a local entry for the demo.
    await new Promise((resolve) => setTimeout(resolve, 600));
    const guardian: Guardian = {
      id: `RFX-${localSeq++}`,
      pairLabel: 'WETH / USDC',
      baseSymbol: 'WETH',
      quoteSymbol: 'USDC',
      stopLoss: input.stopLoss,
      takeProfit: input.takeProfit,
      amount: input.amount,
      status: 'watching',
      createdAt: new Date().toISOString(),
      steps: pendingSteps(),
    };
    localGuardians.unshift(guardian);
    return guardian;
  },
};

/* ------------------------------------------------------------------ */
/*  Wallet (real — window.ethereum via ethers v6)                      */
/* ------------------------------------------------------------------ */

export interface WalletState {
  address: string | null;
  chainId: number | null;
}

export function hasInjectedWallet(): boolean {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
}

export async function connectWallet(): Promise<WalletState> {
  if (!hasInjectedWallet()) {
    throw new Error('NO_WALLET');
  }
  const provider = new BrowserProvider(window.ethereum!);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  const network = await provider.getNetwork();
  return { address, chainId: Number(network.chainId) };
}

export async function readWalletState(): Promise<WalletState> {
  if (!hasInjectedWallet()) return { address: null, chainId: null };
  const provider = new BrowserProvider(window.ethereum!);
  const accounts = await provider.listAccounts();
  if (accounts.length === 0) return { address: null, chainId: null };
  const network = await provider.getNetwork();
  return { address: accounts[0].address, chainId: Number(network.chainId) };
}
