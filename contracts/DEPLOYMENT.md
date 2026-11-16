# Reflex — testnet deployment record

Deployed and exercised end-to-end on **2026-11-15**. All contracts are verified
on Sourcify with `exact_match` (creation + runtime). Deployer / position owner:
`0xfe332e01162D5408211DAAC305254E2456e5e437` (testnet-only wallet).

## Contracts

| Contract | Chain | Address | Deploy tx | Sourcify |
|---|---|---|---|---|
| MockERC20 "WETH" (pair token0) | Base Sepolia (84532) | `0x057A04Ad09c9A1fD83088F9863E81b181f8a4D9A` | `0x407a9ee42a98d4fbcf15927b6d650cba07d81e4eb89880802a5c9c224637d672` | exact_match |
| MockERC20 "USDC" (pair token1) | Base Sepolia (84532) | `0xA37786bDdda4FA1039291A25cC9043669Fb42DFd` | `0x04e697e4863327a20c55e6783c664efec69335424b3ed84ace23adae76eeccd4` | exact_match |
| ReflexPair | Base Sepolia (84532) | `0x1bC9aB7D74f12897A44717B9497478e2b01CE2D6` | `0xe6b5616cb2d5839615f8ba489e8e0d04c2aba0b4667b4ae1bb09af3ac8068183` | exact_match |
| ReflexGuardian | Reactive Lasna (5318007) | `0x057A04Ad09c9A1fD83088F9863E81b181f8a4D9A` | `0x5f15f812c97023520e4c981feb0cf31e9d0399d8cbc90c34f0c908de7dee48cf` | exact_match |
| ReflexCallback | Base Sepolia (84532) | `0x7858F9f40dBdB2Edfd32c781a98c69294cd009d0` | `0xc92e7d7c50886af944c8db74dc71ecf9c93946caef73c54a8518d5fed4893777` | exact_match |

Note: the WETH token (Base Sepolia) and ReflexGuardian (Lasna) share an address
because both were the deployer's nonce-0 transaction on their respective chains.
They are different contracts on different networks.

Explorers: Base Sepolia — https://sepolia.basescan.org · Lasna —
https://lasna.reactscan.net

## Configuration

- Pair seeded with 100 WETH / 300,000 USDC → starting price **3,000 USDC/WETH**
  (seed mint tx `0xe4aac68652e4eae71fd05e2e430e212ad6a19b2ce2d49ad2c761db2e6c94677e`).
- Guard band: **stop-loss 2,700 · take-profit 3,300** (USDC per WETH, 1e18-scaled
  on-chain), protected amount **10 WETH**, selling pair token0 (WETH).
- Guardian funded with 5 lREACT at deployment; callback funded with 0.01 ETH.
- Wiring txs: `setCallback`
  `0xef6dc83c2b97edcf46e616f0068fb01838ddbb3b243bc82e8057b76652fda02b` ·
  `configure` `0xd98ea65a681e9353c08fb63555507378ab643d837aaff4fc034bc423bc2f4cfb` ·
  owner approval `0x2204d01868992805d1558ec93e686016416c86f4043d8e58c844a61093bcb16d`.

## Funding path (how the wallet got there)

- Ethereum Sepolia: 0.1525 ETH from the pk910 PoW faucet (claim tx
  `0x365007551318da301983b29c3424f830aa742231af19c56b968956e88ccbd23e`).
- lREACT: sent 0.1 SepETH to the Ethereum Sepolia Reactive faucet
  `0x9b9BB25f1A81078C544C829c5EB7822d747Cf434` calling `request(wallet)` —
  tx `0xcb75a684254d5e52d0750c82f45f37fa11f3e38256d83e14cebb372b543d88cc` →
  **10.5 lREACT** credited on Lasna.
- Base Sepolia ETH: bridged 0.03 ETH from Ethereum Sepolia via the canonical
  L1StandardBridge `0xfd0Bf71F60660E2f608ed56e1659C450eB113120` (address per
  docs.base.org) — deposit tx
  `0x3cd2d4adf1b06ada5ba05e613aa166f5a10e5e4476c6283b0a1a31e9ff6a6108`, relayed
  to Base Sepolia in ~5.5 minutes.

## The loop, run twice (Execution evidence)

