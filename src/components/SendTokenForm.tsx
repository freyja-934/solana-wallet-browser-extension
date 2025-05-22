import { Connection, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { useState } from 'react';
import { useWallet } from '../hooks/useWallet';

const SendTokenForm = () => {
  const { publicKey, solBalance, addTransaction } = useWallet();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey || !recipient || !amount) return;

    setLoading(true);
    setError(null);

    try {
      if (!window.solana) {
        throw new Error('Solana wallet not found');
      }

      const recipientPubkey = new PublicKey(recipient);
      const amountInLamports = parseFloat(amount) * LAMPORTS_PER_SOL;

      if (amountInLamports <= 0) {
        throw new Error('Amount must be greater than 0');
      }

      if (solBalance && amountInLamports > Number(solBalance) * LAMPORTS_PER_SOL) {
        throw new Error('Insufficient balance');
      }

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(publicKey),
          toPubkey: recipientPubkey,
          lamports: amountInLamports,
        })
      );

      // Get the latest blockhash
      const connection = new Connection('https://api.mainnet-beta.solana.com');
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = new PublicKey(publicKey);

      // Sign and send the transaction
      const signature = await window.solana.signAndSendTransaction(transaction);

      // Add transaction to recent transactions
      addTransaction({
        id: signature.signature,
        type: 'send',
        amount: parseFloat(amount),
        token: 'SOL',
        timestamp: Date.now(),
        status: 'pending',
        from: publicKey.toString(),
        to: recipient,
        signature: signature.signature,
        chain: 'solana',
      });

      // Clear form
      setRecipient('');
      setAmount('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="recipient" className="block text-sm font-medium text-gray-300">
          Recipient Address
        </label>
        <input
          type="text"
          id="recipient"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500"
          placeholder="Enter Solana address"
          required
        />
      </div>

      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-300">
          Amount (SOL)
        </label>
        <input
          type="number"
          id="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500"
          placeholder="0.0"
          step="0.000000001"
          min="0"
          required
        />
      </div>

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
      >
        {loading ? 'Sending...' : 'Send SOL'}
      </button>
    </form>
  );
};

export default SendTokenForm; 