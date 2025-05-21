import { useDispatch, useSelector } from 'react-redux';
import {
    addTransaction,
    clearWalletData,
    setBalances,
    setConnected,
    setError,
    setLoading,
    setPublicKey,
    TokenBalance,
    Transaction,
    updateTransactionStatus,
} from '../features/wallet/walletSlice';
import { RootState } from '../store/store';

// Define types for wallet providers
interface PhantomProvider {
  solana: {
    isPhantom?: boolean;
    connect(): Promise<{ publicKey: { toString(): string } }>;
    disconnect(): Promise<void>;
    on(event: string, callback: (args: unknown) => void): void;
    request(params: { method: string; params?: unknown }): Promise<unknown>;
  };
}

interface ExodusProvider {
  ethereum?: unknown;
  solana?: unknown;
}

interface XverseProvider {
  bitcoin?: unknown;
}

// Extend Window interface
declare global {
  interface Window {
    phantom?: PhantomProvider;
    exodus?: ExodusProvider;
    xverse?: XverseProvider;
  }
}

// Check if a wallet provider is available
const isWalletAvailable = (providerName: string): boolean => {
  try {
    switch (providerName) {
      case 'phantom':
        return !!window.phantom?.solana;
      case 'exodus':
        return !!window.exodus;
      case 'xverse':
        return !!window.xverse;
      default:
        return false;
    }
  } catch (error) {
    console.warn(`Error checking ${providerName} wallet availability:`, error);
    return false;
  }
};

export const useWallet = () => {
  const dispatch = useDispatch();
  const wallet = useSelector((state: RootState) => state.wallet);

  // Check if any wallet is available
  const checkWalletAvailability = () => {
    const availableWallets = {
      phantom: isWalletAvailable('phantom'),
      exodus: isWalletAvailable('exodus'),
      xverse: isWalletAvailable('xverse'),
    };
    return availableWallets;
  };

  return {
    // State
    connected: wallet.connected,
    publicKey: wallet.publicKeys.solana,
    solBalance: wallet.balances.solana.find((b: TokenBalance) => b.symbol === 'SOL')?.amount || '0',
    tokenBalance: wallet.balances.solana.find((b: TokenBalance) => b.symbol === 'USDC')?.amount || '0',
    recentTransactions: wallet.recentTransactions,
    loading: wallet.loading,
    error: wallet.error,

    // Actions
    setConnected: (connected: boolean) => dispatch(setConnected(connected)),
    setPublicKey: (publicKey: string | null) => dispatch(setPublicKey({ chain: 'solana', publicKey })),
    setSolBalance: (balance: number) => dispatch(setBalances({ 
      chain: 'solana', 
      balances: [{ symbol: 'SOL', amount: balance.toString(), decimals: 9 }] 
    })),
    setTokenBalance: (balance: number) => dispatch(setBalances({ 
      chain: 'solana', 
      balances: [{ symbol: 'USDC', amount: balance.toString(), decimals: 6 }] 
    })),
    setLoading: (loading: boolean) => dispatch(setLoading(loading)),
    setError: (error: string | null) => dispatch(setError(error)),
    addTransaction: (transaction: Transaction) => dispatch(addTransaction(transaction)),
    updateTransactionStatus: (id: string, status: 'pending' | 'confirmed' | 'failed') =>
      dispatch(updateTransactionStatus({ id, status })),
    clearWalletData: () => dispatch(clearWalletData()),
    
    // New function to check wallet availability
    checkWalletAvailability,
  };
}; 