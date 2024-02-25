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

import { Dispatch, FormEvent, MouseEvent, RefObject, SetStateAction, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import GetRandomString from '@/components/getRandomString';
import ViewErrors from '@/components/viewErrors';
import EntryForm from '@/components/entryForm';
import PasswordForm from '@/components/passwordForm';
import { Entry } from '@/types';
import ShareForm from './shareForm';

interface State {
  isOpen: boolean,
  setIsOpen: Dispatch<SetStateAction<boolean>>,
  errors: string[],
  setErrors: Dispatch<SetStateAction<string[]>>,
  formRef: RefObject<HTMLFormElement>,
}

export default function CustomDialog({
  openState,
  setOpenState,
  triggerText,
  triggerVariant,
  title,
  description,
  formType = 'none',
  formData,
  formReset,
  generateRandom,
  skipFunc,
  submitVariant,
  submitText,
  submitFunc,
  localFunc,
  confirm,
}: {
    openState?: boolean,
    // setOpenState?: (t: any) => void,
    setOpenState?: Dispatch<SetStateAction<boolean>>,
    triggerText?: string,
    triggerVariant?: 'secondary' | 'outline' | 'destructive',
    title: string,
    description?: string,
    formType?: 'entry' | 'password' | 'delete' | 'share' | 'none',
    formData?: Entry,
    formReset?: boolean,
    generateRandom?: boolean,
    skipFunc?: (e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>, state: State) => void,
    submitVariant?:  'secondary' | 'outline' | 'destructive',
    submitText: string,
    submitFunc: (e: FormEvent<HTMLFormElement>, state: State) => void,
    localFunc?: () => void,
    confirm?: boolean,
}) {
  const [innerIsOpen, setInnerIsOpen] = useState(false);
  const [errors, setErrors]  = useState<string[]>([]);
  const [isOpen, setIsOpen] = openState && setOpenState ? [openState, setOpenState] : [innerIsOpen, setInnerIsOpen];
  const formRef = useRef<HTMLFormElement>(null);
  const state: State = {
    isOpen,
    setIsOpen,
    formRef,
    errors,
    setErrors
  };

  useEffect(() => setErrors([]), [isOpen]);

  // (() => {
  //   console.log('global func')
  //   if (localFunc) localFunc()
  // })();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {!triggerText? [] :
        <DialogTrigger asChild>
          <Button variant={triggerVariant}>
            {triggerText}
          </Button>
        </DialogTrigger>
      }
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {!description ? [] : 
          <DialogDescription>{description}</DialogDescription>
        }
        <ViewErrors errors={errors} name={`${triggerText}-Errors`} />
        <form className='grid gap-4 py-4'
          ref={formRef}
          onSubmit={(e) => submitFunc(e, state)}
        >
          {
            {
              entry: <EntryForm entry={formData}/>,
              password: <PasswordForm confirmMatch={() => {}} />,
              delete: <div>A LIST OF ENTRIES TO DELETE</div>,
              share: <ShareForm />,
              none: [],
            }[formType]
          }
          <DialogFooter>
            <DialogClose asChild>
              <Button variant='secondary' type='button'>Cancel</Button>
            </DialogClose>
            {!formReset || !formData ? [] :
              <Button variant='secondary'
                type='button'
                onClick={() => {
                  if (formData) {
                    ['service', 'userId', 'password'].forEach(key => {
                      if (formRef.current) formRef.current[key].value = formData[key];
                    });
                  } else {
                    formRef.current?.reset();
                  }
                }}
              >Reset</Button>
            }
            {!skipFunc ? [] : 
              <Button variant='secondary'
                type='button'
                onClick={(e) => skipFunc(e, state)}
              >Skip</Button>
            }
            {!generateRandom ? [] :
              <GetRandomString
                buttonText='Generate'
                secondary
                func={(pwd) => {
                  if (state.formRef.current?.password) {
                    state.formRef.current.password.value = pwd
                  }
                  if (state.formRef.current?.confirm) {
                    state.formRef.current.confirm.value = pwd
                  }
                }}
              />
            }
            {!confirm ? <Button type='submit' variant={submitVariant}>{submitText}</Button> :
              <CustomDialog 
                triggerText='Confirm'
                title={title}
                description='This action cannot be done, please be careful'
                submitText="Yes I'm sure"
                triggerVariant={submitVariant}
                submitVariant={submitVariant}
                submitFunc={(e, state) => {
                  console.log('confirm submit func', e, state)
                }}
              />
            }
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )


  // All State should be handled outside this component

  // const form = {
  //   entry: <EntryForm />,
  //   password: <PasswordForm confirmMatch={() => {}} />,
  //   delete: <div>A LIST OF ENTRIES TO DELETE</div>
  // }[formType];

  // function getBody() {
  //   return (
  //     <Dialog open={isOpen} onOpenChange={setIsOpen} key='test2'>
  //       {seperate ? [] :
  //         <DialogTrigger asChild>
  //           <Button>
  //             {triggerText}
  //           </Button>
  //         </DialogTrigger>
  //       }
  //       <DialogContent>
  //         <DialogHeader>
  //           <DialogTitle>{title}</DialogTitle>
  //           {!description ? [] : 
  //             <DialogDescription>{description}</DialogDescription>
  //           }
  //         </DialogHeader>
  //         {!errors ? [] : <ViewErrors errors={errors} name={`${triggerText}-Errors`} />}
  //         <form className='grid gap-4 py-4'
  //           onSubmit={(e) => {
  //           e.preventDefault();
  //           submitFunc(e, {
  //             // some custom state obj
  //           })
  //         }}>
  //           {form}
  //           <DialogFooter>
  //             <DialogClose asChild>
  //               <Button variant='secondary' type='button'>Cancel</Button>
  //             </DialogClose>
  //             {!skipFunc ? [] : 
  //               <Button variant='secondary'
  //                 type='button'
  //                 onClick={(e) => {
  //                   e.preventDefault();
  //                   skipFunc(e)
  //                 }}
  //               >Skip</Button>
  //             }
  //             {!randFunc ? [] :
  //               <GetRandomString
  //                 buttonText='Generate'
  //                 secondary
  //                 func={(pwd) => {
  //                   randFunc(pwd);
  //                 }}
  //               />
  //             }
  //             <Button type='submit'>Update</Button>
  //           </DialogFooter>
  //         </form>
  //       </DialogContent>
  //     </Dialog>
  //   )
  // }
  //
  // We should just make this a normal component
  // Trigger is literally just a button that toggles the isOpen state variable
  // See rowActions for an example
  // const test = <div key={'test1'}>{triggerText}</div>
  // return seperate ? [test, getBody()] : getBody();
}
