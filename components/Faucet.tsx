import { useWallet } from '@solana/wallet-adapter-react';
import { Connection } from '@solana/web3.js';
import { FC, useState } from 'react';
import { useAppDispatch } from '../app/hooks';
import { mintToken } from '../features/token/mintToken';

// TODO: Add proper faucet functionality
export const Faucet: FC = () => {
  const { publicKey } = useWallet();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);

  const handleMint = async () => {
    if (!publicKey) return;
    
    setLoading(true);
    try {
      const connection = new Connection('https://api.devnet.solana.com');
      await mintToken(connection, publicKey, dispatch);
    } catch (error) {
      console.error('Failed to mint:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleMint}
      disabled={loading || !publicKey}
      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
    >
      {loading ? 'Minting...' : 'Get Test Tokens'}
    </button>
  );
}; 