import { BlockchainAdapter } from '../types/blockchain-adapter';
import { EthereumAdapter } from './ethereum-adapter';
import { SolanaAdapter } from './solana-adapter';

export type ChainType = 'solana' | 'ethereum';

export const getAdapter = (chain: ChainType): BlockchainAdapter => {
  if (chain === 'solana') return new SolanaAdapter();
  if (chain === 'ethereum') return new EthereumAdapter();
  throw new Error(`Unsupported chain: ${chain}`);
}; 