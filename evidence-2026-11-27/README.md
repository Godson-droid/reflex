# Reflex evidence pack, 2026-11-27 run

Machine readable evidence for the Reflex evidence extension run of 27 Nov 2026
(Reactive Omni Buildathon, Every Second Counts track). Full narrative report:
`~/workspace/reactive-omni/LOOP_RUN_2026-11-27.md`.

## Contents

- `evidence-pack.json` — one row per executed loop (1,000 rows: batches
  ORIGINAL 1–64, SEQUENTIAL-2026-11-27 65–300, CHAOS 301–332, and
  SEQUENTIAL-2026-11-27-PART2 333–1000, the push to 1,000 loops) plus 11 FLEET
  rows from the concurrent positions event. Each row carries the batch label,
  type, trigger (origin) transaction, Reactive (Lasna) trigger transaction,
  callback transaction, block numbers, latency in Base blocks, WETH sold and
  USDC sold.
- `verify-pack.py` — standalone verifier. Recomputes the headline totals from
  chain receipts (Base Sepolia + Reactive Lasna) and checks every row:
  trigger receipt and pair Sync, guardian Triggered event naming the trigger
  swap as origin, callback Executed event selling exactly 10 WETH for the
  recorded USDC amount, and the recorded block latency. Run it with
  `python3 verify-pack.py` from this directory; exit code 0 means every row
  verified. Verified end to end on 2026-11-27 after the part 2 extension:
  1,000/1,000 loops and 11/11 fleet positions, combined 10,110 WETH sold for
  27,387,785.30 USDC. (The part 1 freeze verified 332/332 loops and 11/11
  fleet positions, combined 3,430 WETH for 9,018,201.65 USDC.)
- `abort-proofs.json` — both on chain recovery abort proof attempts
  (original, 2026-11-16, and the retry, 2026-11-27) with full transaction
  evidence. Neither attempt beat the callback; the abort path remains covered
  by the unit test `test_executeGuard_abortsWhenPriceBackInsideBand`.
- `chaos-noise.jsonl` — every noise swap made during the CHAOS batch, one
  JSON line per swap, tagged pre/mid per loop.
- `fleet-raw.json` — the raw fleet run record: deployed guardian/callback
  addresses and deployment transactions for all 11 positions, the shared
  event swap, and each position's trigger, callback and sale receipts.

## Contracts

Submitted deployment (unchanged): ReflexPair
`0x1bC9aB7D74f12897A44717B9497478e2b01CE2D6`, ReflexGuardian
`0x057A04Ad09c9A1fD83088F9863E81b181f8a4D9A`, ReflexCallback
`0x7858F9f40dBdB2Edfd32c781a98c69294cd009d0`. The 11 fleet guardian/callback
pairs are additional instances deployed from the identical compiled
artifacts: fleet guardians are byte identical to the submitted guardian;
fleet callbacks differ from the submitted callback only in the three
20-byte immutable slots holding their own guardian's address.

## Notes

- Two loop records (309 and 322) carry `recoveredRecord: true`: the
  executions are genuine and receipt verified, but the driver process had
  exited before recording them, so they were reconstructed from chain
  receipts. Each carries a full explanatory note in the pack.
- One further attempt (after loop 172) never executed: its callback
  delivery reverted because the owner's WETH allowance to the callback had
  reached exactly zero. It is not in the pack and is documented in the run
  report and in `run-2026-11-27/incident-loop173.json`.
- The public pool batch was checked on chain and stopped: Base Sepolia has
  no Uniswap V2 factory (the canonical address holds no code), and the V3
  pool interface is incompatible with the frozen V2 shaped design. See the
  run report.
