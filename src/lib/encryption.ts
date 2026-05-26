import * as crypto from 'node:crypto';

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

function getKey(): Buffer {
  const KEY = process.env.ENCRYPTION_KEY;
  if (!KEY || KEY.length < 32) {
    throw new Error('ENCRYPTION_KEY environment variable is required and must be at least 32 characters long.');
  }
  return Buffer.from(KEY.slice(0, 32));
}

export function encrypt(text: string): { encryptedData: string; iv: string } {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return {
    encryptedData: encrypted,
    iv: iv.toString('hex')
  };
}

export function decrypt(encryptedText: string, ivText: string): string {
  const iv = Buffer.from(ivText, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
