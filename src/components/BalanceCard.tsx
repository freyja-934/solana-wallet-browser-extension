import { Card, Group, Text } from '@mantine/core';
import React from 'react';
import { useWallet } from '../context/WalletProvider';

interface BalanceCardProps {
  symbol: string;
  amount: string;
  decimals?: number;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({ symbol, amount, decimals = 9 }) => {
  const { isUnlocked } = useWallet();
  const formattedAmount = isUnlocked ? Number(amount) / Math.pow(10, decimals) : 0;

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Group justify="space-between" mb="xs">
        <Text fw={500}>{symbol}</Text>
        <Text>{formattedAmount.toFixed(decimals)}</Text>
      </Group>
    </Card>
  );
}; 