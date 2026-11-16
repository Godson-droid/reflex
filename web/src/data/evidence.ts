/**
 * evidence.ts — bundled, verified loop evidence for the Loop Ledger.
 *
 * GENERATED from evidence/evidence.json in the submission repo
 * (generated 2026-11-16T10:02:42.402Z, updated 2026-11-16T10:11:26.880Z). Do not edit
 * the numbers by hand: regenerate from the evidence pack instead.
 * Transaction hashes are kept at full length; explorer links are built
 * from them at render time.
 *
 * Why bundled? The callback contract stores only its most recent
 * execution, and Base Sepolia public RPCs cap eth_getLogs at a 200
 * block window, so the full history cannot be scanned in the browser.
 * The live chain check (lib/chain getLiveLoopState) verifies this pack
 * against the callback contract's lastExecution record at runtime.
 */

export type LoopKind = 'stop-loss' | 'take-profit';

export interface EvidenceLoop {
  n: number;
  kind: LoopKind;
  /** 1 = stop-loss, 2 = take-profit (matches the on-chain kind codes). */
  kindCode: 1 | 2;
  label?: string;
  triggerPrice: number;
  executedPrice: number;
  amountInWETH: number;
  amountOutUSDC: number;
  originTx: string;
  originBlock: number;
  reactiveTx: string;
  reactiveBlock: number;
  callbackTx: string;
  callbackBlock: number;
  /** Base blocks between the origin swap and the callback execution. */
  latencyBlocksBase: number;
}

export const EVIDENCE_META = {
  generatedAt: '2026-11-16T10:02:42.402Z',
  updatedAt: '2026-11-16T10:11:26.880Z',
  stopLoss: 2700,
  takeProfit: 3300,
  protectedAmountWETH: 10,
} as const;

