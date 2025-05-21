import { Connection, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';

// TODO: Add proper connection management
export const getConnection = () => {
  return new Connection('https://api.devnet.solana.com');
};

// TODO: Add proper transaction building
export const buildTransferTransaction = (
  fromPubkey: PublicKey,
  toPubkey: PublicKey,
  amount: number
): Transaction => {
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey,
      toPubkey,
      lamports: amount * LAMPORTS_PER_SOL,
    })
  );
  return transaction;
};

// TODO: Add proper transaction confirmation
export const confirmTransaction = async (
  connection: Connection,
  signature: string
): Promise<boolean> => {
  try {
    const confirmation = await connection.confirmTransaction(signature);
    return confirmation.value.err === null;
  } catch (error) {
    console.error('Failed to confirm transaction:', error);
    return false;
  }
}; 