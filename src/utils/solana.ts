import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';

// Dummy SPL token mint address (replace with actual token mint address in production)
export const DUMMY_TOKEN_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'); // USDC on mainnet

// Connection to Solana network (using devnet for development)
export const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

// Get SOL balance for a wallet
export const getSolBalance = async (publicKey: PublicKey): Promise<number> => {
  try {
    const balance = await connection.getBalance(publicKey);
    return balance / LAMPORTS_PER_SOL; // Convert lamports to SOL
  } catch (error) {
    console.error('Error fetching SOL balance:', error);
    return 0;
  }
};

// Get token balance for a wallet
export const getTokenBalance = async (
  walletAddress: PublicKey,
  tokenMint: PublicKey = DUMMY_TOKEN_MINT
): Promise<number> => {
  try {
    // Find token accounts owned by the wallet
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      walletAddress,
      { mint: tokenMint }
    );

    // Sum up the balances
    let totalBalance = 0;
    tokenAccounts.value.forEach((tokenAccount) => {
      const parsedInfo = tokenAccount.account.data.parsed.info;
      const tokenBalance = parsedInfo.tokenAmount.uiAmount;
      totalBalance += tokenBalance;
    });

    return totalBalance;
  } catch (error) {
    console.error('Error fetching token balance:', error);
    return 0;
  }
};

// Get token account info
export const getTokenAccountInfo = async (
  walletAddress: PublicKey,
  tokenMint: PublicKey = DUMMY_TOKEN_MINT
) => {
  try {
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      walletAddress,
      { mint: tokenMint }
    );

    return tokenAccounts.value.map((tokenAccount) => {
      const parsedInfo = tokenAccount.account.data.parsed.info;
      return {
        address: tokenAccount.pubkey.toString(),
        mint: parsedInfo.mint,
        owner: parsedInfo.owner,
        amount: parsedInfo.tokenAmount.uiAmount,
        decimals: parsedInfo.tokenAmount.decimals,
      };
    });
  } catch (error) {
    console.error('Error fetching token account info:', error);
    return [];
  }
}; 