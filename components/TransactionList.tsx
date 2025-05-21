import { Transaction } from '../features/wallet/walletSlice';
import { useWallet } from '../hooks/useWallet';

const TransactionList = () => {
  const { recentTransactions } = useWallet();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-500';
      case 'pending':
        return 'text-yellow-500';
      case 'failed':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-white">Recent Transactions</h2>
      
      {recentTransactions.length === 0 ? (
        <p className="text-gray-400">No recent transactions</p>
      ) : (
        <div className="space-y-2">
          {recentTransactions.map((tx: Transaction) => (
            <div
              key={tx.id}
              className="bg-gray-800 rounded-lg p-4 space-y-2"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-white font-medium">
                    {tx.type === 'send' ? 'Sent' : 'Received'} {tx.amount} {tx.token}
                  </span>
                  <p className="text-sm text-gray-400">
                    {tx.type === 'send' ? 'To' : 'From'}: {formatAddress(tx.type === 'send' ? tx.to : tx.from)}
                  </p>
                </div>
                <span className={`text-sm ${getStatusColor(tx.status)}`}>
                  {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                </span>
              </div>
              
              <div className="flex justify-between text-sm text-gray-400">
                <span>{formatDate(tx.timestamp)}</span>
                {tx.signature && (
                  <a
                    href={`https://explorer.solana.com/tx/${tx.signature}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:text-purple-300"
                  >
                    View on Explorer
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TransactionList; 