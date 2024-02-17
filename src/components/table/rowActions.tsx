import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription
} from '@/components/ui/dialog'

import { useEffect, useState } from 'react';
import { Row } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { EditVaultFunction, TableColumns } from '@/types';
import EntryForm from '../entryForm';
import ViewErrors from '../viewErrors';

export default function RowActions({ row, editVault }: { row: Row<TableColumns>, editVault: EditVaultFunction }) {
  const [isOpen, setIsOpen] = useState(false);
  const [editIsOpen, setEditIsOpen] = useState(false);
  const [editErrors, setEditErrors] = useState<string[]>([]);
  const [deleteIsOpen, setDeleteIsOpen] = useState(false);

  useEffect(() => setEditErrors([]), [editIsOpen])

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
        <DropdownMenuItem onSelect={() => setEditIsOpen(true)}>
          Update
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => setDeleteIsOpen(true)}>
          Delete
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Share</DropdownMenuItem>
      </DropdownMenuContent>

      <Dialog open={editIsOpen} onOpenChange={setEditIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Entry</DialogTitle>
          </DialogHeader>
          <ViewErrors errors={editErrors} name='editErrors'/>
          <form className='grid gap-4 py-4' onSubmit={(e) => {
            e.preventDefault();
            setEditErrors([]);
            const error = editVault({
              action: 'update',
              keys: [{
                newService: e.currentTarget.service.value,
                userId: e.currentTarget.userId.value,
                password: e.currentTarget.password.value,
                service: row.original.service
              }],
            })
            error ? setEditErrors([error]) : setEditIsOpen(false);
          }}>
            <EntryForm entry={row.original} />
            <DialogFooter>
              <DialogClose asChild>
                <Button variant='secondary'>Cancel</Button>
              </DialogClose>
              <Button type='submit'>Update</Button>
            </DialogFooter>
          </form>
        </DialogContent>

        <Dialog open={deleteIsOpen} onOpenChange={setDeleteIsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Entry</DialogTitle>
            </DialogHeader>
            <DialogDescription>
              Are you sure you want to delete this entry?
            </DialogDescription>
            <span className='text-center'>{row.original.service}</span>
            <form className='grid gap-4 py-4' onSubmit={(e) => {
              e.preventDefault();
              editVault({ action: 'remove', keys: [row.original] })
            }}>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant='secondary'>Cancel</Button>
                </DialogClose>
                <Button type='submit' variant='destructive'>Delete</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </Dialog>
    </DropdownMenu>
  )
}
