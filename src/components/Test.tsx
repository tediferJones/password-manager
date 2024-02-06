'use client';

export default function Test() {
  console.log('show on client')

  async function getFullKey(password: string, salt: Uint8Array) {
    return await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      await crypto.subtle.importKey(
        'raw',
        // new TextEncoder().encode(password),
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

  async function encryptData(plainText: string, fullKey: CryptoKey, iv: ArrayBuffer) {
    // WORKING
    // return await crypto.subtle.encrypt(
    //   { name: 'AES-GCM', iv },
    //   fullKey,
    //   Buffer.from(plainText),
    // );

    return Buffer.from(
      await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        fullKey,
        Buffer.from(plainText),
      )
    ).toString('base64')
  }

  // async function decryptData(cipherText: ArrayBuffer, fullKey: CryptoKey, iv: ArrayBuffer) {
  async function decryptData(cipherText: string, fullKey: CryptoKey, iv: ArrayBuffer) {
    // WORKING
    // return await crypto.subtle.decrypt(
    //   { name: 'AES-GCM', iv },
    //   fullKey,
    //   // cipherText,
    //   Buffer.from(cipherText, 'base64'),
    // )

    return Buffer.from(
      await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        fullKey,
        Buffer.from(cipherText, 'base64'),
      )
    ).toString()
  }

  const data = JSON.stringify({
    'amazon': {
      user: 'test@email.com',
      pwd: 'password123',
    },
    'github': {
      userId: 'test@email.com',
      pwd: 'fakePassword123',
    }
  });
  const password = 'testPassword';
  // @ts-ignore
  const salt = new Uint8Array([...Array(32).keys()])
  // @ts-ignore
  const iv = new Uint8Array([...Array(12).keys()])

  // THESE METHODS IMPLEMENT PBKDF2, FOR PASSWORD BASED ENCRYPTION
  // More Info: https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/deriveKey#pbkdf2_2
  //
  // Apparently salt and iv can be stored in the db next to the encrypted data
  //   - Salt should always be unique (we cant guarantee every password is unique)
  //   - Rotate IV every time we re-encrypt the data
  //   - Recommended to iterate hash 2^(Current Year - 2000) times, so we want 2^24 which is 16777216
  // More Info: https://security.stackexchange.com/questions/177990/what-is-the-best-practice-to-store-private-key-salt-and-initialization-vector-i
  //
  // What to do next:
  // Setup passwordless sign-in (Phone number requires pro subcription)
  // Setup database to take iv and salt
  //

  getFullKey(password, salt).then(fullKey => {
    encryptData(data, fullKey, iv).then(encrypted => {
      console.log('encrypted data', encrypted)
      decryptData(encrypted, fullKey, iv).then(decrypted => {
        console.log('decrypted data', decrypted)
      })
    })
  })

  return (
    <div>
      <h1>Hello from component</h1>
    </div>
  )
}
