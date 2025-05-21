import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SendTokenForm from '../components/SendTokenForm';
import TransactionList from '../components/TransactionList';
import { useWallet } from '../hooks/useWallet';

const Dashboard = () => {
  const navigate = useNavigate();
  const { connected, solBalance, tokenBalance } = useWallet();

  useEffect(() => {
    if (!connected) {
      navigate('/');
    }
  }, [connected, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold">Dashboard</h1>
        
        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">SOL Balance</h2>
            <p className="text-3xl">{solBalance?.toFixed(4) || '0.0000'} SOL</p>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">USDC Balance</h2>
            <p className="text-3xl">{tokenBalance?.toFixed(2) || '0.00'} USDC</p>
          </div>
        </div>

        {/* Send Token Form */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Send Tokens</h2>
          <SendTokenForm />
        </div>

        {/* Recent Transactions */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <TransactionList />
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 