import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const algorithm = 'aes-256-cbc';
const encryptionKey = process.env.ENCRYPTION_KEY;

if (!encryptionKey) {
  throw new Error('ENCRYPTION_KEY environment variable is required');
}

const key = Buffer.from(encryptionKey, 'hex'); // 32-byte key from env

export function encryptToken(text: string): string {
  const iv = randomBytes(16);
  const cipher = createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

export function decryptToken(encrypted: string): string {
  const [ivHex, encryptedText] = encrypted.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}