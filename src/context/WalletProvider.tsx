import React, { createContext, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAdapter } from '../adapters';
import {
  setBalances,
  setConnected,
  setPublicKey,
  setUnlocked
} from '../features/wallet/walletSlice';
import { RootState } from '../store/store';
import { BlockchainAdapter } from '../types/blockchain-adapter';
import { decryptWallet } from '../wallet/wallet';

interface WalletContextType {
  adapters: Record<string, BlockchainAdapter>;
  unlockWallet: (password: string) => Promise<void>;
  isUnlocked: boolean;
  // TODO: Add methods for sending transactions
  // TODO: Add methods for signing transactions
  // TODO: Add methods for refreshing balances
}

const WalletContext = createContext<WalletContextType>({
  adapters: {},
  unlockWallet: async () => {},
  isUnlocked: false
});

interface WalletProviderProps {
  children: React.ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const dispatch = useDispatch();
  const isUnlocked = useSelector((state: RootState) => state.wallet.isUnlocked);
  const [adapters, setAdapters] = React.useState<Record<string, BlockchainAdapter>>({});

  const unlockWallet = async (password: string) => {
    try {
      // Decrypt the wallet keys
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const keys = await decryptWallet(password);
      
      // Initialize adapters with the decrypted keys
      // In a real implementation, we would pass the keys to the adapters
      // For now, we're just creating new adapters
      const solanaAdapter = getAdapter('solana');
      const ethereumAdapter = getAdapter('ethereum');
      
      // Set the adapters in state
      setAdapters({
        solana: solanaAdapter,
        ethereum: ethereumAdapter
      });
      
      // Update Redux state
      dispatch(setUnlocked(true));
      
      // Set public keys
      dispatch(setPublicKey({ chain: 'solana', publicKey: solanaAdapter.getPublicKey() }));
      dispatch(setPublicKey({ chain: 'ethereum', publicKey: ethereumAdapter.getPublicKey() }));
      
      // Set connected status
      dispatch(setConnected(true));
      
      // Fetch initial balances
      const solanaBalances = await solanaAdapter.getBalances(solanaAdapter.getPublicKey());
      const ethereumBalances = await ethereumAdapter.getBalances(ethereumAdapter.getPublicKey());
      
      dispatch(setBalances({ chain: 'solana', balances: solanaBalances }));
      dispatch(setBalances({ chain: 'ethereum', balances: ethereumBalances }));
      
    } catch (error) {
      console.error('Failed to unlock wallet:', error);
      throw error;
    }
  };

  // TODO: Implement method to send transactions
  // TODO: Implement method to sign transactions
  // TODO: Implement method to refresh balances

  // Update wallet connection status in Chrome storage
  useEffect(() => {
    const handleWalletConnectionChange = (connected: boolean) => {
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
        chrome.runtime.sendMessage(
          { type: 'SET_WALLET_STATUS', connected },
          () => {}
        );
      }
    };

    // Listen for wallet connection changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Check if wallet is connected when popup becomes visible
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
          chrome.runtime.sendMessage(
            { type: 'GET_WALLET_STATUS' },
            (response) => {
              if (response && typeof response.connected === 'boolean') {
                handleWalletConnectionChange(response.connected);
              }
            }
          );
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <WalletContext.Provider value={{ adapters, unlockWallet, isUnlocked }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext); 