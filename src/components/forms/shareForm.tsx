import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Entry } from '@/types';
import capAndSplit from '@/lib/capAndSplit';

export default function ShareForm({ entry }: { entry?: Entry }) {
  const [shareWith, setShareWith] = useState('');
  const [recipientExists, setRecipientExists] = useState(false);

  useEffect(() => {
    let delay: NodeJS.Timeout | undefined;
    if (shareWith) {
      delay = setTimeout(() => {
        fetch(`/api/users/${shareWith}`)
          .then(res => res.json())
          .then(body => {
            if (!entry) throw Error('no entry found in shareForm')
            setRecipientExists(
              body.userExists && entry.owner !== shareWith && !entry.sharedWith.includes(shareWith)
            )
          })
      }, 100)
    }
    return () => clearTimeout(delay)
  }, [shareWith]);

  return (
    <>
      <div className='grid grid-cols-2 gap-4'>
        {!entry ? [] : ['service', 'owner', 'sharedWith', 'date'].map(key => {
          const contents = {
            sharedWith: entry.sharedWith.length ? entry.sharedWith.join(', ') : 'None',
            date: new Date(entry.date).toLocaleString(),
          }[key];
          return <p key={key}
            className='text-center'
          >{capAndSplit(key.split(''))}: {contents || entry[key]?.toString()}</p>
        })}
      </div>
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
