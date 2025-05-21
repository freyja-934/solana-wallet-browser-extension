import { Button, PasswordInput, Stack } from '@mantine/core';
import React from 'react';
import { useWallet } from '../context/WalletProvider';

export const WalletConnectButton: React.FC = () => {
  const { isUnlocked, unlockWallet } = useWallet();
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);

  const handleConnect = async () => {
    if (!password) {
      setError('Please enter your password');
      return;
    }
    try {
      await unlockWallet(password);
      setError(null);
    } catch (error) {
      console.error('Failed to unlock wallet:', error);
      setError('Failed to unlock wallet. Please check your password.');
    }
  };

  return (
    <Stack gap="sm">
      <PasswordInput
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={error}
      />
      <Button
        onClick={handleConnect}
        variant={isUnlocked ? "light" : "filled"}
        color={isUnlocked ? "gray" : "blue"}
      >
        {isUnlocked ? 'Disconnect Wallet' : 'Connect Wallet'}
      </Button>
    </Stack>
  );
}; 