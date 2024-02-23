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
import { encrypt, getRandBase64 } from '@/lib/security';
import { EditVaultParams, Entry, Share, UserInfo } from '@/types';
import { vaultActions } from '@/lib/vaultActions';

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
// Implement input validation module from chat-bun
//  - FOR BACKEND
//    - All we can really do is check if salt and iv are a reasonable length
//    - We could also check if all strings are base64
//  - FOR FRONTEND
//    - We can only check that all fields are required and of reasonable length
//      - This can all be done through html form validation
// Add a 'syncing' indicator (like a red/green line)
//  - when vault changes display 'out of sync' indicator (red)
//  - when server returns set status based on return res status (if status === 200 then vault is in sync)
// Re-organize getPassword props
// Breakup tableOptions, each button should get its own component
// Add index.tsx to src/components?
//  - That way we can import multiple components in one line
// Apparently we dont need to verify users in api routes, this is already taken care of by clerk
// Convert vault to Entry[], everything revolves around the table anyways so just make it an array
//  - Bonus: we get to use more array methods in updateVault func
// Create a getDialog component, it should return either [trigger, dialog] or fullDialoag based on isSplit prop
//  - This is going to be much harder than it may seem at first, think about how to handle all the goofy state vars
//    - Will moving it to its own component really simplify anything?
//  - This will help simplify rowActions, userSettings and tableOptions components
//  - Create src/components/subcomponents
//    - EntryForm and PasswordForm belong in here
// Add more safeties to share.
//  - Shouldn't be able to share or update an entry that you are not the owner of
//  - Should be able to remove users from share list
//    - This could be done in the share dialog
//    - Or we could try to implement a sub menu in the rowAction dropdown
//  - Add some kind of indicator for how many users this entry is shared with
//    - Could be shown in the rowActions drop down like so Share (15)
// Create subcomponents directory
// Due to the way we share entries, usernames are now considered sensitive data
//  - Thus we should change the way vaults are stored in the DB so that username is a hash of the current user's username

export default function Home() {
  const [userInfo, setUserInfo] = useState<UserInfo>();
  const [fullKey, setFullKey] = useState<CryptoKey>();
  const [vault, setVault]= useState<Entry[]>();
  // const [pendingShares, setPendingShares] = useState<Share[]>([]);

  useEffect(() => {
    (async () => {
      if (!userInfo) {
        const res = await fetch('/api/vault');
        const userInfo: UserInfo = await res.json();
        // console.log('Fetched user info', userInfo)

        setUserInfo({
          username: userInfo.username,
          vault: userInfo.vault || '',
          iv: userInfo.iv || getRandBase64('iv'),
          salt: userInfo.salt || getRandBase64('salt'),
        })
      } else if (vault && fullKey) {
        console.log('\n\n\n\nVAULT DATA HAS CHANGED\n\n\n\n');
        console.log('UPDATING DATA')
        console.log(userInfo)
        const newIv = getRandBase64('iv')
        const newUserInfo = {
          ...userInfo,
          iv: newIv,
          vault: await encrypt(JSON.stringify(vault), fullKey, newIv),
        }
        fetch('/api/vault', {
          method: 'POST',
          headers:  {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newUserInfo),
        });
        setUserInfo(newUserInfo)
      } 
    })();
  }, [vault, fullKey])

  function editVault({ action, toChange }: EditVaultParams): string | undefined {
    if (!vault) return
    // Check for existing service names before we modify vault

    const services = vault.map(entry => entry.service);
    if (action === 'add' && toChange.some(key => services.includes(key.service))) {
      console.log('found error in editVault')
      return 'Service name already exists'
    }

    if (action === 'update' && toChange.some(key => key.newService && (key.service !== key?.newService) && services.includes(key.newService))) {
      console.log('Prevented update cuz new name already exists')
      return 'Service name already exists'
    }

    console.log('edit vault')
    setVault(vaultActions[action](vault, toChange))
  }

  return (
    <div>
      <div className='p-8 flex justify-between items-center flex-col sm:flex-row border-b-[1px] mb-8'>
        <h1 className='text-3xl font-bold text-center'>Password Manager</h1>
        <div className='flex items-center gap-4'>
          {userInfo && userInfo.username ? <h1 className='text-lg'>{userInfo.username}</h1> : []}
          <UserButton />
          {!userInfo || !vault ? [] : <UserSettings {...{ userInfo, setFullKey, vault, setVault }} />}
          <ToggleTheme />
        </div>
      </div>
      {!userInfo ? 
        <Button className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none'>
          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
          Please wait
        </Button> :
        <div className='w-11/12 md:w-4/5 mx-auto pb-12'>
          {fullKey ? [] : <GetPassword {...{ userInfo, setFullKey, vault, setVault }} />}
          {!vault ? [] : <MyTable data={vault.toReversed()} {...{ editVault, userInfo }} />}
        </div>
      }
    </div>
  );
}
