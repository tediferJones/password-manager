'use client';

import { UserButton } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { ToggleTheme } from '@/components/subcomponents/toggleTheme';
import { Button } from '@/components/ui/button';
import DecryptVault from '@/components/decryptVault';
import MyTable from '@/components/table/myTable';
import UserSettings from '@/components/subcomponents/userSettings';
import Loading from '@/components/subcomponents/loading';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/components/ui/use-toast';
import { encrypt, getRandBase64 } from '@/lib/security';
import { actionDialog, actionErrors, vaultActions } from '@/lib/vaultActions';
import easyFetch from '@/lib/easyFetch';
import { Actions, Entry, UserInfo } from '@/types';

export default function Home() {
  const [userInfo, setUserInfo] = useState<UserInfo>();
  const [fullKey, setFullKey] = useState<CryptoKey>();
  const [vault, setVault]= useState<Entry[]>();
  const [isSynced, setIsSynced] = useState<boolean>();
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      if (!userInfo) {
        const userInfo: UserInfo = await easyFetch('/api/vault', 'GET');
        setUserInfo({
          username: userInfo.username,
          vault: userInfo.vault || '',
          iv: userInfo.iv || getRandBase64('iv'),
          salt: userInfo.salt || getRandBase64('salt'),
        });
      } else if (vault && fullKey) {
        setIsSynced(false);
        const newIv = getRandBase64('iv');
        const newUserInfo = {
          ...userInfo,
          iv: newIv,
          vault: await encrypt(JSON.stringify(vault), fullKey, newIv),
        };
        setUserInfo(newUserInfo);
        const updateRes = await easyFetch('/api/vault', 'POST', newUserInfo, true);
        if (updateRes?.ok) {
          setIsSynced(true);
          setTimeout(() => setIsSynced(undefined), 1000);
        }
      } 
    })();
  }, [vault, fullKey]);

  function editVault(action: Actions, toChange: Entry[]): string | undefined {
    if (!vault || !userInfo) return 'Error, no vault or userInfo found'

    // Check for errors before editing vault
    const errorMsg = Object.keys(actionErrors[action]).find(errMsg => {
      return toChange.some(entry => {
        return actionErrors[action][errMsg](vault, entry, userInfo);
      });
    });
    if (errorMsg) return errorMsg;

    toast({
      title: actionDialog[action](toChange.length),
      duration: 1000,
    });

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
      <div className={`animate-pulse transition-colors duration-1000 bg-gradient-to-b h-1 w-full ${isSynced === undefined ? '' : isSynced ? 'from-green-500' : 'from-red-500'}`}></div>
      {!userInfo ?  <Loading />
        : !fullKey ? <DecryptVault {...{ userInfo, setFullKey, vault, setVault }} />
          : vault ? <MyTable data={vault.map((_, i, arr) => arr[arr.length - 1 - i])} {...{ editVault, userInfo }} />
            : <Button className='p-8 text-xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
              variant='outline'
              onClick={() => window.location.reload()}
            >Something went wrong, please reload the page</Button>
      }
      <Toaster />
    </div>
  );
}
