import crypto from 'node:crypto';

export function deriveKey(passphrase, salt) {
  return crypto.scryptSync(passphrase, salt, 32);
}

export function encryptJson(payload, passphrase) {
  if (!passphrase || passphrase.length < 8) {
    throw new Error('ENV_VAULT_PASSPHRASE must match the approved West Peek vault passphrase policy.');
  }
  const salt = crypto.randomBytes(16);
  const iv = crypto.randomBytes(12);
  const key = deriveKey(passphrase, salt);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const plaintext = Buffer.from(JSON.stringify(payload, null, 2));
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return {
    format: 'west-peek-env-vault-v1',
    algorithm: 'aes-256-gcm',
    kdf: 'scrypt',
    createdAt: new Date().toISOString(),
    salt: salt.toString('base64'),
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64'),
    ciphertext: encrypted.toString('base64')
  };
}

export function decryptJson(envelope, passphrase) {
  if (!passphrase || passphrase.length < 8) {
    throw new Error('ENV_VAULT_PASSPHRASE must match the approved West Peek vault passphrase policy.');
  }
  if (envelope.format !== 'west-peek-env-vault-v1') {
    throw new Error(`Unsupported env vault format: ${envelope.format}`);
  }
  const salt = Buffer.from(envelope.salt, 'base64');
  const iv = Buffer.from(envelope.iv, 'base64');
  const authTag = Buffer.from(envelope.authTag, 'base64');
  const ciphertext = Buffer.from(envelope.ciphertext, 'base64');
  const key = deriveKey(passphrase, salt);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return JSON.parse(decrypted.toString('utf8'));
}
