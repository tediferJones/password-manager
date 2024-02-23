import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'

import { useEffect, useRef, useState } from 'react';
import { Row } from '@tanstack/react-table';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button';
import ViewErrors from '@/components/viewErrors';
import EntryForm from '@/components/entryForm';
import GetRandomString from '@/components/getRandomString';
import { EditVaultFunction, Entry } from '@/types';

export default function UpdateSingle(editVault: EditVaultFunction, row: Row<Entry>) {
  const [editIsOpen, setEditIsOpen] = useState(false);
  const [editErrors, setEditErrors] = useState<string[]>([]);
  const editForm = useRef<HTMLFormElement>(null);

  useEffect(() => setEditErrors([]), [editIsOpen])

  const trigger = (
    <DropdownMenuItem onSelect={() => setEditIsOpen(true)}>
      Update
    </DropdownMenuItem>
  )

  const content = (
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
            toChange: [{
              ...row.original,
              newService: e.currentTarget.service.value,
              userId: e.currentTarget.userId.value,
              password: e.currentTarget.password.value,
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
  )

  return [trigger, content]
}
