import { useCallback, useEffect, useRef, useState } from 'react';
import {
  connectWallet,
  disconnectWallet,
  getWalletState,
  hasInjectedWallet,
  readWalletState,
  subscribeWallet,
  type WalletKind,
} from '../lib/chain';

export type { WalletKind };

export type WalletStatus = 'idle' | 'connecting' | 'connected' | 'error';

export interface Wallet {
  status: WalletStatus;
  address: string | null;
  chainId: number | null;
  /** Which path the current connection used, if any. */
  kind: WalletKind | null;
  error: string | null;
  /** True when a browser wallet (extension or in-app browser) is present. */
  hasInjected: boolean;
  connect: (kind: WalletKind) => Promise<void>;
  disconnect: () => Promise<void>;
}

/**
 * Wallet state for both connection paths. The adapter (lib/chain) owns the
 * actual state and emits changes — account switches, chain switches and
 * wallet-side disconnects included — this hook just mirrors it into React.
 * Disconnect really ends a WalletConnect session; for injected wallets it
 * resets the local UI state (the user revokes inside MetaMask itself).
 */
export function useWallet(): Wallet {
  const [status, setStatus] = useState<WalletStatus>('idle');
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [kind, setKind] = useState<WalletKind | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasInjected] = useState<boolean>(() => hasInjectedWallet());
  const connectingRef = useRef(false);

  // Mirror adapter state: restore on load + follow live changes.
  useEffect(() => {
    const apply = () => {
      const state = getWalletState();
      setAddress(state.address);
      setChainId(state.chainId);
      setKind(state.kind);
      if (state.address) {
        setStatus('connected');
      } else if (!connectingRef.current) {
        setStatus('idle');
      }
    };
    apply();
    const unsubscribe = subscribeWallet(apply);
    readWalletState()
      .then(apply)
      .catch(() => undefined);
    return unsubscribe;
  }, []);

  const connect = useCallback(async (connectKind: WalletKind) => {
    connectingRef.current = true;
    setStatus('connecting');
    setError(null);
    try {
      await connectWallet(connectKind);
      // The connected state flows back through subscribeWallet.
    } catch (err) {
      const raw = err instanceof Error ? err.message : String(err);
      const message = /reject|closed|cancel|reset/i.test(raw)
        ? 'Connection request rejected in the wallet.'
        : connectKind === 'walletconnect'
          ? 'Could not connect with WalletConnect. Check your connection and try again.'
          : 'Could not connect. Check your wallet and try again.';
      setError(message);
      setStatus('error');
    } finally {
      connectingRef.current = false;
    }
  }, []);

  const disconnect = useCallback(async () => {
    await disconnectWallet();
    // The cleared state flows back through subscribeWallet.
  }, []);

  return { status, address, chainId, kind, error, hasInjected, connect, disconnect };
}
