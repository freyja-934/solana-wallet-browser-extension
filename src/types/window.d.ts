interface Window {
  solana?: {
    isPhantom?: boolean;
    connect(): Promise<{ publicKey: { toString(): string } }>;
    disconnect(): Promise<void>;
    on(event: string, callback: (args: unknown) => void): void;
    request(params: { method: string; params?: unknown }): Promise<unknown>;
    signAndSendTransaction(transaction: unknown): Promise<{ signature: string }>;
  };
} 