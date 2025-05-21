import {
    Alert,
    Button,
    Container,
    Paper,
    PasswordInput,
    Stack,
    Text,
    Title
} from '@mantine/core';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../app/hooks';
import { setConnected, setPublicKey } from '../features/wallet/walletSlice';
import { decryptWallet } from '../wallet/wallet';

const Unlock = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUnlock = async () => {
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Decrypt the wallet
      const { solana } = await decryptWallet(password);
      
      // Update Redux state
      dispatch(setConnected(true));
      dispatch(setPublicKey({ chain: 'solana', publicKey: solana.publicKey.toString() }));
      
      // Navigate to home
      navigate('/home');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unlock wallet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="sm" py="xl">
      <Paper shadow="md" p="xl" radius="md">
        <Title order={1} ta="center" mb="xl">Unlock Your Wallet</Title>
        
        <Stack gap="md">
          <Text>
            Enter your password to unlock your wallet and access your funds.
          </Text>
          
          <PasswordInput
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            required
          />
          
          {error && (
            <Alert color="red">
              {error}
            </Alert>
          )}
          
          <Button 
            onClick={handleUnlock} 
            loading={loading}
            fullWidth
          >
            Unlock
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
};

export default Unlock; 