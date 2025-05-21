import { createSlice, PayloadAction, Store } from '@reduxjs/toolkit';
import { RootState } from '../../store/store';

export type ChainType = 'solana' | 'ethereum';

export interface TokenBalance {
  symbol: string;
  amount: string;
  decimals: number;
}

export interface Transaction {
  id: string;
  type: 'send' | 'receive';
  amount: number;
  token: string;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
  from: string;
  to: string;
  signature: string;
  chain: ChainType;
}

// Define the wallet state interface
export interface WalletState {
  connected: boolean;
  isUnlocked: boolean;
  publicKeys: Record<ChainType, string | null>;
  balances: Record<ChainType, TokenBalance[]>;
  recentTransactions: Transaction[];
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: WalletState = {
  connected: false,
  isUnlocked: false,
  publicKeys: {
    solana: null,
    ethereum: null
  },
  balances: {
    solana: [],
    ethereum: []
  },
  recentTransactions: [],
  loading: false,
  error: null,
};

// Load initial state from localStorage
const loadState = () => {
  try {
    const serializedState = localStorage.getItem('wallet');
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch {
    return undefined;
  }
};

// Save state to localStorage
const saveState = (state: WalletState) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('wallet', serializedState);
  } catch {
    // Ignore write errors
  }
};

const walletSlice = createSlice({
  name: 'wallet',
  initialState: loadState() || initialState,
  reducers: {
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.connected = action.payload;
    },
    setUnlocked: (state, action: PayloadAction<boolean>) => {
      state.isUnlocked = action.payload;
    },
    setPublicKey: (state, action: PayloadAction<{ chain: ChainType; publicKey: string | null }>) => {
      state.publicKeys[action.payload.chain] = action.payload.publicKey;
    },
    setBalances: (state, action: PayloadAction<{ chain: ChainType; balances: TokenBalance[] }>) => {
      state.balances[action.payload.chain] = action.payload.balances;
    },
    addTransaction: (state, action: PayloadAction<Transaction>) => {
      state.recentTransactions.unshift(action.payload);
      // Keep only the last 10 transactions
      if (state.recentTransactions.length > 10) {
        state.recentTransactions = state.recentTransactions.slice(0, 10);
      }
    },
    updateTransactionStatus: (state, action: PayloadAction<{ id: string; status: Transaction['status'] }>) => {
      const transaction = state.recentTransactions.find((tx: Transaction) => tx.id === action.payload.id);
      if (transaction) {
        transaction.status = action.payload.status;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearWalletData: (state) => {
      Object.assign(state, initialState);
    }
  }
});

export const {
  setConnected,
  setUnlocked,
  setPublicKey,
  setBalances,
  addTransaction,
  updateTransactionStatus,
  setLoading,
  setError,
  clearWalletData
} = walletSlice.actions;

// Selectors
export const selectWallet = (state: { wallet: WalletState }) => state.wallet;
export const selectIsConnected = (state: { wallet: WalletState }) => state.wallet.connected;
export const selectIsUnlocked = (state: { wallet: WalletState }) => state.wallet.isUnlocked;
export const selectPublicKeys = (state: { wallet: WalletState }) => state.wallet.publicKeys;
export const selectBalances = (state: { wallet: WalletState }) => state.wallet.balances;
export const selectRecentTransactions = (state: { wallet: WalletState }) => state.wallet.recentTransactions;
export const selectLoading = (state: { wallet: WalletState }) => state.wallet.loading;
export const selectError = (state: { wallet: WalletState }) => state.wallet.error;

// Helper selectors
export const selectSolBalance = (state: { wallet: WalletState }) => {
  const solBalance = state.wallet.balances.solana.find((b: TokenBalance) => b.symbol === 'SOL');
  return solBalance ? Number(solBalance.amount) / Math.pow(10, solBalance.decimals) : 0;
};

export const selectTokenBalance = (state: { wallet: WalletState }, symbol: string) => {
  const tokenBalance = state.wallet.balances.solana.find((b: TokenBalance) => b.symbol === symbol);
  return tokenBalance ? Number(tokenBalance.amount) / Math.pow(10, tokenBalance.decimals) : 0;
};

// Subscribe to store changes to save to localStorage
export const subscribeToWalletChanges = (store: Store<RootState>) => {
  let previousState = store.getState().wallet;
  
  store.subscribe(() => {
    const currentState = store.getState().wallet;
    if (currentState !== previousState) {
      saveState(currentState);
      previousState = currentState;
    }
  });
};

export default walletSlice.reducer; 