import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { AppDispatch } from '../../app/store';
import { setBalances, setConnected, setError, setPublicKey } from './walletSlice';

// TODO: Add error handling and retry logic
export const connectWallet = async (dispatch: AppDispatch) => {
  try {
    if (!window.solana) {
      throw new Error('Solana wallet not found!');
    }

    const response = await window.solana.connect();
    const publicKey = response.publicKey.toString();
    
    dispatch(setConnected(true));
    dispatch(setPublicKey({ chain: 'solana', publicKey }));
    
    // TODO: Add balance fetching logic
    await fetchBalance(publicKey, dispatch);
    
    return publicKey;
  } catch (error) {
    dispatch(setError(error instanceof Error ? error.message : 'Failed to connect wallet'));
    throw error;
  }
};

// TODO: Add proper balance fetching with retry logic
export const fetchBalance = async (publicKey: string, dispatch: AppDispatch) => {
  try {
    const connection = new Connection('https://api.devnet.solana.com');
    const balance = await connection.getBalance(new PublicKey(publicKey));
    dispatch(setBalances({ 
      chain: 'solana', 
      balances: [{ symbol: 'SOL', amount: (balance / LAMPORTS_PER_SOL).toString(), decimals: 9 }] 
    }));
  } catch (error) {
    dispatch(setError(error instanceof Error ? error.message : 'Failed to fetch balance'));
  }
};

// TODO: Add proper disconnect cleanup
export const disconnectWallet = (dispatch: AppDispatch) => {
  if (window.solana) {
    window.solana.disconnect();
  }
  dispatch(setConnected(false));
  dispatch(setPublicKey({ chain: 'solana', publicKey: null }));
  dispatch(setBalances({ 
    chain: 'solana', 
    balances: [{ symbol: 'SOL', amount: '0', decimals: 9 }] 
  }));
}; 