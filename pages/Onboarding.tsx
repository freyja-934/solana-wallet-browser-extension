import {
  Alert,
  Button,
  Container,
  Group,
  Image,
  Paper,
  PasswordInput,
  SimpleGrid,
  Stack,
  Stepper,
  Text,
  TextInput,
  Title
} from '@mantine/core';
import { Keypair } from '@solana/web3.js';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../app/hooks';
import { setConnected, setPublicKey } from '../features/wallet/walletSlice';
import { saveEncryptedWallet } from '../wallet/storage';
import { generateUnifiedKeypairs, generateWallet } from '../wallet/wallet';

const Onboarding = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [active, setActive] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [backupConfirmed, setBackupConfirmed] = useState(false);
  const [walletType, setWalletType] = useState<'create' | 'import'>('create');
  const [mnemonic, setMnemonic] = useState('');

  const handleNext = async () => {
    setError(null);

    if (active === 0) {
      // First step: Choose wallet type
      setActive(1);
    } else if (active === 1) {
      // Second step: Set password
      if (!password) {
        setError('Please enter a password');
        return;
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters long');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      setActive(2);
    } else if (active === 2) {
      // Third step: Backup confirmation
      if (!backupConfirmed) {
        setError('Please confirm that you have backed up your wallet');
        return;
      }
      setActive(3);
    } else if (active === 3) {
      // Fourth step: Create or import wallet
      try {
        let keypairs;
        if (walletType === 'create') {
          const result = generateWallet();
          keypairs = result.keypairs;
          await saveEncryptedWallet(result.mnemonic, password);
        } else {
          // Import wallet
          if (!mnemonic.trim()) {
            setError('Please enter your recovery phrase');
            return;
          }
          keypairs = generateUnifiedKeypairs(mnemonic.trim());
          await saveEncryptedWallet(mnemonic.trim(), password);
        }
        
        const solanaKeypair = Keypair.fromSecretKey(keypairs.solana);
        dispatch(setConnected(true));
        dispatch(setPublicKey({ chain: 'solana', publicKey: solanaKeypair.publicKey.toString() }));
        navigate('/home');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create wallet');
      }
    }
  };

  const handleBack = () => {
    setActive((current) => (current > 0 ? current - 1 : current));
  };

  return (
    <div className="bg-wallet-bg bg-cover bg-center min-h-screen flex items-center justify-center">
      <Container size="lg" py="xl">
        <SimpleGrid cols={2}>
        <Paper shadow="md" p="xl" radius="md">
          <Stack>
          <div>
          <Title order={1}>Your Solana Web3 Wallet</Title>
          <Text c="dimmed" size="sm">
            Create a new wallet or import an existing one to get started.
          </Text>
          </div>
          
          <Stepper active={active} onStepClick={setActive} orientation="vertical" autoContrast>
            <Stepper.Step label="Choose Wallet Type" description="Create or import">
              <Stack gap="md" mt="xl">
                <Button
                  variant="filled"
                  onClick={() => {
                    setWalletType('create');
                    setActive(1);
                  }}
                  fullWidth
                >
                  Create New Wallet
                </Button>
                <Button
                  variant="light"
                  onClick={() => {
                    setWalletType('import');
                    setActive(1);
                  }}
                  fullWidth
                >
                  Import Existing Wallet
                </Button>
              </Stack>
            </Stepper.Step>

            <Stepper.Step label="Set Password" description="Secure your wallet">
              <Stack gap="md" mt="xl">
                {walletType === 'import' && (
                  <TextInput
                    label="Recovery Phrase"
                    placeholder="Enter your 12 or 24 word recovery phrase"
                    value={mnemonic}
                    onChange={(e) => setMnemonic(e.currentTarget.value)}
                    required
                  />
                )}
                <PasswordInput
                  label="Password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.currentTarget.value)}
                  required
                />
                <PasswordInput
                  label="Confirm Password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.currentTarget.value)}
                  required
                />
              </Stack>
            </Stepper.Step>

            <Stepper.Step label="Backup" description="Save your recovery phrase">
              <Stack gap="md" mt="xl">
                <Text>
                  Please make sure you have backed up your wallet's recovery phrase.
                  You will need it to recover your wallet if you lose access.
                </Text>
                <Button
                  variant={backupConfirmed ? 'filled' : 'light'}
                  onClick={() => setBackupConfirmed(!backupConfirmed)}
                  fullWidth
                >
                  {backupConfirmed ? 'Backup Confirmed' : 'I Have Backed Up My Wallet'}
                </Button>
              </Stack>
            </Stepper.Step>

            <Stepper.Step label="Complete" description="Finish setup">
              <Stack gap="md" mt="xl">
                <Text>
                  {walletType === 'create' 
                    ? 'Your new wallet will be created with the following settings:'
                    : 'Your wallet will be imported with the following settings:'}
                </Text>
                <Text>Password: {password.length} characters</Text>
                <Text>Type: {walletType === 'create' ? 'New Wallet' : 'Imported Wallet'}</Text>
              </Stack>
            </Stepper.Step>
          </Stepper>

          {error && (
            <Alert color="red" mt="md">
              {error}
            </Alert>
          )}

          <Group justify="center" mt="xl">
           {active > 0 && (<>
            <Button variant="default" onClick={handleBack} disabled={active === 0}>
              Back
            </Button>  <Button onClick={handleNext}>
              {active === 3 ? 'Finish' : 'Next'}
            </Button></>)}
          
          </Group>
          </Stack>
        </Paper>
        <Image  src="/infographic-web3.png" alt="Wallet Background" />
        </SimpleGrid>
      </Container>
    </div>
  );
};

export default Onboarding; 