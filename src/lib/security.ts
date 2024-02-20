async function getFullKey(password: string, salt: string) {
  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: Buffer.from(salt, 'base64'),
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

async function encrypt(plainText: string, fullKey: CryptoKey, iv: string) {
  return Buffer.from(
    await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: Buffer.from(iv, 'base64') },
      fullKey,
      Buffer.from(plainText),
    )
  ).toString('base64')
}

async function decrypt(cipherText: string, fullKey: CryptoKey, iv: string) {
  return Buffer.from(
    await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: Buffer.from(iv, 'base64') },
      fullKey,
      Buffer.from(cipherText, 'base64'),
    )
  ).toString()
}

const charTypes: { [key: string]: (n: number) => boolean } = {
  uppercase: (n) => 65 <= n && n <= 90, // 65 - 90
  lowercase: (n) => 97 <= n && n <= 122, // 97 - 122
  numbers: (n) => 48 <= n && n <= 57, // 48 - 57
  // 33 - 47 & 58 - 64 & 91 - 96 & 123 - 126
  symbols: (n) => (
    (33 <= n && n <= 47) ||
      (58 <= n && n <= 64) ||
      (91 <= n && n <= 96) ||
      (123 <= n && n <= 126)
  ), 
};

function getRandPwd(length: number, valid: string[], pwd: number[] = []): string {
  return pwd.length >= length ? pwd.slice(0, length).map(charCode => String.fromCharCode(charCode)).join('') :
    getRandPwd(
      length,
      valid,
      pwd.concat(
        Array.from(crypto.getRandomValues(Buffer.alloc(length)))
          .map(rand => rand > 128 ? Math.floor(rand / 2) : rand)
          .filter(rand => valid.some(charType => charTypes[charType](rand)))
      )
    )
}

async function getHash(str: string) {
  return Buffer.from(
    await crypto.subtle.digest('SHA-256', Buffer.from(str))
  ).toString('base64')
}

export {
  encrypt,
  decrypt,
  getFullKey,
  charTypes,
  getRandPwd,
  getHash,
}
