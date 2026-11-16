import { useEffect, useState } from 'react';
import { chain, type LiveLoopState } from '../lib/chain';
import { EVIDENCE_LOOPS } from '../data/evidence';

export type LiveCheckStatus = 'loading' | 'verified' | 'syncing' | 'error';

export interface LiveLoop {
  /** Latest chain snapshot, or null until the first read lands. */
  state: LiveLoopState | null;
  /**
   * How the bundled evidence pack stands against the chain right now:
   * - verified: the callback's lastExecution on chain matches the newest
   *   bundled row (kind, executed price and amount out), so the ledger
   *   below is exactly what the chain last did.
   * - syncing: the chain's last execution differs from the bundled pack —
   *   newer executions have landed and are settling into the evidence.
   * - error: the live read failed; bundled rows are shown unverified.
   * - loading: first read still in flight.
   */
  check: LiveCheckStatus;
  /** Executed loops in the bundled verified pack. */
  evidenceCount: number;
}

/**
 * Tolerances for matching the on-chain record (integer 1e18 fixed point)
 * against the evidence pack (floats derived from reserve ratios). The
 * live deployment matched to ~1e-11 on amount out at verification time;
 * these bounds absorb float noise without ever bridging two real loops,
 * whose prices and amounts differ by far more.
 */
const PRICE_TOLERANCE = 0.01;
const AMOUNT_TOLERANCE = 0.01;

export function liveMatchesEvidence(state: LiveLoopState): boolean {
  const last = EVIDENCE_LOOPS[EVIDENCE_LOOPS.length - 1];
  if (!last) return false;
  const exec = state.lastExecution;
  if (exec.timestamp === 0) return false;
  return (
    exec.kind === last.kindCode &&
    Math.abs(exec.executedPrice - last.executedPrice) <= PRICE_TOLERANCE &&
    Math.abs(exec.amountOut - last.amountOutUSDC) <= AMOUNT_TOLERANCE &&
    Math.abs(exec.amountIn - last.amountInWETH) <= AMOUNT_TOLERANCE
  );
}

/**
 * Polls the live loop state (guardian + callback + pair price) and keeps
 * the evidence verification verdict current. Polls every 20 seconds;
 * the market card keeps its own faster 5 second price tick.
 */
export function useLiveLoop(pollMs = 20_000): LiveLoop {
  const [state, setState] = useState<LiveLoopState | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const read = () => {
      chain
        .getLiveLoopState()
        .then((next) => {
          if (cancelled) return;
          setState(next);
          setFailed(false);
        })
        .catch(() => {
          if (!cancelled) setFailed(true);
        });
    };
    read();
    const id = window.setInterval(read, pollMs);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [pollMs]);

  const check: LiveCheckStatus = state
    ? liveMatchesEvidence(state)
      ? 'verified'
      : 'syncing'
    : failed
      ? 'error'
      : 'loading';

  return { state, check, evidenceCount: EVIDENCE_LOOPS.length };
}
