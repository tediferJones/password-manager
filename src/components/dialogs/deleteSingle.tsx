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
import { Button } from '@/components/ui/button';
import { Row } from '@tanstack/react-table';
import { useState } from 'react';
import { EditVaultFunction, Entry } from '@/types';

export default function DeleteSingle(editVault: EditVaultFunction, row: Row<Entry>) {
  const [deleteIsOpen, setDeleteIsOpen] = useState(false);

  const trigger = (
    <DropdownMenuItem onSelect={() => setDeleteIsOpen(true)}>
      Delete
    </DropdownMenuItem>
  )

  const content = (
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
          editVault({ action: 'remove', toChange: [row.original] })
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
  )

  return [trigger, content];
}
