import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { useState } from 'react';
import { Row } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CustomDialog from '@/components/customDialog';
import { EditVaultFunction, Entry, Share } from '@/types';
import { encrypt, getFullKey, getHash, getRandBase64 } from '@/lib/security';

export default function RowActions({ row, editVault }: { row: Row<Entry>, editVault: EditVaultFunction }) {
  const [isOpen, setIsOpen] = useState(false);
  const [editIsOpen, setEditIsOpen] = useState(false);
  const [shareIsOpen, setShareIsOpen] = useState(false);
  const [deleteIsOpen, setDeleteIsOpen] = useState(false);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='h-8 w-8 p-0' onClick={() => setIsOpen(!isOpen)}>
          <span className='sr-only'>Open menu</span>
          <MoreHorizontal className='h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' onEscapeKeyDown={() => setIsOpen(false)}>
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(row.getValue('userId'))}>
          Copy User Id 
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(row.getValue('password'))}>
          Copy Password
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onSelect={() => setEditIsOpen(!editIsOpen)}>
          Update
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onSelect={() => setDeleteIsOpen(!deleteIsOpen)}>
          Delete
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onSelect={() => setShareIsOpen(!shareIsOpen)}>
          Share
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => {
          console.log(row.original)
        }}>
          Details
        </DropdownMenuItem>
      </DropdownMenuContent>
      
      <CustomDialog 
        action='update'
        formData={[row.original]}
        extOpenState={[editIsOpen, setEditIsOpen]}
        submitFunc={(e, state) => {
          e.preventDefault();
          console.log('submitted', state)
          state.setErrors([]);
          const error = editVault({
            action: 'update',
            toChange: [{
              ...row.original,
              newService: e.currentTarget.service.value,
              userId: e.currentTarget.userId.value,
              password: e.currentTarget.password.value,
            }],
          })
          error ? state.setErrors([error]) : setIsOpen(false);
        }}
      />
      <CustomDialog 
        description='Are you sure you want to delete this entry?'
        extOpenState={[deleteIsOpen, setDeleteIsOpen]}
        action='delete'
        formData={[row.original]}
        submitFunc={(e, state) => {
          e.preventDefault();
          editVault({ action: 'remove', toChange: [row.original] })
        }}
      />
      <CustomDialog 
        action='share'
        description='Are you sure you want to share this entry?'
        extOpenState={[shareIsOpen, setShareIsOpen]}
        submitFunc={async (e, state) => {
          e.preventDefault();
          console.log('initial submit func', e, state)
          console.log(e.currentTarget.usernameIsValid.ariaChecked)
          const recipient = e.currentTarget.recipient.value;
          state.setErrors([])

          if (row.original.sharedWith.includes(recipient)) {
            state.setErrors(['already shared with this user'])
            return
          }

          if (!e.currentTarget.usernameIsValid.ariaChecked) {
            state.setErrors(['user does not exist'])
            return
          }

          const newEntry: Entry = {
            ...row.original,
            sharedWith: row.original.sharedWith.concat(recipient)
          }

          // Move pushing of shared password to db to editVault function
          // This way, it will be easy to regulate pushing changes to db
          // This allows us to push changes to all shared users everytime an entry is updated or shared
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
        }}
      />
    </DropdownMenu>
  )
}
