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

import { useEffect, useRef, useState } from 'react';
import { Row } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { EditVaultFunction, TableColumns } from '@/types';
import EntryForm from '../entryForm';
import ViewErrors from '../viewErrors';
import GetRandomString from '../getRandomString';
import { Button } from '@/components/ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';

export default function RowActions({ row, editVault }: { row: Row<TableColumns>, editVault: EditVaultFunction }) {
  const [isOpen, setIsOpen] = useState(false);

  const [editIsOpen, setEditIsOpen] = useState(false);
  const [editErrors, setEditErrors] = useState<string[]>([]);
  const editForm = useRef<HTMLFormElement>(null);

  const [deleteIsOpen, setDeleteIsOpen] = useState(false);

  const [shareIsOpen, setShareIsOpen] = useState(false);

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
        <DropdownMenuItem onSelect={() => setShareIsOpen(true)}>Share</DropdownMenuItem>
      </DropdownMenuContent>

      <Dialog open={editIsOpen} onOpenChange={setEditIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Entry</DialogTitle>
          </DialogHeader>
          <ViewErrors errors={editErrors} name='editErrors'/>
          <form className='grid gap-4 py-4' ref={editForm} onSubmit={(e) => {
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
              <GetRandomString
                buttonText='Generate'
                secondary
                func={(pwd) => {
                  if (editForm.current) editForm.current.password.value = pwd
                }}
              />
              <Button type='submit'>Update</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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

      <Dialog open={shareIsOpen} onOpenChange={setShareIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Entry</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Are you sure you want to share this entry?
          </DialogDescription>
          <span className='text-center'>{row.original.service}</span>
          <form className='grid gap-4 py-4' onSubmit={(e) => {
            e.preventDefault();
            console.log(e.currentTarget.recipient.value)
          }}>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='recipient' className='text-center'>Recipient</Label>
              <Input id='recipient' className='col-span-3 border-2' required
                onChange={async (e) => {
                  const { value, style } = e.currentTarget;
                  style.borderWidth = value ? '2px' : '0px'
                  style.borderColor = (await fetch(`/api/users/${value}`)).status === 200 ?
                    '#22C55E' : '#EF4444'
                  // '#EF4444': red-500
                  // '#22C55E': green-500
                }}
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
    </DropdownMenu>
  )
}
