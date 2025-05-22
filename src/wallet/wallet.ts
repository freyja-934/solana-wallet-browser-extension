import { Keypair } from '@solana/web3.js';
import * as bip39 from 'bip39';
import { HDKey } from 'ethereum-cryptography/hdkey';
import { ethers } from 'ethers';
import { decryptData, encryptData, EncryptedData } from '../lib/crypto';
import { getEncryptedWallet, saveEncryptedWallet as saveWallet } from './storage';

export interface UnifiedKeypairs {
  solana: Uint8Array;
  ethereum: Uint8Array;
}

export const generateUnifiedKeypairs = (mnemonic: string): UnifiedKeypairs => {
  const seed = bip39.mnemonicToSeedSync(mnemonic);

  const solanaSeed = seed.slice(0, 32);
  const solana = Keypair.fromSeed(solanaSeed).secretKey;

  const hdkey = HDKey.fromMasterSeed(seed);
  const ethPrivateKey = hdkey.derive("m/44'/60'/0'/0/0").privateKey!;
  const ethereum = new Uint8Array(ethPrivateKey);

  return { solana, ethereum };
};

export const createWalletFromPrivateKey = (privateKey: string): UnifiedKeypairs => {
  try {
    const cleanKey = privateKey.replace(/\s/g, '');
    const keyArray = cleanKey.split(',').map(num => parseInt(num, 10));
    
    if (!Array.isArray(keyArray) || keyArray.length !== 64) {
      throw new Error('Invalid private key format. Expected 64 numbers.');
    }
    
    const privateKeyBytes = new Uint8Array(keyArray);
    const solanaKeypair = Keypair.fromSecretKey(privateKeyBytes);
    
    return {
      solana: privateKeyBytes,
      ethereum: new Uint8Array(0)
    };
  } catch (error) {
    console.error('Error creating wallet from private key:', error);
    throw new Error('Failed to create wallet from private key');
  }
};

export interface EncryptedWallet {
  solana: EncryptedData;
  ethereum: EncryptedData;
}

export const saveEncryptedWallet = async (mnemonic: string, password: string) => {
  await saveWallet(mnemonic, password);
};

export const decryptWallet = async (password: string): Promise<{ solana: Keypair, ethereum: ethers.Wallet }> => {
  const encrypted = await getEncryptedWallet();
  if (!encrypted) throw new Error("No wallet found");

  const solanaKey = await decryptData(encrypted.solana, password);
  const ethereumKey = await decryptData(encrypted.ethereum, password);

  return {
    solana: Keypair.fromSecretKey(solanaKey),
    ethereum: new ethers.Wallet(ethereumKey.toString()),
  };
};

export const clearWallet = () => {
  import('./storage').then(module => module.clearWallet());
};

export const encryptPrivateKey = async (privateKey: Uint8Array, password: string): Promise<EncryptedData> => {
  return encryptData(privateKey, password);
};

export const generateWallet = (): { mnemonic: string; keypairs: UnifiedKeypairs } => {
  const mnemonic = bip39.generateMnemonic();
  const keypairs = generateUnifiedKeypairs(mnemonic);
  return { mnemonic, keypairs };
};