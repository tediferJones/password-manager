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

import {
  Dispatch,
  FormEvent,
  MouseEvent,
  RefObject,
  SetStateAction,
  useEffect,
  useRef,
  useState
} from 'react';

import { Button } from '@/components/ui/button';
import GetRandomString from '@/components/getRandomString';
import ViewErrors from '@/components/viewErrors';
import EntryForm from '@/components/entryForm';
import PasswordForm from '@/components/passwordForm';
import ShareForm from '@/components/shareForm';
import { Entry } from '@/types';

interface State {
  isOpen: boolean,
  setIsOpen: Dispatch<SetStateAction<boolean>>,
  errors: string[],
  setErrors: Dispatch<SetStateAction<string[]>>,
  formRef: RefObject<HTMLFormElement>,
  confirmIsOpen: boolean,
  setConfirmIsOpen: Dispatch<SetStateAction<boolean>>,
}

export default function CustomDialog({
  openState,
  setOpenState,
  triggerText,
  triggerVariant,
  disableTrigger,
  title,
  description,
  formType = 'none',
  formData,
  formReset, // if form data is provided, we should provide form reset functions
  disableInputs,
  generateRandom,
  skipFunc,
  submitVariant,
  submitText,
  submitFunc,
  localFunc,
  // confirm,
  confirmSubmitFunc,
}: {
    openState?: boolean,
    setOpenState?: Dispatch<SetStateAction<boolean>>,
    // extOpenState?: [boolean, Dispatch<SetStateAction<boolean>>]
    triggerText?: string,
    triggerVariant?: 'secondary' | 'outline' | 'destructive',
    disableTrigger?: any,
    title: string,
    description?: string,
    formType?: 'entry' | 'password' | 'delete' | 'share' | 'none',
    formData?: Entry[],
    formReset?: boolean,
    disableInputs?: boolean,
    generateRandom?: boolean,
    skipFunc?: (e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>, state: State) => void,
    submitVariant?:  'secondary' | 'outline' | 'destructive',
    submitText: string,
    submitFunc: (e: FormEvent<HTMLFormElement>, state: State) => void,
    localFunc?: () => void,
    // confirm?: boolean,
    confirmSubmitFunc?: (e: FormEvent<HTMLFormElement>, state: State) => void,
}) {
  const [innerIsOpen, setInnerIsOpen] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isOpen, setIsOpen] = openState && setOpenState ? [openState, setOpenState] : [innerIsOpen, setInnerIsOpen];
  const [confirmIsOpen, setConfirmIsOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const state: State = {
    isOpen,
    setIsOpen,
    formRef,
    errors,
    setErrors,
    confirmIsOpen,
    setConfirmIsOpen,
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
          <Button variant={triggerVariant} disabled={disableTrigger}>
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
              entry: <EntryForm entry={formData ? formData[0] : undefined} shared={disableInputs} />,
              password: <PasswordForm confirmMatch={() => {}} />,
              // delete: <div>A LIST OF ENTRIES TO DELETE</div>,
              // delete: formData ? <span className='text-center'>{formData.service}</span> : [],
              delete: 
                <div className='max-h-[40vh] overflow-y-auto flex flex-col items-center'>
                  {formData?.map(entry => {
                    return <div key={`${entry.owner}-${entry.service}`} className='text-center'>{entry.service}</div>
                  })}
                </div>
              ,
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
                      if (formRef.current) formRef.current[key].value = formData[0][key];
                    });
                  } else {
                    formRef.current?.reset();
                  }
                }}
              >Reset</Button>
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
            {!skipFunc ? [] : 
              <Button variant='secondary'
                type='button'
                onClick={(e) => skipFunc(e, state)}
              >Skip</Button>
            }
            <Button type='submit' variant={submitVariant}>{submitText}</Button> 
          </DialogFooter>
        </form>
        {!confirmSubmitFunc ? [] :
          <CustomDialog 
            title={title}
            description='This action cannot be done, please be careful'
            submitText="Yes I'm sure"
            triggerVariant={submitVariant}
            submitVariant={submitVariant}
            submitFunc={(e) => confirmSubmitFunc(e, state)}
            openState={confirmIsOpen}
            setOpenState={setConfirmIsOpen}
          />
        }
      </DialogContent>
    </Dialog>
  )
}
