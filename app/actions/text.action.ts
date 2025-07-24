
import crypto from 'crypto'

// 1. Encrypt the text with a passphrase
export function encryptText(text: string, key: string): string {
  // Derive a 32‑byte key and 16‑byte IV from your passphrase
  const hash = crypto.createHash('sha256').update(key).digest()
  const iv = crypto.randomBytes(16)

  const cipher = crypto.createCipheriv('aes-256-cbc', hash, iv)
  const encrypted = Buffer.concat([
    cipher.update(Buffer.from(text, 'utf8')),
    cipher.final()
  ])

  // Prepend the IV and output as base64
  return Buffer.concat([iv, encrypted]).toString('base64')
}

// 2. Decrypt the text (after you read it back out of the image)
export function decryptText(encryptedB64: string, key: string): string {
  const data = Buffer.from(encryptedB64, 'base64')

  // IV is first 16 bytes
  const iv = data.slice(0, 16)
  const encrypted = data.slice(16)

  const hash = crypto.createHash('sha256').update(key).digest()
  const decipher = crypto.createDecipheriv('aes-256-cbc', hash, iv)

  try {
    // Attempt decryption
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final()
    ])
    return decrypted.toString('utf8')
  } catch (err) {
    // Any failure (bad padding, wrong key, etc.) lands here
    throw new Error('Decryption failed: the key may be incorrect or the data is corrupted.')
  }
}
