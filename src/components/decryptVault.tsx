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
import PasswordForm from '@/components/forms/passwordForm'
import GeneratePassword from '@/components/subcomponents/generatePassword'
import CustomDialog from './subcomponents/customDialog'
import easyFetch from '@/lib/easyFetch'

export default function DecryptVault({ 
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
  const [confirmIsOpen, setConfirmIsOpen] = useState(false);
  const [errorMsgs, setErrorMsgs] = useState<string[]>([])
  const form = useRef<HTMLFormElement>(null);
  const match = !userInfo.vault;

  function confirmMatch() {
    return form.current && form.current.password.value === form.current.confirm.value
  }

  const confirmReset = (
    <span className='underline cursor-pointer'
      onClick={() => setConfirmIsOpen(!confirmIsOpen)}
    >here</span>
  )

  return (
    <AlertDialog defaultOpen open={!fullKey}>
      <AlertDialogContent onEscapeKeyDown={(e) => e.preventDefault()}>
        <AlertDialogHeader>
          <AlertDialogTitle>Please enter your password to continue</AlertDialogTitle>
          {match ? [] :
            <AlertDialogDescription>
              If you have forgetten your password, click {confirmReset} to reset your vault
            </AlertDialogDescription>
          }
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
              <GeneratePassword
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
      <CustomDialog 
        action='confirm'
        extOpenState={[confirmIsOpen, setConfirmIsOpen]}
        description='This will delete your existing vault. Please be careful, this action cannot be undone'
        submitFunc={(e, state) => {
          e.preventDefault();
          easyFetch('/api/vault', 'DELETE')
          window.location.reload();
        }}
      />
    </AlertDialog>
  )
}