export const EVIDENCE_LOOPS: EvidenceLoop[] = [
  {
    n: 1,
    kind: 'stop-loss',
    kindCode: 1,
    triggerPrice: 2084.3755,
    executedPrice: 2084.3755,
    amountInWETH: 10,
    amountOutUSDC: 19187.096,
    originTx: '0x790b838a0f612a4bf1f1cee07e07da3c90b91662d3298e638b426bc02fa462db',
    originBlock: 59029446,
    reactiveTx: '0x6b8c818cf5bcab84d1baf0b5a6c6d3663eb88d76f2d0b08c1171b68b2c0b1e0f',
    reactiveBlock: 8391301,
    callbackTx: '0xec6a18cf3f7eadf1538dd6f97fca69af09a5f2812c676bcfc55d8fba13d5efa7',
    callbackBlock: 59029451,
    latencyBlocksBase: 5,
  },
  {
    n: 2,
    kind: 'take-profit',
    kindCode: 2,
    triggerPrice: 3427.9777,
    executedPrice: 3427.9777,
    amountInWETH: 10,
    amountOutUSDC: 30887.684,
    originTx: '0x8bdab6d3447de2ce89b8217c96d362c2d6ed0bd47f4e2d138de576e99796685a',
    originBlock: 59029831,
    reactiveTx: '0xa3966763ede1513e97e29440535603f75d26b4ee10c03012e4f36aab9a6a91b8',
    reactiveBlock: 8391374,
    callbackTx: '0x259cef4b7b45be065b058fea2a3778f0e5ed31e4bb5c41f5bc0d6897a88d1791',
    callbackBlock: 59029838,
    latencyBlocksBase: 7,
  },
  {
    n: 3,
    kind: 'stop-loss',
    kindCode: 1,
    label: 'upgrade-sl-1',
    triggerPrice: 2200.0000029357398,
    executedPrice: 2200.0000029357398,
    amountInWETH: 10,
    amountOutUSDC: 20210.42583626519,
    originTx: '0xe65f87821b82cd5c19d53143c306f5f1093ed342c94ba89d7802346c59133f1d',
    originBlock: 59507658,
    reactiveTx: '0xaba9c4ad2e24471a9d71d52978f7704ec872f7049206f6bf17e1b6e3714cb4bc',
    reactiveBlock: 8481323,
    callbackTx: '0x912d1deb444ea9dbd5ad89085c6b53dab9516c543984468d4f6aedf1c7056b1c',
    callbackBlock: 59507665,
    latencyBlocksBase: 7,
  },
  {
    n: 4,
    kind: 'take-profit',
    kindCode: 2,
    label: 'upgrade-tp-1',
    triggerPrice: 3599.999999994124,
    executedPrice: 3599.999999994124,
    amountInWETH: 10,
    amountOutUSDC: 32363.3101202208,
    originTx: '0x5d0fa80118540fb3c6cf2c34002fafbce738f541a00ec5eaff5a0fadbe2e9f72',
    originBlock: 59508512,
    reactiveTx: '0x6ea119d91091842acdc1bf320cb477a5edbfdb1e2519370c21c0fb038f7ea13a',
    reactiveBlock: 8481485,
    callbackTx: '0x6d1cfd0021d2f971d1cda00b9ac3c3b88dd42904d2c2c619e9881ece71966bec',
    callbackBlock: 59508519,
    latencyBlocksBase: 7,
  },
  {
    n: 5,
    kind: 'stop-loss',
    kindCode: 1,
    label: 'upgrade-sl-abort-attempt',
    triggerPrice: 2299.9999979168433,
    executedPrice: 2299.9999979168433,
    amountInWETH: 10,
    amountOutUSDC: 21093.280842669516,
    originTx: '0x2c0ef49ebcffb04ad261386f54ae5155c732ae4abf98dd4dce51ca444c7b04de',
    originBlock: 59508639,
    reactiveTx: '0x89f4b7a68c0f953d70a2f11f93d6d6b524f74a7bab33f4e18c62437cab517203',
    reactiveBlock: 8481509,
    callbackTx: '0xa2abe34033b4a9625f869748cad6d6566c9eabeddef203c931b9e813bcf7d558',
    callbackBlock: 59508645,
    latencyBlocksBase: 6,
  },
  {
    n: 6,
    kind: 'take-profit',
    kindCode: 2,
    label: 'upgrade-tp-2',
    triggerPrice: 3650.0000000073655,
    executedPrice: 3650.0000000073655,
    amountInWETH: 10,
    amountOutUSDC: 32793.316799434746,
    originTx: '0xc2a7862773203651adaf0d72a7d9890388efbad8a5be7f7c51bd4ffc0f6d1a45',
    originBlock: 59508869,
    reactiveTx: '0x34835255585ef4059d5a1ba0abe3574571d964896e3e7eab54919eb6e4cf57af',
    reactiveBlock: 8481552,
    callbackTx: '0x623ad760a2b72b8a9468ad2d3d8fbb3f53f5fb1d1b1ac46069d36696cf1b6d97',
    callbackBlock: 59508875,
    latencyBlocksBase: 6,
  },
  {
    n: 7,
    kind: 'stop-loss',
    kindCode: 1,
    label: 'upgrade-sl-2',
    triggerPrice: 2349.999999023958,
    executedPrice: 2349.999999023958,
    amountInWETH: 10,
    amountOutUSDC: 21534.683270062065,
    originTx: '0xee295a9c623f8d3cba86c14682f9eaf23eb949b8b2373bb20352ee464c21e967',
    originBlock: 59508999,
    reactiveTx: '0xb2e362a8f15ac5cb6510d45da24cdc93ed2c3e5eed4e10e2e8f155900d79a77c',
    reactiveBlock: 8481577,
    callbackTx: '0x57d352e0358c2c12c7abb61e793b1d708e48cce66dcbea67575eae5f365482d5',
    callbackBlock: 59509007,
    latencyBlocksBase: 8,
  },
  {
    n: 8,
    kind: 'take-profit',
    kindCode: 2,
    label: 'upgrade-tp-3',
    triggerPrice: 3549.9999999936517,
    executedPrice: 3549.9999999936517,
    amountInWETH: 10,
    amountOutUSDC: 31940.954359241863,
    originTx: '0xe0aa93a0443da4fd54f634f2b9a5526e4215fc439a1ebb61a73086e616cd1f55',
    originBlock: 59509131,
    reactiveTx: '0x42afbb8d9843e6d7d0cf83968e77a3142144834a5eaba5394876aad1a6e63eb2',
    reactiveBlock: 8481602,
    callbackTx: '0xde842c8851719012d830c1df57eaf93a9fe56d5a2d408da2e8c829b81ac594e2',
    callbackBlock: 59509140,
    latencyBlocksBase: 9,
  },
  {
    n: 9,
    kind: 'stop-loss',
    kindCode: 1,
    label: 'upgrade-sl-crash-37pct',
    triggerPrice: 1819.9999991099498,
    executedPrice: 1819.9999991099498,
    amountInWETH: 10,
    amountOutUSDC: 16842.471886423078,
    originTx: '0x51bab7be76b78f7be6b9caac0dc7d56b494305b8d4697d43344ebee0fc0cca11',
    originBlock: 59509276,
    reactiveTx: '0x77b2ed7d44beafe0105dab60170fefb7b6edf295ff24ac3a16b8296b38179e09',
    reactiveBlock: 8481629,
    callbackTx: '0x3a5bc06b692fa913c1b8dbe12f10053a022ca5d9550e6b3d3d5930476f97780a',
    callbackBlock: 59509284,
    latencyBlocksBase: 8,
  },
  {
    n: 10,
    kind: 'take-profit',
    kindCode: 2,
    label: 'upgrade-tp-4',
    triggerPrice: 3499.9999999945817,
    executedPrice: 3499.9999999945817,
    amountInWETH: 10,
    amountOutUSDC: 31516.048102912755,
    originTx: '0xc2195d8805af7c3cb1d771d77803c7d3ae849863e79839281aa927bf811c4743',
    originBlock: 59509387,
    reactiveTx: '0xf7832fa2ac9e70711c8b4a86f73a93c0248b7a9aeb3fa08675d28e4debb04518',
    reactiveBlock: 8481650,
    callbackTx: '0x326f19d127a1280dfd0ab5ca77e41665663070cc7bda85e9728e709ba851ead9',
    callbackBlock: 59509395,
    latencyBlocksBase: 8,
  },
  {
    n: 11,
    kind: 'stop-loss',
    kindCode: 1,
    label: 'upgrade-sl-3',
    triggerPrice: 2400.0000034098703,
    executedPrice: 2400.0000034098703,
    amountInWETH: 10,
    amountOutUSDC: 21977.348339975677,
    originTx: '0x7de5acd81f0887ff4762f2d989a8ee58c27c92223111a352b39cb406e1ea6c5e',
    originBlock: 59509518,
    reactiveTx: '0x25d8e75aeac832b78ee7aa355a39a56094726c32ceceaf015a4e669d377c9ce2',
    reactiveBlock: 8481675,
    callbackTx: '0x301f70877c6f556881b6fb8c84556dd0a11dd6236c23acf981d6af9f9bfbaa0e',
    callbackBlock: 59509528,
    latencyBlocksBase: 10,
  },
  {
    n: 12,
    kind: 'take-profit',
    kindCode: 2,
    label: 'upgrade-tp-5',
    triggerPrice: 3599.99999999648,
    executedPrice: 3599.99999999648,
    amountInWETH: 10,
    amountOutUSDC: 32374.481279475556,
    originTx: '0x190e7478d0af18119b0056f67e13cd7c2954c4be2f74f196a6225270730f60ee',
    originBlock: 59509658,
    reactiveTx: '0x8e264dc9f0458a330df880583bd721d9e023b85c4fc2bf25ba198049171fe0e3',
    reactiveBlock: 8481701,
    callbackTx: '0x117acb12f307196796e73d0eda0c002553cff61a66337ea77ac569e3e62f6cc3',
    callbackBlock: 59509667,
    latencyBlocksBase: 9,
  },
  {
    n: 13,
    kind: 'stop-loss',
    kindCode: 1,
    label: 'upgrade-sl-4',
    triggerPrice: 2250.0000068604786,
    executedPrice: 2250.0000068604786,
    amountInWETH: 10,
    amountOutUSDC: 20658.596966283105,
    originTx: '0xdc76c55774f8bab71523524311b2305b2828db06c957a023d3972469bda3d01b',
    originBlock: 59509774,
    reactiveTx: '0x3048d2dd3458e2dd5292ac4063e2ff7a73102224e1dcf32c2a359c05bd68a1ec',
    reactiveBlock: 8481723,
    callbackTx: '0x48a027466e0aa9b0317f51ab71b16c9dd1b38bd98a3647cd19f3e3d1236d7a69',
    callbackBlock: 59509782,
    latencyBlocksBase: 8,
  },
  {
    n: 14,
    kind: 'take-profit',
    kindCode: 2,
    label: 'upgrade-tp-6',
    triggerPrice: 3499.9999999989327,
    executedPrice: 3499.9999999989327,
    amountInWETH: 10,
    amountOutUSDC: 31520.969576596486,
    originTx: '0xb997a57ad02ed7665cf72b5fbe60069917293eee9bdb6aae83910ffd3110dd21',
    originBlock: 59509890,
    reactiveTx: '0xac8fc9e9958326c2c79f3a04d7087cb6a5e1f1f6da3ae9d9987942e318226564',
    reactiveBlock: 8481745,
    callbackTx: '0x72c27dde91197f9e6456f30fc6d739d7512bdfe560f85db8f8af9be6847f92ef',
    callbackBlock: 59509898,
    latencyBlocksBase: 8,
  },
  {
    n: 15,
    kind: 'stop-loss',
    kindCode: 1,
    label: 'upgrade-sl-5',
    triggerPrice: 2449.999998913319,
    executedPrice: 2449.999998913319,
    amountInWETH: 10,
    amountOutUSDC: 22419.220969725462,
    originTx: '0xbb9715c51bede378e8b104ccd9561bbff2c53bee85fe856d0e84116e7e49f528',
    originBlock: 59510013,
    reactiveTx: '0xe282f9c189db2d65cdc2790b245a12eb0aac09227d95d3a3b6ed4f1994cb4d42',
    reactiveBlock: 8481768,
    callbackTx: '0xe3530e63fdfa352ec00adb747e91fc808f585d6f3849d15ef9d5018d84fdf4d3',
    callbackBlock: 59510021,
    latencyBlocksBase: 8,
  },
];

/** In-band negative proof: a move inside the band that was priced and ignored. */
export const NEGATIVE_PROOF = {
  targetPrice: 2859.0884823800625,
  priceBefore: 2799.0884823800625,
  priceAfterSwap: 2859.0884823771007,
  originTx: '0x58076b553f7e579bd8c8465ecc7ef78dbe4c140d88127d6599450d701359ca20',
  triggeredLogsInWindow: 0,
  verdict: 'PASS: guardian priced the in band Sync (lastPrice updated) and did not fire; no Triggered event, no callback',
} as const;

/** Recovery abort attempt against loop 5 (documented, did not beat the callback). */
export const ABORT_PROOF = {
  attempted: true,
  succeeded: false,
  loopN: 5,
} as const;

