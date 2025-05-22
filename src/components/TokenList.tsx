import { useEffect, useState } from 'react';
import { useWallet } from '../hooks/useWallet';

interface TokenBalance {
  mint: string;
  amount: string;
  decimals: number;
  uiAmount: number;
  symbol?: string;
  name?: string;
}

const TokenList = () => {
  const { publicKey } = useWallet();
  const [tokens, setTokens] = useState<TokenBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTokens = async () => {
      if (!publicKey) return;

      try {
        setLoading(true);
        setError(null);

        const HELIUS_API_KEY = import.meta.env.VITE_HELIUS_API_KEY;
        
        if (!HELIUS_API_KEY) {
          throw new Error('Helius API key not found in environment variables');
        }

        const response = await fetch(
          `https://api.helius.xyz/v0/addresses/${publicKey}/balances?api-key=${HELIUS_API_KEY}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch token balances');
        }

        const data = await response.json();
        
        // Sort tokens by balance and take top 10
        const sortedTokens = data.tokens
          .sort((a: TokenBalance, b: TokenBalance) => b.uiAmount - a.uiAmount)
          .slice(0, 10);

        setTokens(sortedTokens);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch tokens');
      } finally {
        setLoading(false);
      }
    };

    fetchTokens();
  }, [publicKey]);

  if (loading) {
    return <div className="text-gray-400">Loading tokens...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold mb-4">Top Tokens</h2>
      <div className="space-y-2">
        {tokens.map((token) => (
          <div
            key={token.mint}
            className="bg-gray-800 p-4 rounded-lg flex justify-between items-center"
          >
            <div>
              <div className="font-medium">{token.symbol || 'Unknown'}</div>
              <div className="text-sm text-gray-400">{token.name || token.mint.slice(0, 8) + '...'}</div>
            </div>
            <div className="text-right">
              <div className="font-medium">{token.uiAmount.toFixed(4)}</div>
              <div className="text-sm text-gray-400">
                {token.amount} (raw)
              </div>
            </div>
          </div>
        ))}
        {tokens.length === 0 && (
          <div className="text-gray-400 text-center py-4">No tokens found</div>
        )}
      </div>
    </div>
  );
};

export default TokenList; 