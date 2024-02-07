import {
  AlertDialog,
  AlertDialogAction,
  // AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  // AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

import { useRef, useState } from 'react'
import { UserInfo } from '@/types'

export default function GetPassword({ 
  fullKey,
  setFullKey,
  vault,
  setVault,
}: {
  fullKey: null | CryptoKey,
  setFullKey: Function,
  vault: null | UserInfo,
  setVault: Function,
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const form = useRef<HTMLFormElement>(null);

  function confirmMatch() {
    return form.current && form.current.password.value === form.current.confirm.value
  }

  return (
    <AlertDialog defaultOpen open={isOpen}>
      <AlertDialogContent onEscapeKeyDown={(e) => e.preventDefault()}>
        <AlertDialogHeader>
          <AlertDialogTitle>Please enter your password to continue</AlertDialogTitle>
          <AlertDialogDescription>
            This password cannot be reset, you're data cannot be accessed without this password
          </AlertDialogDescription>
        </AlertDialogHeader>
        <form ref={form} onSubmit={(e) => {
          e.preventDefault()
          console.log(e)
          if (confirmMatch()) {
            console.log('passwords match')
            if (vault?.vault) {
              console.log('found a vault on submit')
            } else {
              console.log('no vault found on submit')
            }
            setIsOpen(false);
          }
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
                onChange={() => setPasswordsMatch(!!confirmMatch())}
              />
            </div>
            {vault?.vault ? [] :
              <div className='grid grid-cols-4 items-center gap-4'>
                <Label htmlFor='confirm' className='text-center'>
                  Confirm
                </Label>
                <Input
                  id='confirm'
                  className={`col-span-3 ${passwordsMatch ? '' : 'border-red-500 border-2'}`}
                  minLength={8}
                  required
                  onChange={() => setPasswordsMatch(!!confirmMatch())}
                />
              </div>
            }
          </div>
          <AlertDialogFooter>
            <AlertDialogAction type='submit'>
              Decrypt Vault
            </AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// import { Button } from '@/components/ui/button'
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from '@/components/ui/dialog'
// import { Input } from '@/components/ui/input'
// import { Label } from '@/components/ui/label'
// 
// export default function GetPassword({ fullKey, setFullKey }: { fullKey: null | CryptoKey, setFullKey: Function }) {
//   return (
//     <Dialog defaultOpen>
//       {/*
//       <DialogTrigger asChild>
//         <Button variant='outline'>Edit Profile</Button>
//       </DialogTrigger>
//       */}
//       <DialogContent className='sm:max-w-[425px]'>
//         <DialogHeader>
//           <DialogTitle>Please enter your password to continue</DialogTitle>
//           <DialogDescription>
//             This password cannot be reset, you're data cannot be accessed without this password
//           </DialogDescription>
//         </DialogHeader>
//         <div className='grid gap-4 py-4'>
//           <div className='grid grid-cols-4 items-center gap-4'>
//             <Label htmlFor='password' className='text-center'>
//               Password
//             </Label>
//             <Input
//               id='password'
//               // defaultValue='Pedro Duarte'
//               className='col-span-3'
//             />
//           </div>
//           {fullKey ? [] :
//             <div className='grid grid-cols-4 items-center gap-4'>
//               <Label htmlFor='confirmPassword' className='text-center'>
//                 Confirm
//               </Label>
//               <Input
//                 id='confirmPassword'
//                 // defaultValue='@peduarte'
//                 className='col-span-3'
//               />
//             </div>
//           }
//         </div>
//         <DialogFooter>
//           <Button type='submit'>Decrypt Vault</Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   )
// }

// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from '@/components/ui/dialog'

// export default function GetPassword() {
//   return (
//     <Dialog defaultOpen>
//       <DialogTrigger>Open</DialogTrigger>
//       <DialogContent>
//         <DialogHeader>
//           <DialogTitle>Are you absolutely sure?</DialogTitle>
//           <DialogDescription>
//             This action cannot be undone. This will permanently delete your account
//             and remove your data from our servers.
//           </DialogDescription>
//         </DialogHeader>
//       </DialogContent>
//     </Dialog>
//   )
// }