### Run 1 — stop-loss

| Step | Chain | Tx |
|---|---|---|
| Origin swap (20 WETH sold into the pair; Sync prints 2,084.38) | Base Sepolia, block 59029446 | `0x790b838a0f612a4bf1f1cee07e07da3c90b91662d3298e638b426bc02fa462db` |
| Reactive transaction (guardian `react()` → `Triggered(kind=1, price=2084.3755)`, originTxHash matches the swap above) | Lasna, block 8391301 | `0x6b8c818cf5bcab84d1baf0b5a6c6d3663eb88d76f2d0b08c1171b68b2c0b1e0f` |
| Callback execution (protective swap settles) | Base Sepolia, block 59029451 | `0xec6a18cf3f7eadf1538dd6f97fca69af09a5f2812c676bcfc55d8fba13d5efa7` |

On-chain `Execution` record after run 1: kind = 1 (stop-loss), observed price =
executed price = 2,084.3755 USDC/WETH, amountIn = 10 WETH, **amountOut =
19,187.096 USDC** paid to the owner. Owner WETH 900 → 870 (20 in the trigger
swap, 10 sold by the guardian); USDC 700,000 → 769,062.03.

### Run 2 — take-profit (after re-arming both contracts)

Re-arm txs: callback `0xd16cd183aae6fe00381c5c7c1e0c7080f50a67bc33f31b8ab3078d051057d2d1` ·
guardian `0x213ccca77fa0b17cf2ba44315e8cd217285877764bb36cea00d14efd7d01d6b2`.

| Step | Chain | Tx |
|---|---|---|
| Origin swap (90,000 USDC buys WETH; Sync prints 3,427.98) | Base Sepolia, block 59029831 | `0x8bdab6d3447de2ce89b8217c96d362c2d6ed0bd47f4e2d138de576e99796685a` |
| Reactive transaction (`Triggered(kind=2, price=3427.9777)`) | Lasna, block 8391374 | `0xa3966763ede1513e97e29440535603f75d26b4ee10c03012e4f36aab9a6a91b8` |
| Callback execution | Base Sepolia, block 59029838 | `0x259cef4b7b45be065b058fea2a3778f0e5ed31e4bb5c41f5bc0d6897a88d1791` |

On-chain `Execution` record after run 2: kind = 2 (take-profit), observed =
executed = 3,427.9777, amountIn = 10 WETH, **amountOut = 30,887.684 USDC**.

After run 2 both contracts were re-armed again (callback
`0x769ef509bc4f18f7f9196a9fc0bfed16d9b5c72ccfb153e22adc1ef68d8980b0`, guardian
`0xf8bd3f4011f664b50c20d2494e437b89828d467502f2294188e36a8e8eb00fe9`), so the
live deployment is back in **Watching** state: guardian `state = Armed`,
callback `status = Armed`, price 2,799.24 — inside the band.

## Final balances (after all runs and the final re-arm)

| Chain | Wallet | Contracts |
|---|---|---|
| Ethereum Sepolia | 0.0225 ETH | — |
| Base Sepolia | 0.019979 ETH · 896.377 WETH · 709,949.72 USDC | Callback holds 0.0099966 ETH (two callback deliveries billed ≈ 0.0000034 ETH total) |
| Reactive Lasna | 5.386120 lREACT | Guardian holds 4.942013 lREACT (two reactive transactions cost ≈ 0.058 lREACT) |

Pair reserves at record time: 103.623 WETH / 290,050.28 USDC (price 2,799.24).

## UI

`../stopguard-ui` is wired to this deployment: `CONTRACTS` in
`src/lib/chain.ts` carries the addresses above, price and guardian state are
read live from the pair/guardian/callback contracts, and the two runs above
are presented as recorded guardians with their real loop hashes.
Screenshots: `../stopguard-ui/docs/screenshots/wired-live.png` and
`wired-full.png`.

## Upgrade runs — Ripcord-beater batch 1 (2026-11-16)

