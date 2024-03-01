import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Entry } from '@/types';
import { Button } from '../ui/button';
import { Trash2 } from 'lucide-react';

export default function ShareForm({ entry }: { entry?: Entry }) {
  const [shareWith, setShareWith] = useState('');
  const [recipientExists, setRecipientExists] = useState(false);

  useEffect(() => {
    let delay: any;
    if (shareWith) {
      delay = setTimeout(() => {
        fetch(`/api/users/${shareWith}`)
          .then(res => res.json())
          .then(body => setRecipientExists(body.userExists))
          .catch(err => console.log('this is an error', err))
      }, 100)
    }
    return () => clearTimeout(delay)
  }, [shareWith]);

  return (
    <>
      {entry?.sharedWith.map(username => {
        return <div
          key={`${entry.owner}-${entry.service}-${username}`}
          className='flex justify-center items-center gap-4 p-4 w-4/5 mx-auto'
        >
          <p className='w-full text-center'>
            {username}
          </p>
          <Button type='button'
            variant='destructive'
            onClick={(e) => {
            console.log('remove user from sharedWith', e)
          }}>
            <Trash2 className='w-4 h-4' />
          </Button>
        </div>
      })}
      <div className='grid grid-cols-4 items-center gap-4'>
        <Label htmlFor='recipient'
          className='text-center'
        >Recipient</Label>
        <Input
          className={`col-span-3 border-2 ${!shareWith ? '' : recipientExists ? 'border-green-500' : 'border-red-500'}`} 
          id='recipient'
          required
          onChange={(e) => setShareWith(e.currentTarget.value)}
        />
        <input id='usernameIsValid'
          type='hidden'
          aria-checked={recipientExists}
          onChange={() => {}}
        />
      </div>
    </>
  )
}
