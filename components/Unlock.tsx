import React, { useState } from 'react';
import { useWallet } from '../context/WalletProvider';

export const Unlock: React.FC = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { unlockWallet, isUnlocked } = useWallet();

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      await unlockWallet(password);
      // Wallet is now unlocked and adapters are initialized
    } catch (err) {
      setError('Failed to unlock wallet. Please check your password.');
      console.error(err);
    }
  };

  if (isUnlocked) {
    return <div>Wallet is unlocked!</div>;
  }

  return (
    <div className="unlock-container">
      <h2>Unlock Your Wallet</h2>
      <form onSubmit={handleUnlock}>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <div className="error-message">{error}</div>}
        <button type="submit">Unlock</button>
      </form>
    </div>
  );
}; 