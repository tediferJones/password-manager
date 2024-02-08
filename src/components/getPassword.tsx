import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

import { useRef, useState } from 'react'
import { UserInfo } from '@/types'
import { decrypt, getFullKey } from '@/modules/security'

export default function GetPassword({ 
  setFullKey,
  userInfo,
  setVault,
  match,
  confirmOld,
}: {
  setFullKey: Function,
  userInfo: UserInfo,
  setVault: Function,
  match?: boolean,
  confirmOld?: boolean,
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [errorMsgs, setErrorMsgs] = useState<string[]>([])
  const form = useRef<HTMLFormElement>(null);

  function confirmMatch() {
    return form.current && form.current.password.value === form.current.confirm.value
  }

  return (
    <AlertDialog defaultOpen open={isOpen}>
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
        <form ref={form} onSubmit={async (e) => {
          e.preventDefault()
          console.log(e)
          console.log(userInfo)
          console.log(!userInfo.vault)
          if (!userInfo.vault && !confirmMatch()) return console.log('Passwords do not match')

          const fullKey = await getFullKey(e.currentTarget.password.value, userInfo.salt);
          let decryptedVault = '';
          try {
            decryptedVault = userInfo.vault ? JSON.parse(await decrypt(userInfo.vault, fullKey, userInfo.iv)) : {};
            console.log('decrypted vault', decryptedVault)
          } catch {
            console.log('DECRYPTION FAILED')
            setErrorMsgs(['Password is not correct'])
            return;
          }
          console.log('END OF FUNCTION')
          setFullKey(fullKey)
          setVault(decryptedVault)
        }}>
          <div className='grid gap-4 py-4'>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='password' className='text-center'>
                Password
              </Label>
              <Input
                id='password'
                className='col-span-3'
                minLength={8}
                required
                onChange={() => {
                  if (match) {
                    setPasswordsMatch(!!confirmMatch())
                  }
                }}
              />
            </div>
            {!match ? [] :
              <div className='grid grid-cols-4 items-center gap-4'>
                <Label htmlFor='confirm' className='text-center'>
                  Confirm
                </Label>
                <Input
                  id='confirm'
                  className={`col-span-3 ${passwordsMatch ? '' : 'border-red-500 border-2'}`}
                  minLength={8}
                  required
                  onChange={() => {
                    if (match) {
                      setPasswordsMatch(!!confirmMatch())
                    }
                  }}
                />
              </div>
            }
          </div>
          <AlertDialogFooter>
            <AlertDialogAction type='submit'>
              {match ? 'Create Vault' : 'Decrypt Vault'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
