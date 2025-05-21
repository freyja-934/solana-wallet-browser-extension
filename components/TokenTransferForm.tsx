import { Alert, Button, NumberInput, Stack, Text, TextInput } from '@mantine/core';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import React, { useState } from 'react';
import { DUMMY_TOKEN_MINT } from '../utils/solana';

export const TokenTransferForm: React.FC = () => {
  const { publicKey, connected, signTransaction } = useWallet();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connected || !publicKey || !signTransaction) {
      setError('Wallet not connected');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      // Validate recipient address
      try {
        new PublicKey(recipient);
      } catch {
        setError('Invalid recipient address');
        setLoading(false);
        return;
      }

      // Validate amount
      if (!amount || amount <= 0) {
        setError('Please enter a valid amount');
        setLoading(false);
        return;
      }

      // For demo purposes, we'll just simulate a transfer
      // In a real implementation, you would:
      // 1. Find the token account for the recipient
      // 2. Create a transfer instruction
      // 3. Sign and send the transaction
      
      // Simulate a delay to mimic a real transaction
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccess(true);
      setAmount('');
      setRecipient('');
    } catch (err) {
      console.error('Transfer error:', err);
      setError('Failed to complete transfer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAmountChange = (value: string | number) => {
    if (typeof value === 'number') {
      setAmount(value);
    } else if (value === '') {
      setAmount('');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        {error && (
          <Alert color="red" title="Error" variant="filled">
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert color="green" title="Success" variant="filled">
            Transfer completed successfully!
          </Alert>
        )}
        
        <TextInput
          label="Recipient Address"
          placeholder="Enter Solana address"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          required
          disabled={loading}
        />
        
        <NumberInput
          label="Amount"
          placeholder="Enter amount"
          value={amount}
          onChange={handleAmountChange}
          required
          min={0}
          decimalScale={2}
          disabled={loading}
        />
        
        <Text size="sm" c="dimmed">
          Token: USDC ({DUMMY_TOKEN_MINT.toString()})
        </Text>
        
        <Button 
          type="submit" 
          disabled={!connected || loading}
          loading={loading}
        >
          Send Tokens
        </Button>
      </Stack>
    </form>
  );
}; 