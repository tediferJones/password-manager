import { useState } from 'react';
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff } from 'lucide-react';

export default function PasswordForm({
  match,
  confirmMatch,
  confirmOld,
}: {
  match?: boolean,
  confirmMatch: Function,
  confirmOld?: boolean
}) {
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [showOldPwd, setShowOldPwd] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);

  return (
    <>
      {!confirmOld ? [] : 
        <div className='grid grid-cols-4 items-center gap-4'>
          <Label htmlFor='password' className='text-center'>
            Old Password
          </Label>
          <div className='col-span-3 flex'>
            <Input
              id='oldPassword'
              className='col-span-3'
              minLength={8}
              maxLength={64}
              required
              type={showOldPwd ? 'text' : 'password'}
            />
            <button type='button' onClick={() => setShowOldPwd(!showOldPwd)} aria-label='toggle old password visibility'>
              {showOldPwd ? <EyeOff className='h-4 w-4 mx-4' /> : 
                <Eye className='h-4 w-4 mx-4'/>
              }
            </button>
          </div>
        </div>
      }
      <div className='grid grid-cols-4 items-center gap-4'>
        <Label htmlFor='password' className='text-center'>
          {confirmOld ? 'New Password' : 'Password'}
        </Label>
        <div className='col-span-3 flex'>
          <Input
            id='password'
            className='col-span-3'
            minLength={8}
            maxLength={64}
            required
            type={showPwd ? 'text' : 'password'}
            onChange={() => {
              if (match) setPasswordsMatch(confirmMatch());
            }}
          />
          <button type='button' onClick={() => setShowPwd(!showPwd)} aria-label='toggle new password visibility'>
            {showPwd ? <EyeOff className='h-4 w-4 mx-4' /> : 
              <Eye className='h-4 w-4 mx-4'/>
            }
          </button>
        </div>
      </div>
      {!match ? [] :
        <div className='grid grid-cols-4 items-center gap-4' aria-label='toggle confirm password visibility'>
          <Label htmlFor='confirm' className='text-center'>
            Confirm
          </Label>
          <div className='col-span-3 flex'>
            <Input
              id='confirm'
              className={`col-span-3 ${passwordsMatch ? '' : 'border-red-500 border-2'}`}
              minLength={8}
              maxLength={64}
              required
              type={showNewPwd ? 'text' : 'password'}
              onChange={() => {
                if (match) setPasswordsMatch(confirmMatch());
              }}
            />
            <button type='button' onClick={() => setShowNewPwd(!showNewPwd)}>
              {showNewPwd ? <EyeOff className='h-4 w-4 mx-4' /> : 
                <Eye className='h-4 w-4 mx-4'/>
              }
            </button>
          </div>
        </div>
      }
    </>
  )
}
