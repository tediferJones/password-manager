import { useEffect, useRef, useState } from 'react';
import EntryForm from '@/components/entryForm';
import GetRandomString from '@/components/getRandomString';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import ViewErrors from '@/components/viewErrors';
import { EditVaultFunction, UserInfo } from '@/types';

export default function AddSingle({
  editVault,
  userInfo,
}: { 
  editVault: EditVaultFunction,
  userInfo: UserInfo,
}) {
  const [addIsOpen, setAddIsOpen] = useState(false);
  const [addErrors, setAddErrors] = useState<string[]>([]);
  const addForm = useRef<HTMLFormElement>(null);

  useEffect(() => setAddErrors([]), [addIsOpen])

  return (
    <Dialog open={addIsOpen} onOpenChange={setAddIsOpen}>
      <DialogTrigger asChild>
        <Button>Add</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Entry</DialogTitle>
        </DialogHeader>
        <ViewErrors errors={addErrors} name='addErrors' />
        <form className='grid gap-4 py-4' ref={addForm} onSubmit={(e) => {
          e.preventDefault();
          setAddErrors([]);
          const error = editVault({
            action: 'add',
            toChange: [{
              service: e.currentTarget.service.value,
              userId: e.currentTarget.userId.value,
              password: e.currentTarget.password.value,
              sharedWith: [],
              owner: userInfo.username,
            }],
          })
          error ? setAddErrors([error]) : setAddIsOpen(false);
        }}>
          <EntryForm />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant='secondary'>Cancel</Button>
            </DialogClose>
            <GetRandomString
              buttonText='Generate'
              secondary
              func={(pwd) => {
                if (addForm.current) addForm.current.password.value = pwd
              }}
            />
            <Button type='submit'>Add</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
