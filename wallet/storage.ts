import { encryptData } from "../lib/crypto";
import { EncryptedWallet, generateUnifiedKeypairs } from "./wallet";

// Check if we're in a browser extension environment
const isExtensionEnvironment = () => {
  return typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;
};

// Type assertion for chrome.runtime.lastError
const getLastError = () => {
  return (chrome.runtime as any).lastError;
};

interface RawWalletData {
  solana?: {
    salt?: string;
    iv?: string;
    encrypted?: string;
  };
  ethereum?: {
    salt?: string;
    iv?: string;
    encrypted?: string;
  };
}

const validateEncryptedWallet = (wallet: RawWalletData): wallet is EncryptedWallet => {
  if (!wallet || typeof wallet !== 'object') return false;
  if (!wallet.solana || !wallet.ethereum) return false;
  
  const { solana, ethereum } = wallet;
  
  return !!(
    typeof solana.salt === 'string' &&
    typeof solana.iv === 'string' &&
    typeof solana.encrypted === 'string' &&
    typeof ethereum.salt === 'string' &&
    typeof ethereum.iv === 'string' &&
    typeof ethereum.encrypted === 'string'
  );
};

export const saveEncryptedWallet = async (mnemonic: string, password: string): Promise<void> => {
  try {
    // Generate keypairs from mnemonic
    const { solana, ethereum } = generateUnifiedKeypairs(mnemonic);
    
    // Encrypt both keypairs
    const solanaEncrypted = await encryptData(solana, password);
    const ethereumEncrypted = await encryptData(ethereum, password);
    
    const encryptedWallet: EncryptedWallet = {
      solana: solanaEncrypted,
      ethereum: ethereumEncrypted
    };
    
    if (isExtensionEnvironment()) {
      return new Promise((resolve, reject) => {
        chrome.storage.local.set({ wallet: encryptedWallet }, () => {
          const error = getLastError();
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });
    } else {
      // Fallback for development mode - use localStorage
      localStorage.setItem('wallet', JSON.stringify(encryptedWallet));
      return Promise.resolve();
    }
  } catch (error) {
    console.error('Failed to save wallet:', error);
    throw new Error('Failed to save wallet. Please try again.');
  }
}

/**
 * Get the encrypted wallet from storage
 * @returns A promise that resolves with the encrypted wallet or null if not found
 */
export const getEncryptedWallet = async (): Promise<EncryptedWallet | null> => {
  try {
    if (isExtensionEnvironment()) {
      return new Promise((resolve) => {
        chrome.storage.local.get(['wallet'], (result) => {
          const wallet = result.wallet;
          if (wallet && validateEncryptedWallet(wallet)) {
            resolve(wallet);
          } else {
            resolve(null);
          }
        });
      });
    } else {
      // Fallback for development mode - use localStorage
      const walletStr = localStorage.getItem('wallet');
      if (!walletStr) return null;
      
      const wallet = JSON.parse(walletStr);
      if (validateEncryptedWallet(wallet)) {
        return wallet;
      }
      return null;
    }
  } catch (error) {
    console.error('Failed to get wallet:', error);
    return null;
  }
}

export const clearWallet = async (): Promise<void> => {
  if (isExtensionEnvironment()) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.remove(['wallet'], () => {
        const error = getLastError();
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  } else {
    // Fallback for development mode - use localStorage
    localStorage.removeItem('wallet');
    return Promise.resolve();
  }
}

// TODO: Implement wallet backup functionality to allow users to export their encrypted wallet
// TODO: Add support for multiple wallets with a wallet selector
// TODO: Implement auto-lock timer functionality 