Thirteen further loops (loops 3 to 15) were executed against the same
deployment, alternating stop-loss and take-profit, each re-armed afterwards.
Totals across all 15 loops: 8 stop-loss, 7 take-profit, 387,319.89 USDC of
protective sales, latencies 5 to 10 Base blocks, and every loop reconciled
exactly against owner balances (loop 5 reconciles once its interleaved
recovery swap is counted; see the evidence pack). Full machine-readable
evidence: `evidence/evidence.json` in the submission repo, with one receipt
file per loop.

| # | Kind | Trigger price | Amount out (USDC) | Latency (blocks) | Origin tx | Reactive tx | Callback tx |
|---|---|---|---|---|---|---|---|
| 3 | stop-loss | 2,200.00 | 20,210.43 | 7 | 0xe65f87821b82cd5c19d53143c306f5f1093ed342c94ba89d7802346c59133f1d | 0xaba9c4ad2e24471a9d71d52978f7704ec872f7049206f6bf17e1b6e3714cb4bc | 0x912d1deb444ea9dbd5ad89085c6b53dab9516c543984468d4f6aedf1c7056b1c |
| 4 | take-profit | 3,600.00 | 32,363.31 | 7 | 0x5d0fa80118540fb3c6cf2c34002fafbce738f541a00ec5eaff5a0fadbe2e9f72 | 0x6ea119d91091842acdc1bf320cb477a5edbfdb1e2519370c21c0fb038f7ea13a | 0x6d1cfd0021d2f971d1cda00b9ac3c3b88dd42904d2c2c619e9881ece71966bec |
| 5 | stop-loss | 2,300.00 | 21,093.28 | 6 | 0x2c0ef49ebcffb04ad261386f54ae5155c732ae4abf98dd4dce51ca444c7b04de | 0x89f4b7a68c0f953d70a2f11f93d6d6b524f74a7bab33f4e18c62437cab517203 | 0xa2abe34033b4a9625f869748cad6d6566c9eabeddef203c931b9e813bcf7d558 |
| 6 | take-profit | 3,650.00 | 32,793.32 | 6 | 0xc2a7862773203651adaf0d72a7d9890388efbad8a5be7f7c51bd4ffc0f6d1a45 | 0x34835255585ef4059d5a1ba0abe3574571d964896e3e7eab54919eb6e4cf57af | 0x623ad760a2b72b8a9468ad2d3d8fbb3f53f5fb1d1b1ac46069d36696cf1b6d97 |
| 7 | stop-loss | 2,350.00 | 21,534.68 | 8 | 0xee295a9c623f8d3cba86c14682f9eaf23eb949b8b2373bb20352ee464c21e967 | 0xb2e362a8f15ac5cb6510d45da24cdc93ed2c3e5eed4e10e2e8f155900d79a77c | 0x57d352e0358c2c12c7abb61e793b1d708e48cce66dcbea67575eae5f365482d5 |
| 8 | take-profit | 3,550.00 | 31,940.95 | 9 | 0xe0aa93a0443da4fd54f634f2b9a5526e4215fc439a1ebb61a73086e616cd1f55 | 0x42afbb8d9843e6d7d0cf83968e77a3142144834a5eaba5394876aad1a6e63eb2 | 0xde842c8851719012d830c1df57eaf93a9fe56d5a2d408da2e8c829b81ac594e2 |
| 9 | stop-loss | 1,820.00 | 16,842.47 | 8 | 0x51bab7be76b78f7be6b9caac0dc7d56b494305b8d4697d43344ebee0fc0cca11 | 0x77b2ed7d44beafe0105dab60170fefb7b6edf295ff24ac3a16b8296b38179e09 | 0x3a5bc06b692fa913c1b8dbe12f10053a022ca5d9550e6b3d3d5930476f97780a |
| 10 | take-profit | 3,500.00 | 31,516.05 | 8 | 0xc2195d8805af7c3cb1d771d77803c7d3ae849863e79839281aa927bf811c4743 | 0xf7832fa2ac9e70711c8b4a86f73a93c0248b7a9aeb3fa08675d28e4debb04518 | 0x326f19d127a1280dfd0ab5ca77e41665663070cc7bda85e9728e709ba851ead9 |
| 11 | stop-loss | 2,400.00 | 21,977.35 | 10 | 0x7de5acd81f0887ff4762f2d989a8ee58c27c92223111a352b39cb406e1ea6c5e | 0x25d8e75aeac832b78ee7aa355a39a56094726c32ceceaf015a4e669d377c9ce2 | 0x301f70877c6f556881b6fb8c84556dd0a11dd6236c23acf981d6af9f9bfbaa0e |
| 12 | take-profit | 3,600.00 | 32,374.48 | 9 | 0x190e7478d0af18119b0056f67e13cd7c2954c4be2f74f196a6225270730f60ee | 0x8e264dc9f0458a330df880583bd721d9e023b85c4fc2bf25ba198049171fe0e3 | 0x117acb12f307196796e73d0eda0c002553cff61a66337ea77ac569e3e62f6cc3 |
| 13 | stop-loss | 2,250.00 | 20,658.60 | 8 | 0xdc76c55774f8bab71523524311b2305b2828db06c957a023d3972469bda3d01b | 0x3048d2dd3458e2dd5292ac4063e2ff7a73102224e1dcf32c2a359c05bd68a1ec | 0x48a027466e0aa9b0317f51ab71b16c9dd1b38bd98a3647cd19f3e3d1236d7a69 |
| 14 | take-profit | 3,500.00 | 31,520.97 | 8 | 0xb997a57ad02ed7665cf72b5fbe60069917293eee9bdb6aae83910ffd3110dd21 | 0xac8fc9e9958326c2c79f3a04d7087cb6a5e1f1f6da3ae9d9987942e318226564 | 0x72c27dde91197f9e6456f30fc6d739d7512bdfe560f85db8f8af9be6847f92ef |
| 15 | stop-loss | 2,450.00 | 22,419.22 | 8 | 0xbb9715c51bede378e8b104ccd9561bbff2c53bee85fe856d0e84116e7e49f528 | 0xe282f9c189db2d65cdc2790b245a12eb0aac09227d95d3a3b6ed4f1994cb4d42 | 0xe3530e63fdfa352ec00adb747e91fc808f585d6f3849d15ef9d5018d84fdf4d3 |

