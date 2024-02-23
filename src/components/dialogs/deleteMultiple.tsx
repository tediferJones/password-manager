import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';
import { Table } from '@tanstack/react-table';
import { EditVaultFunction, Entry } from '@/types';

export default function DeleteMultiple({
  table,
  editVault
}: { 
  table: Table<Entry>,
  editVault: EditVaultFunction,
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button disabled={!table.getFilteredSelectedRowModel().rows.length} variant='destructive'>
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Are you sure you want to delete these entries?
        </DialogDescription>
        <div className='max-h-[40vh] overflow-y-auto'>
          {table.getFilteredSelectedRowModel().rows.map(row => {
            return <div key={`delete-${row.original.service}`} className='text-center'>{row.original.service}</div>
          })}
        </div>
        <form className='grid gap-4 py-4' onSubmit={(e) => {
          e.preventDefault();
          editVault({
            action: 'remove',
            toChange: table.getFilteredSelectedRowModel().rows.map(row => row.original)
          })
          table.resetRowSelection();
        }}>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant='secondary'>Cancel</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button type='submit' variant='destructive'>Delete</Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
