'use client';

// This is nextjs's optimized way of sending images
// import Image from 'next/image';
import { UserButton } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { encrypt } from '@/lib/security';
import { TableColumns, UserInfo, VaultInfo } from '@/types';
import { ToggleTheme } from '@/components/toggleTheme';
import GetPassword from '@/components/getPassword';
import MyTable from '@/components/table/myTable';
import { columns } from '@/components/table/columns';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

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
// Edit modules/security, all functions should take salt and iv as base64 strings
//  - see if we can use base64 everywhere, especially for the plaintext and password
// Salt and IV are always recycled, fix this, see notes above
//  - IV is now changed everytime vault is updated
//  - Make sure salt is unique in api when new vault is created
// Add an extra conditional to the render chain that checks for a vault, else displays an error message
// Search bar only searches by userId, create a checkbox dropdown like the columns selector to choose what columns we're searching in
// It would be nice we indicated which columns are being sorted, also the X should only appear if it is being sorted
// Implement input validation module from chat-bun
// Add a settings menu, should have these options:
//  - Change password
//  - Export existing entries
//  - Import new entries

export default function Home() {
  const [userInfo, setUserInfo] = useState<UserInfo>();
  const [fullKey, setFullKey] = useState<CryptoKey>();
  const [vaultData, setVaultData] = useState<VaultInfo>({});

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/vault');
      const userInfo: UserInfo = await res.json();
      console.log(userInfo)

      return setUserInfo({
        username: userInfo.username,
        vault: userInfo.vault || '',
        iv: userInfo.iv || crypto.getRandomValues(Buffer.alloc(12)).toString('base64'),
        salt: userInfo.salt || crypto.getRandomValues(Buffer.alloc(32)).toString('base64'),
      })
    })();
  }, []);

  useEffect(() => {
    (async () => {
      console.log('\n\n\n\nVAULT DATA HAS CHANGED\n\n\n\n');
      if (vaultData && fullKey && userInfo) {
        console.log('UPDATING DATA')
        console.log(userInfo)
        const newIv = crypto.getRandomValues(Buffer.alloc(12)).toString('base64');
        // const encVault = await encrypt(JSON.stringify(vaultData), fullKey, userInfo.iv)
        const encVault = await encrypt(JSON.stringify(vaultData), fullKey, newIv)
        fetch('/api/vault', {
          method: 'POST',
          headers:  {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...userInfo,
            iv: newIv,
            vault: encVault,
          }),
        });
      }
    })();
  }, [vaultData]);

  function editVault(action: string, keys: any[]) {
  // function editVault({ action, keys }: { action: 'add', keys: TableColumns[] } | { action: 'remove', keys: string[] }) {
    // if actions is add, keys is string arr
    // if action is remove, keys is a object arr
    const modifier = {
      add: (vaultData: VaultInfo) => {
        const testObj = JSON.parse(JSON.stringify(vaultData));

        return keys.reduce((newObj, entry) => {
          // Check if key already exists
          if (Object.keys(vaultData).includes(entry.service)) {
            console.log('ALREADY EXISTS, ADD A REAL ERROR MESSAGE FOR THIS')
            return newObj
          }

          newObj[entry.service] = {
            userId: entry.userId,
            password: entry.password,
            sharedWith: [],
          }
          return newObj
        }, testObj)
      },
      remove: (vaultData: VaultInfo) => {
        return keys.reduce((newObj, key) => {
          return (({ [key]: deletedKey, ...rest }) => rest)(newObj)
        }, vaultData)
      },
    }[action];

    if (vaultData && modifier) {
      const newVault = modifier(vaultData);
      console.log('NEW VAULT', newVault)
      setVaultData(newVault)
    }
  }

  return (
    <div>
      <div className='p-8 flex justify-between items-center flex-col sm:flex-row'>
        <h1 className='text-4xl font-bold'>Password Manager</h1>
        <div className='flex items-center gap-4'>
          {userInfo && userInfo.username ? <h1 className='text-xl'>{userInfo.username}</h1> : []}
          <UserButton />
          <ToggleTheme />
        </div>
      </div>
      {!userInfo ? 
        <Button className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none'>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Please wait
        </Button> :
        !fullKey ? <GetPassword match={!userInfo.vault} setFullKey={setFullKey} userInfo={userInfo} setVault={setVaultData}/> :
          <div className='w-11/12 md:w-4/5 mx-auto pb-12'>
            <MyTable columns={columns} 
              data={Object.keys(vaultData).map(key => ({ ...vaultData[key], service: key, })).toReversed()} // To reversed so its in order from most recent
              editVault={editVault}
            />
          </div>
      }
    </div>
  );
}
