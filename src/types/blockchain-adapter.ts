/* eslint-disable @typescript-eslint/no-explicit-any */
export interface TokenBalance {
  symbol: string;
  amount: string;
  decimals: number;
}

export interface Transaction {
  txid: string;
  timestamp: number;
  amount: string;
  to: string;
  from: string;
  status: 'confirmed' | 'pending' | 'failed';
}

export interface BlockchainAdapter {
  getPublicKey(): string;
  getBalances(address: string): Promise<TokenBalance[]>;
  getTransactions(address: string): Promise<Transaction[]>;
  signTransaction(unsignedTx: any): Promise<string>;
  sendTransaction(txData: any): Promise<string>;
  generateKeypair(mnemonic: string): any;
}
