import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Entry } from "@/types";
import { Eye, EyeOff } from "lucide-react";

export default function EntryForm({ entry, shared }: { entry?: Entry, shared?: boolean }) {
  const [showPwd, setShowPwd] = useState(false);
  return (
    <>
      <div className='grid grid-cols-4 items-center gap-4'>
        <Label htmlFor='service' className='text-center'>
          Service
        </Label>
        <Input
          id='service'
          className='col-span-3'
          placeholder='amazon.com'
          required
          maxLength={64}
          defaultValue={entry ? entry.service : ''}
          disabled={shared}
        />
      </div>
      <div className='grid grid-cols-4 items-center gap-4'>
        <Label htmlFor='userId' className='text-center'>
          User ID
        </Label>
        <Input
          id='userId'
          className='col-span-3'
          placeholder='Email or Username'
          required
          maxLength={64}
          defaultValue={entry ? entry.userId : ''}
          disabled={shared}
        />
      </div>
      <div className='grid grid-cols-4 items-center gap-4'>
        <Label htmlFor='password' className='text-center'>
          Password
        </Label>
        <div className='col-span-3 flex'>
          <Input
            id='password'
            placeholder='myPassword123'
            required
            maxLength={64}
            type={showPwd ? 'text' : 'password'}
            defaultValue={entry ? entry.password : ''}
            disabled={shared}
          />
          <button type='button' onClick={() => setShowPwd(!showPwd)}>
            {showPwd ? <EyeOff className='h-4 w-4 mx-4' /> : 
              <Eye className='h-4 w-4 mx-4'/>
            }
          </button>
        </div>
      </div>
    </>
  )
}
