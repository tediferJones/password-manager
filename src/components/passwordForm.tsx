import { useState } from "react";
import { Input } from "./ui/input"
import { Label } from "./ui/label"

export default function PasswordForm({
  match,
  confirmMatch,
  confirmOld
}: {
  match?: boolean,
  confirmMatch: Function,
  confirmOld?: boolean
}) {
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  return (
    <>
      {!confirmOld ? [] : 
        <div className='grid grid-cols-4 items-center gap-4'>
          <Label htmlFor='password' className='text-center'>
            Old Password
          </Label>
          <Input
            id='oldPassword'
            className='col-span-3'
            minLength={8}
            required
          />
        </div>
      }
      <div className='grid grid-cols-4 items-center gap-4'>
        <Label htmlFor='password' className='text-center'>
          {confirmOld ? 'New Password' : 'Password'}
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

    </>
  )
}
