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
