'use client';

// This is nextjs's optimized way of sending images
// import Image from 'next/image';
import { UserButton } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { ToggleTheme } from '@/components/toggleTheme';
import { Button } from '@/components/ui/button';
import GetPassword from '@/components/getPassword';
import MyTable from '@/components/table/myTable';
import UserSettings from '@/components/userSettings';
import { encrypt, getFullKey } from '@/lib/security';
import { EditVaultParams, Entry, UserInfo, VaultInfo } from '@/types';

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
// Edit lib/security, all functions should take salt and iv as base64 strings
//  - see if we can use base64 everywhere, especially for the plaintext and password
// Salt and IV are always recycled, fix this, see notes above
//  - IV is now changed everytime vault is updated
//  - Make sure salt is unique in api when new vault is created
// Add an extra conditional to the render chain that checks for a vault, else displays an error message
// [ DONE ] Search bar only searches by userId, create a checkbox dropdown like the columns selector to choose what columns we're searching in
// [ DONE ] It would be nice we indicated which columns are being sorted, also the X should only appear if it is being sorted
// Implement input validation module from chat-bun
//  - FOR BACKEND
//    - All we can really do is check if salt and iv are a reasonable length
//    - We could also check if all strings are base64
//  - FOR FRONTEND
//    - We can only check that all fields are required and of reasonable length
//      - This can all be done through html form validation
// [ DONE ] Try to merge useEffect functions in app/page.tsx
// [ DONE ] Consider moving capAndSplit function to src/lib
// [ DONE ] Improve editVault function
// [ DONE ] Add the eye icon, use this everywhere that we want to show/hide passwords
// Try extract repetative html to components
//  - [ DONE ] Create rowActions component for dropdown
//  - [ DONE ] Create form component to easily create forms
//    - [ DONE ] Rename addEntry to entryForm
//    - [ DONE ] change addEntry calls to dialog box, just like the update dialog in rowActions component
//    - [ DONE ] Use the new entryForm component in this replacement dialog box
//    - [ DONE ] Entry form should be able to optionally take values
//  - addEntry component has been replaced by entryForm
//    - Delete addEntry if it's no longer needed
// Add a settings menu, should have these options:
//  - [ DONE ] Change password
//  - Export existing entries
//  - Import new entries
// Add a 'syncing' indicator (like a red/green line)
//  - when vault changes display 'out of sync' indicator (red)
//  - when server returns set status based on return res status (if status === 200 then vault is in sync)
// [ DONE ] Add skip button tableOptions update modal
// [ DONE ] Add password view toggles to getPassword component and password reset dialog
// Re-organize getPassword props
// Breakup tableOptions, each button should get its own component
// Add random password generator to GetPassword component, only when setting up a new user
// [ DONE ] Add confirmation dialog to password reset form
// Fix Entry type, sharedWith should be required
// Add index.tsx to src/components?
//  - That way we can import multiple components in one line
// Move src/db.ts to src/drizzle/db.ts
// Apparently we dont need to verify users in api routes, this is already taken care of by clerk
//
// How do we want to handle password sharing?
// Table format:
// id: number
// recipient: string ('tediferJones671')
// entry: Entry ({ service, userId, password, sharedWith, newService? })

export default function Home() {
  const [userInfo, setUserInfo] = useState<UserInfo>();
  const [fullKey, setFullKey] = useState<CryptoKey>();
  const [vaultData, setVaultData] = useState<VaultInfo>();

  useEffect(() => {
    (async () => {
      if (!userInfo) {
        const res = await fetch('/api/vault');
        const userInfo: UserInfo = await res.json();
        // console.log('Fetched user info', userInfo)

        const newShares = await fetch('/api/share').then(res => res.json())
        console.log('newShares', newShares)

        setUserInfo({
          username: userInfo.username,
          vault: userInfo.vault || '',
          iv: userInfo.iv || crypto.getRandomValues(Buffer.alloc(12)).toString('base64'),
          salt: userInfo.salt || crypto.getRandomValues(Buffer.alloc(32)).toString('base64'),
        })
        return
      }
      console.log('\n\n\n\nVAULT DATA HAS CHANGED\n\n\n\n');
      if (vaultData && fullKey) {
        console.log('UPDATING DATA')
        console.log(userInfo)
        const newIv = crypto.getRandomValues(Buffer.alloc(12)).toString('base64');
        const newUserInfo = {
          ...userInfo,
          iv: newIv,
          vault: await encrypt(JSON.stringify(vaultData), fullKey, newIv),
        }
        fetch('/api/vault', {
          method: 'POST',
          headers:  {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newUserInfo),
        });
        setUserInfo(newUserInfo)
        return 
      } 
    })();
  }, [vaultData, fullKey])

  function editVault({ action, keys }: EditVaultParams): string | undefined {
    const actions = {
      add: (vaultData: VaultInfo, keys: Entry[]) => {
        return keys.reduce((newObj, entry) => {
          if (!Object.keys(vaultData).includes(entry.service)) {
            return {
              ...newObj,
              [entry.service]: {
                userId: entry.userId,
                password: entry.password,
                sharedWith: [],
              }
            }
          }
          console.log('ENTRY ALREADY EXISTS')
          return newObj;
        }, vaultData)
      },
      remove: (vaultData: VaultInfo, keys: Entry[]) => {
        return keys.reduce((newObj, key) => {
          return (({ [key.service]: deletedKey, ...rest }) => rest)(newObj)
        }, vaultData)
      },
      update: (vaultData: VaultInfo, keys: Entry[]) => {
        // If the update command is used, keys should have both service and newService
        // service is the name of the original, newService is the updated name
        return actions.add(
          actions.remove(vaultData, keys),
          keys.filter(entry => entry.newService).map(({ newService, ...rest }) => {
            return { ...rest, service: newService, }
          }) as Entry[]
        );
      }
    }

    if (vaultData) {
      const services = Object.keys(vaultData);
      if (action === 'add' && keys.some(key => services.includes(key.service))) {
        console.log('found error in editVault')
        return 'Service name already exists'
      }

      if (action === 'update') {
        if (keys.some(key => key.newService && (key.service !== key.newService) && services.includes(key.newService))) {
          console.log('Prevented update cuz new name already exists')
          return 'Service name already exists'
        }
      }

      // Check for existing service names before we modify vault
      setVaultData(actions[action](vaultData, keys))
    }
  }

  return (
    <div>
      <div className='p-8 flex justify-between items-center flex-col sm:flex-row border-b-[1px] mb-8'>
        <h1 className='text-3xl font-bold text-center'>Password Manager</h1>
        <div className='flex items-center gap-4'>
          {userInfo && userInfo.username ? <h1 className='text-lg'>{userInfo.username}</h1> : []}
          <UserButton />
          {!userInfo ? [] : <UserSettings {...{ userInfo, setFullKey }} />}
          <ToggleTheme />
        </div>
      </div>
      {!userInfo ? 
        <Button className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none'>
          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
          Please wait
        </Button> :
        <div className='w-11/12 md:w-4/5 mx-auto pb-12'>
          {fullKey ? [] : 
            // <GetPassword fullKey={fullKey} setFullKey={setFullKey} userInfo={userInfo} setVault={setVaultData} />
            <GetPassword {...{fullKey, setFullKey, userInfo, setVault: setVaultData, vaultData}}/>
          }
          {!vaultData ? [] : 
            <MyTable
              data={Object.keys(vaultData).map(key => ({ ...vaultData[key], service: key, })).toReversed()} // To reversed so its in order from most recent
              editVault={editVault}
            />
          }
        </div>
      }
    </div>
  );
}
