'use client';

// This is nextjs's optimized way of sending images
// import Image from 'next/image';
import { UserButton } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { encrypt, decrypt, getFullKey } from '@/modules/security';
import { UserInfo } from '@/types';

// Encryption key can be gotten by using the getFullKey function

// THESE METHODS IMPLEMENT PBKDF2, FOR PASSWORD BASED ENCRYPTION
// More Info: https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/deriveKey#pbkdf2_2
//
// Apparently salt and iv can be stored in the db next to the encrypted data
//   - Salt should always be unique (we cant guarantee every password is unique)
//   - Rotate IV every time we re-encrypt the data
//   - Recommended to iterate hash 2^(Current Year - 2000) times, so we want 2^24 which is 16777216
// More Info: https://security.stackexchange.com/questions/177990/what-is-the-best-practice-to-store-private-key-salt-and-initialization-vector-i
//
// If we want to use phone number for login and/or OTP, you must pay for clerk pro
//
// What to do next:
// Start building ui
//  - Add some way to create new entries
//
// Extras:
//  - delete components/Test.tsx

export default function Home() {
  const [vault, setVault] = useState<null | UserInfo[]>(null)

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/vault');
      const { salt, iv, vault } : UserInfo = await res.json()
      console.log({ salt, iv, vault })
      if (!vault) {
        console.log('no vault found')
        return setVault([])
      }
      // Get password from user and decrypt vault
      const password = window.prompt('Please input your password')
      if (password) {
        return setVault(JSON.parse(
          await decrypt(
            vault,
            await getFullKey('string', Buffer.from(salt, 'base64')),
            Buffer.from(iv, 'base64')
          )
        ))
      }
    })()
  }, [])

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

  getFullKey(password, salt).then(fullKey => {
    encrypt(data, fullKey, iv).then(encrypted => {
      console.log('encrypted data', encrypted)
      decrypt(encrypted, fullKey, iv).then(decrypted => {
        console.log('decrypted data', decrypted)
      })
    })
  })

  return (
    <div className='bg-gray-800 text-white'>
      <div className='p-8 flex justify-between'>
        <h1 className='text-4xl font-bold'>Password Manager</h1>
        <UserButton />
      </div>
      {vault === null ? <h1>LOADING...</h1> : 
        vault.length === 0 ? <h1>No records found, please add a password and click upload</h1> :
          <div>
            <h1>This is where the passwords go</h1>
          </div>
      }
    </div>
  );
}
