async function getFullKey(password: string, salt: Uint8Array) {
  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
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

async function encrypt(plainText: string, fullKey: CryptoKey, iv: ArrayBuffer) {
  return Buffer.from(
    await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      fullKey,
      Buffer.from(plainText),
    )
  ).toString('base64')
}

async function decrypt(cipherText: string, fullKey: CryptoKey, iv: ArrayBuffer) {
  return Buffer.from(
    await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
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