Highlights: loop 9 is a single-move crash, 2,890.34 to 1,820.00 (about
37 percent). An in-band negative proof was also recorded: a swap moving the
price from 2,799.09 to 2,859.09 was priced by the guardian (its lastPrice
updated on Lasna) and correctly ignored — no Triggered event, no callback,
guardian and callback stayed Armed. A recovery-abort attempt on loop 5
failed on timing and is documented honestly in the evidence pack: the
callback executed 6 blocks after the origin swap, while the detect plus
recovery path took about 57 blocks; the abort path itself is covered by
`test_executeGuard_abortsWhenPriceBackInsideBand` in the test suite.

Before the batch, the owner's WETH allowance to the callback was topped up
to 1,000 WETH (tx 0xbf7eeac1b30cd73e2f62ef58a820b67a5555f1ba84791aa5936973b49213134a).
Lasna sends in this batch used legacy gas pricing (guardian re-arm), because
the Lasna RPC reports a zero priority fee that its nodes reject.

After loop 15 the deployment is re-armed and Watching at 2,063.37, reserves
121.35 WETH / 250,399.40 USDC; owner 878.65 WETH / 749,600.60 USDC /
0.01997 Base Sepolia ETH / 5.3436 lREACT; guardian holds 4.5747 lREACT;
callback holds 0.009979 ETH.

## Upgrade runs — batches 2 to 4 (2026-11-16)

Loops 16 to 61 were executed in three further batches (batch 2: loops 17 to
30 plus loop 16 fired with the published one command runner; batch 3: loops
31 to 45; batch 4: loops 46 to 61), alternating stop-loss and take-profit
with the same reconciliation discipline. Final totals across all 61 loops:
31 stop-loss, 30 take-profit. Guardian lREACT went from 4.5747 after batch 1
to 3.3590 after loop 61 (about 0.027 lREACT per reactive transaction, no
top-up needed). After loop 61 the deployment is re-armed and Watching at
2,030.82, reserves 124.64 WETH / 253,113.78 USDC; owner 875.36 WETH /
746,886.22 USDC / 0.01994 Base Sepolia ETH / 5.1937 lREACT; callback holds
0.009918 ETH. Full per-loop evidence is in the submission repo evidence
pack, which is regenerated from the same evidence.json after every batch.
