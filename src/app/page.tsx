'use client';

// This is nextjs's optimized way of sending images
// import Image from 'next/image';
import { UserButton } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { ToggleTheme } from '@/components/subcomponents/toggleTheme';
import { Button } from '@/components/ui/button';
import DecryptVault from '@/components/decryptVault';
import MyTable from '@/components/table/myTable';
import UserSettings from '@/components/subcomponents/userSettings';
import { encrypt, getRandBase64 } from '@/lib/security';
import { Actions, Entry, UserInfo } from '@/types';
import { actionErrors, vaultActions } from '@/lib/vaultActions';

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
// What to do next:
// Edit lib/security, all functions should take salt and iv as base64 strings
//  - see if we can use base64 everywhere, especially for the plaintext and password
// Salt and IV are always recycled, fix this, see notes above
//  - IV is now changed everytime vault is updated
//  - Make sure salt is unique in api when new vault is created
// Add an extra conditional to the render chain that checks for a vault, else displays an error message
//  - Move loading spinner to its own component
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
// Add index.tsx to src/components?
//  - That way we can import multiple components in one line
// Apparently we dont need to verify users in api routes, this is already taken care of by clerk
//  - Check api routes, remove user is logged logic
// Due to the way we share entries, usernames are now considered sensitive data
//  - Thus we should change the way vaults are stored in the DB so that username is a hash of the current user's username
// UserInfo and Share types are essentially the same
//  - Think about merging these types into EncryptedData or something like that
// There is a bug in vaultActions module
//  - If current user is not the owner of the entry we should return an error message
// NEED TO TEST VAULT ACTION FUNCTIONS, editVault AND ERROR HANDLING
// We should probably display owner and shared with in pending form, this will help identify where the record comes from
// Move upload function from vaultActions to its own module
//  - Make it something like easyFetch()
// USE UUID IN VAULT ACTIONS, in function and error handling
//  - But maintain the idea that one owner cant have multiple entries with the same service name
// Add a button to pending shares form to remove shared entry from DB without adding it to vault
// Add a link in decryptPassword to reset users vault
//  - This will send a DELETE request to /api/vault and reset the users vault
//  - This is useful if a user has forgetten their password
// Clean up vaultActions, tableOptions, as well as shareForm and/or customDialog
// [ DONE ] Create dialog to share multiple
// [ DONE ] Fix pending shares, if username does not exist in sharedWith, add that entry to existing entries,
//  - [ DONE ] this way an unshared entry cant be seen in pending shares
//  - [ DONE ] This would happen if userA shares and entry with userB and then removes userB from share list
//    - [ DONE ] The db will still contain a pending share for userB, that does not exist in their vault, so it will show up under pending
 
export default function Home() {
  const [userInfo, setUserInfo] = useState<UserInfo>();
  const [fullKey, setFullKey] = useState<CryptoKey>();
  const [vault, setVault]= useState<Entry[]>();

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
        console.log('Pushing vault to DB')
        // console.log(JSON.stringify(vault))
        const newIv = getRandBase64('iv')
        const newUserInfo = {
          ...userInfo,
          iv: newIv,
          vault: await encrypt(JSON.stringify(vault), fullKey, newIv),
        }
        fetch('/api/vault', {
          method: 'POST',
          headers:  { 'Content-Type': 'application/json' },
          body: JSON.stringify(newUserInfo),
        });
        setUserInfo(newUserInfo);
      } 
    })();
  }, [vault, fullKey])

  function editVault(action: Actions, toChange: Entry[]): string | undefined {
    if (!vault || !userInfo) return 'Error, no vault or userInfo found'

    // Check for errors before editing vault
    const errorMsg = Object.keys(actionErrors[action]).find(errMsg => {
      return toChange.some(entry => {
        return actionErrors[action][errMsg](vault, entry, userInfo)
      })
    });
    if (errorMsg) return errorMsg;

    // console.log('blocking all vault changes')
    setVault(
      vaultActions[action](
        vault,
        toChange,
        userInfo,
      )
    );
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
          {fullKey ? [] : <DecryptVault {...{ userInfo, setFullKey, vault, setVault }} />}
          {!vault ? [] : <MyTable data={vault.toReversed()} {...{ editVault, userInfo }} />}
        </div>
      }
    </div>
  );
}
