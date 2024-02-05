'use client';

export default function Test() {
  console.log('show on client')

  async function getFullKey(password: string, salt: Uint8Array) {
    return await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(password),
        "PBKDF2",
        false,
        ["deriveBits", "deriveKey"],
      ),
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"],
    )
  }

  async function encryptData(plainText: string, fullKey: CryptoKey, iv: ArrayBuffer) {
    return await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      fullKey,
      Buffer.from(plainText),
    );
  }

  async function decryptData(cipherText: ArrayBuffer, fullKey: CryptoKey, iv: ArrayBuffer) {
  // async function decryptData(cipherText: string, fullKey: CryptoKey, iv: ArrayBuffer) {
    return await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      fullKey,
      cipherText,
      // Buffer.from(cipherText),
    )
  }

  const data = JSON.stringify({
    'amazon': {
      user: 'test@email.com',
      pwd: 'password123',
    }
  });
  const password = 'testPassword';
  // @ts-ignore
  const salt = new Uint8Array([...Array(32).keys()])
  // @ts-ignore
  const iv = new Uint8Array([...Array(12).keys()])

  // Apparently salt and iv can be stored in the db next to the encrypted data
  // decryptData needs to take cipherText as a string

  // console.log(
  //   JSON.stringify(Buffer.from(password)) === JSON.stringify(Buffer.from(Buffer.from(password).toString()))
  // )

  getFullKey(password, salt).then(fullKey => {
    encryptData(data, fullKey, iv).then(encrypted => {
      console.log('encrypted data', Buffer.from(encrypted).toString())
      // console.log(
      //   JSON.stringify(Buffer.from(encrypted)) === JSON.stringify(Buffer.from(Buffer.from(encrypted).toString()))
      // )
      decryptData(encrypted, fullKey, iv).then(decrypted => {
        console.log('decrypted data', Buffer.from(decrypted).toString())
      })
    })
  })

  return (
    <div>
      <h1>Hello from component</h1>
    </div>
  )
}
