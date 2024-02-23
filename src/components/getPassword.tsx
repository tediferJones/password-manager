import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

import { useRef, useState } from 'react'
import { UserInfo } from '@/types'
import { decrypt, getFullKey } from '@/lib/security'
import PasswordForm from './passwordForm'
import GetRandomString from './getRandomString'

export default function GetPassword({ 
  setFullKey,
  userInfo,
  setVault,
  fullKey,
}: {
  setFullKey: Function,
  userInfo: UserInfo,
  setVault: Function,
  fullKey?: CryptoKey,
}) {
  const [errorMsgs, setErrorMsgs] = useState<string[]>([])
  const form = useRef<HTMLFormElement>(null);
  const match = !userInfo.vault;

  function confirmMatch() {
    return form.current && form.current.password.value === form.current.confirm.value
  }

  return (
    <AlertDialog defaultOpen open={!fullKey}>
      <AlertDialogContent onEscapeKeyDown={(e) => e.preventDefault()}>
        <AlertDialogHeader>
          <AlertDialogTitle>Please enter your password to continue</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div>
              <div>This password cannot be reset, you're data cannot be accessed without this password</div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        {errorMsgs.length === 0 ? [] :
          <div className='text-red-500 flex justify-center'>
            {errorMsgs.map((msg, i) => <div key={`getPasswordError-${i}`}>{msg}</div>)}
          </div>
        }
        <form ref={form} className='grid gap-4 py-4'
          onSubmit={async (e) => {
          e.preventDefault()

          if (!userInfo.vault && !confirmMatch()) return console.log('Passwords do not match')

          const fullKey = await getFullKey(e.currentTarget.password.value, userInfo.salt);
          let decryptedVault;
          try {
            decryptedVault = userInfo.vault ? JSON.parse(await decrypt(userInfo.vault, fullKey, userInfo.iv)) : [];
          } catch {
            setErrorMsgs(['Password is not correct'])
            return;
          }
          setFullKey(fullKey)
          setVault(decryptedVault)
        }}>
          <PasswordForm confirmMatch={confirmMatch} match={match} />
          <AlertDialogFooter>
            {!match ? [] : 
              <GetRandomString
                buttonText='Generate'
                secondary
                func={(pwd) => {
                  if (form.current) {
                    form.current.password.value = pwd
                    form.current.confirm.value = pwd
                  }
                }}
              />
            }
            <AlertDialogAction type='submit'>
              {match ? 'Create Vault' : 'Decrypt Vault'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
