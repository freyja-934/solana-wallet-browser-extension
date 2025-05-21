import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';

interface Transaction {
  id: string;
  type: 'send' | 'receive';
  amount: number;
  token: 'SOL' | 'USDC';
  timestamp: number;
  status: string;
}

const Home = () => {
  const navigate = useNavigate();
  const { connected, solBalance, tokenBalance, recentTransactions } = useWallet();

  useEffect(() => {
    if (!connected) {
      navigate('/');
    }
  }, [connected, navigate]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Wallet Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">SOL Balance</h2>
          <p className="text-3xl font-bold">{solBalance} SOL</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">USDC Balance</h2>
          <p className="text-3xl font-bold">{tokenBalance} USDC</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
        <div className="space-y-2">
          {recentTransactions.map((tx: Transaction) => (
            <div key={tx.id} className="border-b pb-2">
              <p className="font-medium">{tx.type.toUpperCase()}</p>
              <p className="text-sm text-gray-600">
                {tx.amount} {tx.token} - {tx.status}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(tx.timestamp).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home; 