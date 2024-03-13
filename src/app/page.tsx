'use client';

import { UserButton } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { ToggleTheme } from '@/components/subcomponents/toggleTheme';
import { Button } from '@/components/ui/button';
import DecryptVault from '@/components/decryptVault';
import MyTable from '@/components/table/myTable';
import UserSettings from '@/components/subcomponents/userSettings';
import Loading from '@/components/subcomponents/loading';
import { encrypt, getRandBase64 } from '@/lib/security';
import { Actions, Entry, UserInfo } from '@/types';
import { actionDialog, actionErrors, vaultActions } from '@/lib/vaultActions';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/components/ui/use-toast';
import easyFetch from '@/lib/easyFetch';

// Apparently salt and iv can be stored in the db next to the encrypted data
//   - Salt should always be unique (we cant guarantee every password is unique)
//   - Rotate IV every time we re-encrypt the data
//   - Recommended to iterate hash 2^(Current Year - 2000) times, so we want 2^24 which is 16777216
// More Info: https://security.stackexchange.com/questions/177990/what-is-the-best-practice-to-store-private-key-salt-and-initialization-vector-i
//
// Optional:
// Edit lib/security, all functions should take salt and iv as base64 strings
//  - see if we can use base64 everywhere, especially for the plaintext and password
// Add a 'syncing' indicator (like a red/green line)
//  - when vault changes display 'out of sync' indicator (red)
//  - when server returns set status based on return res status (if status === 200 then vault is in sync)
// Add index.tsx to src/components?
//  - That way we can import multiple components in one line
//
// What to do next:
// UserInfo and Share types are essentially the same
//  - Think about merging these types into EncryptedData or something like that
// Do we want to use Actions type to replace action type in CustomDialog?
//  - The types do not entirely overlap, which could be problematic
// Remove all console.log statements
// Style details dialog
// Toaster should pop-up 'copied' when something is copied to the clipboard

export default function Home() {
  const [userInfo, setUserInfo] = useState<UserInfo>();
  const [fullKey, setFullKey] = useState<CryptoKey>();
  const [vault, setVault]= useState<Entry[]>();
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      if (!userInfo) {
        const userInfo: UserInfo = await easyFetch('/api/vault', 'GET')
        setUserInfo({
          username: userInfo.username,
          vault: userInfo.vault || '',
          iv: userInfo.iv || getRandBase64('iv'),
          salt: userInfo.salt || getRandBase64('salt'),
        })
      } else if (vault && fullKey) {
        console.log('Pushing vault to DB')
        const newIv = getRandBase64('iv')
        const newUserInfo = {
          ...userInfo,
          iv: newIv,
          vault: await encrypt(JSON.stringify(vault), fullKey, newIv),
        }
        easyFetch('/api/vault', 'POST', newUserInfo)
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

    toast({
      title: actionDialog[action](toChange.length),
      duration: 1500,
    })

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
      <div className='p-8 flex justify-between items-center gap-4 flex-col sm:flex-row border-b-[1px]'>
        <h1 className='text-3xl font-bold text-center'>Password Manager</h1>
        <div className='flex items-center gap-4'>
          {userInfo && userInfo.username ? <h1 className='text-lg'>{userInfo.username}</h1> : []}
          <UserButton />
          {!userInfo || !vault ? [] : <UserSettings {...{ userInfo, setFullKey, vault, setVault }} />}
          <ToggleTheme />
        </div>
      </div>
      {!userInfo ?  <Loading />
        : !fullKey ? <DecryptVault {...{ userInfo, setFullKey, vault, setVault }} />
          : vault ? <MyTable data={vault.toReversed()} {...{ editVault, userInfo }} />
            : <Button className='p-8 text-xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
              variant='outline'
              onClick={() => window.location.reload()}
            >Something went wrong, please reload the page</Button>
      }
      <Toaster />
    </div>
  );
}
