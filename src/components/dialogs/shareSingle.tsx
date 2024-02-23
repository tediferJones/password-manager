import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import ViewErrors from '@/components/viewErrors';
import { Row } from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import { encrypt, getFullKey, getHash, getRandBase64 } from '@/lib/security';
import { EditVaultFunction, Entry, Share } from '@/types';

export default function ShareSingle(editVault: EditVaultFunction, row: Row<Entry>){
  const [shareIsOpen, setShareIsOpen] = useState(false);
  const [shareErrors, setShareErrors] = useState<string[]>([]);
  const [shareWith, setShareWith] = useState('');
  const [recipientExists, setRecipientExists] = useState(false);

  useEffect(() => {
    let delay: any;
    if (shareWith) {
      delay = setTimeout(async () => {
        setShareErrors([]);
        const alreadyExists = row.original.sharedWith.includes(shareWith)
        if (alreadyExists) setShareErrors(['already shared with']);
        setRecipientExists(
          !alreadyExists && (await fetch(`/api/users/${shareWith}`).then(res => res.json())).userExists 
        )
      }, 100)
    }
    return () => clearTimeout(delay)
  }, [shareWith]);

  const trigger = (
    <DropdownMenuItem onSelect={() => setShareIsOpen(true)}>
      Share
    </DropdownMenuItem>
  )

  const content = (
    <Dialog open={shareIsOpen} onOpenChange={setShareIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Entry</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Are you sure you want to share this entry?
        </DialogDescription>
        <span className='text-center'>{row.original.service}</span>
        <form className='grid gap-4 py-4' onSubmit={async (e) => {
          e.preventDefault();
          const recipient = e.currentTarget.recipient.value;

          if (row.original.sharedWith.includes(recipient)) {
            console.log('already shared with')
            return
          }

          if (!recipientExists) {
            console.log('user does not exist')
            return
          }

          const newEntry: Entry = {
            ...row.original,
            sharedWith: row.original.sharedWith.concat(recipient)
          }

          const salt = getRandBase64('salt');
          const iv = getRandBase64('iv');
          const share: Share = {
            recipient: await getHash(recipient),
            salt,
            iv,
            sharedEntry: await encrypt(
              JSON.stringify(newEntry),
              await getFullKey(recipient, salt),
              iv,
            ),
          }
          const res = await fetch('/api/share', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(share)
          })
          if (res.status === 200) {
            editVault({
              action: 'update',
              toChange: [newEntry]
            })
          } else {
            throw Error('failed to share entry')
          }
        }}>
          <div>{JSON.stringify(row.original.sharedWith)}</div>
          <ViewErrors errors={shareErrors} name='shareErrors' />
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='recipient' className='text-center'>Recipient</Label>
            <Input className={`col-span-3 border-2 ${!shareWith ? '' : recipientExists ? 'border-green-500' : 'border-red-500'}`} 
              id='recipient'
              required
              onChange={(e) => setShareWith(e.currentTarget.value)}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant='secondary'>Cancel</Button>
            </DialogClose>
            <Button>Add Another User</Button>
            <Button type='submit'>Share</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )

  return [trigger, content];
}
