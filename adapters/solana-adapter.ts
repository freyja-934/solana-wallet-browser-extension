// adapters/solanaAdapter.ts
import { ConfirmedSignatureInfo, Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import * as bip39 from 'bip39';
import { BlockchainAdapter, Transaction as BlockchainTransaction } from '../types/blockchain-adapter';

export class SolanaAdapter implements BlockchainAdapter {
  private keypair: Keypair;
  private connection: Connection;

  constructor(keypair?: Keypair, endpoint: string = "https://api.devnet.solana.com") {
    this.connection = new Connection(endpoint);
    this.keypair = keypair || Keypair.generate();
  }

  getPublicKey() {
    return this.keypair.publicKey.toBase58();
  }

  async getBalances(address: string) {
    try {
      const targetAddress = address || this.getPublicKey();
      const publicKey = new PublicKey(targetAddress);
      const lamports = await this.connection.getBalance(publicKey);
      return [{ symbol: "SOL", amount: (lamports / 1e9).toString(), decimals: 9 }];
    } catch (error) {
      console.error('Error getting balances:', error);
      throw new Error('Failed to fetch balances');
    }
  }

  async getTransactions(address: string): Promise<BlockchainTransaction[]> {
    try {
      const targetAddress = address || this.getPublicKey();
      const publicKey = new PublicKey(targetAddress);
      
      // Get recent signatures
      const signatures = await this.connection.getSignaturesForAddress(publicKey, { limit: 10 });
      
      // Get transaction details for each signature
      const transactions = await Promise.all(
        signatures.map(async (sig: ConfirmedSignatureInfo) => {
          const tx = await this.connection.getParsedTransaction(sig.signature, {
            maxSupportedTransactionVersion: 0
          });
          
          if (!tx) {
            return null;
          }

          // Extract relevant transaction information
          const parsedTx = tx.transaction;
          const timestamp = sig.blockTime ? sig.blockTime * 1000 : Date.now();
          
          // Parse transaction amount
          let amount = '0';
          for (const ix of tx.transaction.message.instructions) {
            if ('parsed' in ix && ix.parsed?.type === 'transfer') {
              amount = ix.parsed.info?.lamports?.toString() || '0';
              break;
            }
          }
          
          // Determine if it's a send or receive transaction
          const isSend = tx.transaction.message.instructions.some(
            (ix) => 'parsed' in ix && ix.parsed?.info?.source === publicKey.toBase58()
          );
          
          // Map Solana's status to our expected status type
          const status: 'confirmed' | 'pending' | 'failed' = 
            sig.confirmationStatus === 'confirmed' ? 'confirmed' :
            sig.confirmationStatus === 'processed' ? 'pending' : 'failed';
          
          return {
            txid: sig.signature,
            timestamp,
            amount,
            to: isSend ? parsedTx.message.accountKeys[1].pubkey.toBase58() : publicKey.toBase58(),
            from: isSend ? publicKey.toBase58() : parsedTx.message.accountKeys[0].pubkey.toBase58(),
            status
          };
        })
      );

      return transactions.filter((tx): tx is NonNullable<typeof tx> => tx !== null);
    } catch (error) {
      console.error('Error getting transactions:', error);
      throw new Error('Failed to fetch transactions');
    }
  }

  async signTransaction(tx: Transaction) {
    try {
      if (!this.keypair) {
        throw new Error('No keypair available for signing');
      }
      
      tx.sign(this.keypair);
      return tx.serialize().toString('base64');
    } catch (error) {
      console.error('Error signing transaction:', error);
      throw new Error('Failed to sign transaction');
    }
  }

  async sendTransaction(serializedTx: string) {
    try {
      const rawTransaction = Buffer.from(serializedTx, 'base64');
      const txid = await this.connection.sendRawTransaction(rawTransaction, {
        skipPreflight: false,
        preflightCommitment: 'confirmed'
      });
      
      // Wait for confirmation
      await this.connection.confirmTransaction(txid);
      
      return txid;
    } catch (error) {
      console.error('Error sending transaction:', error);
      throw new Error('Failed to send transaction');
    }
  }

  generateKeypair(mnemonic: string): Keypair {
    try {
      const seed = bip39.mnemonicToSeedSync(mnemonic);
      const solanaSeed = seed.slice(0, 32);
      this.keypair = Keypair.fromSeed(solanaSeed);
      return this.keypair;
    } catch (error) {
      console.error('Error generating keypair:', error);
      throw new Error('Failed to generate keypair');
    }
  }
}
