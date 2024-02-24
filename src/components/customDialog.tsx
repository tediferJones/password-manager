import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

import { FormEvent, MouseEvent } from 'react';
import { Button } from '@/components/ui/button';
import GetRandomString from '@/components/getRandomString';
import ViewErrors from '@/components/viewErrors';
import EntryForm from '@/components/entryForm';
import PasswordForm from '@/components/passwordForm';

export default function CustomDialog({
  isOpen,
  setIsOpen,
  triggerText,
  title,
  formType,
  submitFunc,
  seperate,
  description,
  formData,
  skipFunc,
  randFunc,
  errors,
}: {
    isOpen?: boolean,
    setIsOpen?: (t: any) => void,
    triggerText: string,
    title: string,
    formType: string,
    submitFunc: (e: FormEvent<HTMLFormElement>, state: any) => any,
    seperate?: boolean, // Or we could just make trigger text optional, if no trigger text dont include trigger
    description?: string,
    formData?: any,
    skipFunc?: (e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>) => any,
    randFunc?: (pwd: string) => any,
    errors?: string[],
}) {
  // All State should be handled outside this component

  const form = {
    entry: <EntryForm />,
    password: <PasswordForm confirmMatch={() => {}} />,
    delete: <div>A LIST OF ENTRIES TO DELETE</div>
  }[formType];

  function getBody() {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen} key='test2'>
        {seperate ? [] :
          <DialogTrigger asChild>
            <Button>
              {triggerText}
            </Button>
          </DialogTrigger>
        }
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {!description ? [] : 
              <DialogDescription>{description}</DialogDescription>
            }
          </DialogHeader>
          {!errors ? [] : <ViewErrors errors={errors} name={`${triggerText}-Errors`} />}
          <form className='grid gap-4 py-4'
            onSubmit={(e) => {
            e.preventDefault();
            submitFunc(e, {
              // some custom state obj
            })
          }}>
            {form}
            <DialogFooter>
              <DialogClose asChild>
                <Button variant='secondary' type='button'>Cancel</Button>
              </DialogClose>
              {!skipFunc ? [] : 
                <Button variant='secondary'
                  type='button'
                  onClick={(e) => {
                    e.preventDefault();
                    skipFunc(e)
                  }}
                >Skip</Button>
              }
              {!randFunc ? [] :
                <GetRandomString
                  buttonText='Generate'
                  secondary
                  func={(pwd) => {
                    randFunc(pwd);
                  }}
                />
              }
              <Button type='submit'>Update</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    )

  }
  // We should just make this a normal component
  // Trigger is literally just a button that toggles the isOpen state variable
  // See rowActions for an example
  const test = <div key={'test1'}>{triggerText}</div>
  return seperate ? [test, getBody()] : getBody();
}
