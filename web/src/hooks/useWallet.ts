import { useCallback, useEffect, useState } from 'react';
import { connectWallet, hasInjectedWallet, readWalletState } from '../lib/chain';

export type WalletStatus = 'idle' | 'connecting' | 'connected' | 'no-wallet' | 'error';

export interface Wallet {
  status: WalletStatus;
  address: string | null;
  chainId: number | null;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

/**
 * Real wallet state via window.ethereum. "Disconnect" resets the local UI
 * state — injected wallets can't be force-disconnected from the dApp side,
 * the user revokes the connection inside MetaMask itself.
 */
export function useWallet(): Wallet {
  const [status, setStatus] = useState<WalletStatus>('idle');
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Restore an already-authorized connection on load.
  useEffect(() => {
    let cancelled = false;
    readWalletState()
      .then((state) => {
        if (cancelled || !state.address) return;
        setAddress(state.address);
        setChainId(state.chainId);
        setStatus('connected');
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  // Follow account / network changes made inside the wallet.
  useEffect(() => {
    if (!hasInjectedWallet()) return;
    type Listener = (...args: never[]) => void;
    const ethereum = window.ethereum as unknown as {
      on(event: string, listener: Listener): void;
      removeListener(event: string, listener: Listener): void;
    };
    const onAccounts = (accounts: string[]) => {
      if (!accounts || accounts.length === 0) {
        setAddress(null);
        setStatus('idle');
      } else {
        setAddress(accounts[0]);
        setStatus('connected');
      }
    };
    const onChain = (hexChainId: string) => {
      setChainId(parseInt(hexChainId, 16));
    };
    ethereum.on('accountsChanged', onAccounts as Listener);
    ethereum.on('chainChanged', onChain as Listener);
    return () => {
      ethereum.removeListener('accountsChanged', onAccounts as Listener);
      ethereum.removeListener('chainChanged', onChain as Listener);
    };
  }, []);

  const connect = useCallback(async () => {
    if (!hasInjectedWallet()) {
      setStatus('no-wallet');
      setError('No wallet detected. Install MetaMask to connect on testnet.');
      return;
    }
    setStatus('connecting');
    setError(null);
    try {
      const state = await connectWallet();
      setAddress(state.address);
      setChainId(state.chainId);
      setStatus('connected');
    } catch (err) {
      const message =
        err instanceof Error && err.message.includes('rejected')
          ? 'Connection request rejected in the wallet.'
          : 'Could not connect. Check your wallet and try again.';
      setError(message);
      setStatus('error');
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setChainId(null);
    setStatus('idle');
    setError(null);
  }, []);

  return { status, address, chainId, error, connect, disconnect };
}
