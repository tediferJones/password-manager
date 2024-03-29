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
import CustomDialog from '@/components/subcomponents/customDialog';
import { EditVaultFunction, Entry } from '@/types';
import { useUser } from '@clerk/nextjs';
import { useToast } from '../ui/use-toast';

export default function RowActions({ row, editVault }: { row: Row<Entry>, editVault: EditVaultFunction }) {
  const [isOpen, setIsOpen] = useState(false);
  const [editIsOpen, setEditIsOpen] = useState(false);
  const [shareIsOpen, setShareIsOpen] = useState(false);
  const [deleteIsOpen, setDeleteIsOpen] = useState(false);
  const [detailIsOpen, setDetailIsOpen] = useState(false);
  const { toast } = useToast();

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
        <DropdownMenuItem onClick={() => {
          navigator.clipboard.writeText(row.getValue('userId'))
          toast({
            title: 'Copied to clipboard',
            duration: 1000,
          })
        }}>
          Copy User Id 
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => {
          navigator.clipboard.writeText(row.getValue('password'))
          toast({
            title: 'Copied to clipboard',
            duration: 1000,
          })
        }}>
          Copy Password
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem 
          onSelect={() => setEditIsOpen(!editIsOpen)}
          disabled={row.original.owner !== useUser().user?.username}
        >
          Update
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onSelect={() => setDeleteIsOpen(!deleteIsOpen)}>
          Delete
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onSelect={() => setShareIsOpen(!shareIsOpen)}
          disabled={row.original.owner !== useUser().user?.username}
          className='flex justify-between'
        >
          <p>Share</p>
          <p>{`( ${row.original.sharedWith.length} )`}</p>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => {
          setDetailIsOpen(!detailIsOpen)
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
          state.setErrors([]);
          const error = editVault('update', [{
            ...row.original,
            service: e.currentTarget.service.value,
            userId: e.currentTarget.userId.value,
            password: e.currentTarget.password.value,
          }])
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
          editVault('remove', [row.original])
        }}
      />
      <CustomDialog 
        action='share'
        description='Are you sure you want to share this entry?'
        extOpenState={[shareIsOpen, setShareIsOpen]}
        formData={[row.original]}
        submitFunc={async (e, state) => {
          e.preventDefault();
          const recipient = e.currentTarget.recipient.value;
          state.setErrors([])

          if (!e.currentTarget.usernameIsValid.ariaChecked) {
            state.setErrors(['Username is not valid'])
            return
          }

          const error = editVault('share', [{
            ...row.original,
            sharedWith: row.original.sharedWith.concat(recipient),
          }])

          if (error) {
            state.setErrors([error])
          }
        }}
        deleteFunc={(e, state) => {
          e.preventDefault();
          const entry = state.getCurrentEntry();
          if (!entry) return
          editVault('unshare', [{
            ...entry,
            sharedWith: entry.sharedWith.filter(username => username !== e.currentTarget.value)
          }])
        }}
      />
      <CustomDialog 
        action='details'
        formData={[row.original]}
        extOpenState={[detailIsOpen, setDetailIsOpen]}
      />
    </DropdownMenu>
  )
}
