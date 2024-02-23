import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';

import { useRef, useState } from 'react';
import { Table } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import ViewErrors from '@/components/viewErrors';
import EntryForm from '@/components/entryForm';
import GetRandomString from '@/components/getRandomString';
import { EditVaultFunction, Entry } from '@/types';

export default function UpdateMultiple({
  table,
  editVault
}: { 
  table: Table<Entry>,
  editVault: EditVaultFunction,
}) {
  const [updateIsOpen, setUpdateIsOpen] = useState(false);
  const [updateErrors, setUpdateErrors] = useState<string[]>([]);
  const updateForm = useRef<HTMLFormElement>(null);

  function setForm(entry: Entry) {
    if (updateForm.current) {
      updateForm.current.service.value = entry.service;
      updateForm.current.userId.value = entry.userId;
      updateForm.current.password.value = entry.password;
    }
  }

  function setNextEntry() {
    if (updateForm.current) {
      const [currentRow, nextRow] = table.getFilteredSelectedRowModel().rows;
      currentRow.toggleSelected(false);
      nextRow ? setForm(nextRow.original) : setUpdateIsOpen(false);
    }
  }

  return (
    <Dialog open={updateIsOpen} onOpenChange={setUpdateIsOpen}>
      <DialogTrigger asChild>
        <Button disabled={!table.getFilteredSelectedRowModel().rows.length}>
          Update
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Entry</DialogTitle>
        </DialogHeader>
        <ViewErrors errors={updateErrors} name='updateErrors'/>
        <form ref={updateForm} className='grid gap-4 py-4' onSubmit={(e) => {
          const [ currentRow ] = table.getFilteredSelectedRowModel().rows;
          console.log('EDITING', currentRow.original)
          e.preventDefault();
          setUpdateErrors([]);
          const error = editVault({
            action: 'update',
            toChange: [{
              ...currentRow.original,
              newService: e.currentTarget.service.value,
              userId: e.currentTarget.userId.value,
              password: e.currentTarget.password.value,
            }],
          })
          error ? setUpdateErrors([error]) : setNextEntry();
        }}>
          <EntryForm entry={table.getFilteredSelectedRowModel().rows.length ?
            table.getFilteredSelectedRowModel().rows[0].original : undefined
          }/>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant='secondary'>Close</Button>
            </DialogClose>
            <Button variant='secondary' type='button'
              onClick={() => setForm(table.getFilteredSelectedRowModel().rows[0].original)}
            >Reset</Button>
            <GetRandomString
              buttonText='Generate'
              secondary
              func={(pwd) => {
                if (updateForm.current) updateForm.current.password.value = pwd
              }}
            />
            <Button variant='secondary' type='button' 
              onClick={() => {
                setUpdateErrors([]);
                setNextEntry();
              }}>Skip</Button>
            <Button type='submit'>Update</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
