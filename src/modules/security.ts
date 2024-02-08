// async function getFullKey(password: string, salt: Uint8Array) {
async function getFullKey(password: string, salt: string) {
  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      // salt,
      salt: Buffer.from(salt, 'base64'),
      // iterations: 100000,
         iterations: 1000000,
      hash: 'SHA-256',
    },
    await crypto.subtle.importKey(
      'raw',
      Buffer.from(password),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey'],
    ),
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt'],
  )
}

// async function encrypt(plainText: string, fullKey: CryptoKey, iv: ArrayBuffer) {
async function encrypt(plainText: string, fullKey: CryptoKey, iv: string) {
  return Buffer.from(
    await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: Buffer.from(iv, 'base64') },
      fullKey,
      Buffer.from(plainText),
    )
  ).toString('base64')
}

// async function decrypt(cipherText: string, fullKey: CryptoKey, iv: ArrayBuffer) {
async function decrypt(cipherText: string, fullKey: CryptoKey, iv: string) {
  return Buffer.from(
    await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: Buffer.from(iv, 'base64') },
      fullKey,
      Buffer.from(cipherText, 'base64'),
    )
  ).toString()
}

export {
  encrypt,
  decrypt,
  getFullKey,
}
