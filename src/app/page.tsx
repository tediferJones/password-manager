'use client';

// This is nextjs's optimized way of sending images
// import Image from 'next/image';
import { UserButton } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { encrypt, decrypt, getFullKey } from '@/modules/security';
import { UserInfo } from '@/types';
import { Button } from '@/components/ui/button';
import { ToggleTheme } from '@/components/toggleTheme';
import GetPassword from '@/components/getPassword';

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
// Edit modules/security, all functions should take salt and iv as base64 strings
// Update state var names
// Update UserInfo type, on the client-side vault, salt, and iv are technically optional
//  - If we can assign salt and iv in this component, then the only optional attr would be vault, 
//    and we could just manually set that to an empty string for new users
// If possible try to set salt and iv for new users in the useEffect function below,
//  - This way the original loading of salt and iv are all done in the same place
//
// Extras:
//  - delete components/Test.tsx
//  - delete components/ui/dropdown-menu
//  - move contents of src/modules to src/lib, src/lib is required by shadcn-ui
//    - Or go to components.json file and change the alias for utils
//
// Shadcn-ui components we want to use:
//   - Alert Dialog (pop-up with user input)
//   - Data Table (use for main body of the page)
//
// Basic workflow
// 1. User logs in with email/username
// 2. UserInfo is fetched from DB in the form of { salt, iv, vault }
// 3. Prompt user for password, and attempt to decrypt the vault
//      - What happens if user inputs wrong password?
//        - ANSWER: We can detect if decryption fails because it will try to throw an error
//    If there is no existing vault, this should display a dialog to create/confirm a new password
export default function Home() {
  // You should probably rename this to userInfo
  // We will need a seperate state var to hold the unecrypted vault contents
  // Consider also rename UserInfo.vault to UserInfo.EncryptedVault
  //
  // Also these declarations can be simplified like so:
  // const [state, setState] = useState<CustomType>();
  //  - Then the state var will have type undefined | CustomType
  const [vault, setVault] = useState<null | UserInfo>(null)
  const [fullKey, setFullKey] = useState<null | CryptoKey>(null)

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/vault');
      // const { salt, iv, vault }: UserInfo = await res.json()
      // console.log({ salt, iv, vault })
      const userInfo: UserInfo = await res.json();
      console.log(userInfo)
      if (!userInfo.vault) {
        console.log('no vault found')
        return setVault(userInfo)
        // return setVault({
        //   username: userInfo.username,
        //   vault: '',
        //   iv: '',
        //   salt: '',
        // })
      }
      // Get password from user and decrypt vault
      // THIS IS ENTIRELY EXPERIMENTAL, no idea if it actually works
      // const password = window.prompt('Please input your password')
      // if (password) {
      //   return setVault(JSON.parse(
      //     await decrypt(
      //       vault,
      //       await getFullKey('string', Buffer.from(salt, 'base64')),
      //       Buffer.from(iv, 'base64')
      //     )
      //   ))
      // }
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
      // getFullKey('wrongPassword', salt).then(fullKey => {
      //   decrypt(encrypted, fullKey, iv).then(decrypted => {
      //     console.log('wrong password', decrypted)
      //   }).catch(err => console.log('DECRYPTION FAILED'))
      // })
    })
  })

  return (
    <div>
      <div className='p-8 flex justify-between items-center'>
        <h1 className='text-4xl font-bold'>Password Manager</h1>
        <div className='flex items-center gap-4'>
          {vault && vault.username ? <h1 className='text-xl'>{vault.username}</h1> : []}
          <UserButton />
          <ToggleTheme />
        </div>
      </div>
      {vault === null ? <h1>LOADING...</h1> : 
        fullKey === null ? <GetPassword fullKey={fullKey} setFullKey={setFullKey} vault={vault} setVault={setVault} /> :
          <div>
            <h1>This is where the passwords go</h1>
          </div>
      }
      <Button>Upload</Button>
    </div>
  );
}
