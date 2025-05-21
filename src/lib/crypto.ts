import { Buffer } from 'buffer';

export interface EncryptedData {
  salt: string;
  iv: string;
  encrypted: string;
}

const getKeyFromPassword = async (password: string, salt: Uint8Array) => {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256"
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
};

export const encryptData = async (data: Uint8Array, password: string): Promise<EncryptedData> => {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await getKeyFromPassword(password, salt);
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, data);

  return {
    salt: Buffer.from(salt).toString("hex"),
    iv: Buffer.from(iv).toString("hex"),
    encrypted: Buffer.from(encrypted).toString("hex")
  };
};

export const decryptData = async (encryptedData: EncryptedData, password: string): Promise<Uint8Array> => {
  const salt = Buffer.from(encryptedData.salt, "hex");
  const iv = Buffer.from(encryptedData.iv, "hex");
  const encrypted = Buffer.from(encryptedData.encrypted, "hex");
  const key = await getKeyFromPassword(password, salt);

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    encrypted
  );

  return new Uint8Array(decrypted);
};
