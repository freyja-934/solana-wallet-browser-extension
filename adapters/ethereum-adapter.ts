// adapters/ethereumAdapter.ts
import * as bip39 from 'bip39';
import { HDKey } from 'ethereum-cryptography/hdkey';
import { ethers } from 'ethers';
import { BlockchainAdapter } from '../types/blockchain-adapter';

export class EthereumAdapter implements BlockchainAdapter {
  private wallet: ethers.Wallet;
  private provider: ethers.JsonRpcProvider;
  private endpoint: string;

  constructor(wallet?: ethers.Wallet, endpoint: string = "https://eth-goerli.g.alchemy.com/v2/demo") {
    this.endpoint = endpoint;
    this.provider = new ethers.JsonRpcProvider(endpoint);
    // Use type assertion to handle the Wallet | HDNodeWallet type
    this.wallet = (wallet || ethers.Wallet.createRandom()) as ethers.Wallet;
    this.wallet = this.wallet.connect(this.provider);
  }

  getPublicKey() {
    return this.wallet.address;
  }

  async getBalances(address: string) {
    // If address is provided, use it; otherwise use the current wallet's address
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const targetAddress = address || this.getPublicKey();
    // In a real implementation, we would use the targetAddress to get balances
    // For now, we'll just return the current wallet's balance
    const balance = await this.provider.getBalance(this.wallet.address);
    return [{ symbol: "ETH", amount: balance.toString(), decimals: 18 }];
  }

  async getTransactions(address: string) {
    // TODO: Implement transaction fetching for Ethereum
    // This should fetch recent transactions for the given address
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const targetAddress = address || this.getPublicKey();
    return [];
  }

  async signTransaction(unsignedTx: ethers.TransactionRequest) {
    // TODO: Implement proper transaction signing
    // This should handle different transaction types
    return await this.wallet.signTransaction(unsignedTx);
  }

  async sendTransaction(txData: ethers.TransactionRequest) {
    // TODO: Implement proper transaction sending
    // This should handle different transaction types and error cases
    const tx = await this.wallet.sendTransaction(txData);
    return tx.hash;
  }

  generateKeypair(mnemonic: string): ethers.Wallet {
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const hdkey = HDKey.fromMasterSeed(seed);
    const ethPrivateKey = hdkey.derive("m/44'/60'/0'/0/0").privateKey!;
    // Convert Uint8Array to hex string
    const privateKeyHex = ethers.hexlify(ethPrivateKey);
    this.wallet = new ethers.Wallet(privateKeyHex);
    this.wallet = this.wallet.connect(this.provider);
    return this.wallet;
  }
}
