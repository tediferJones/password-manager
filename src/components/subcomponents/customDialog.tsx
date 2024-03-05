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
  SetStateAction,
  useEffect,
  useRef,
  useState
} from 'react';

import { Button } from '@/components/ui/button';
import GeneratePassword from '@/components/subcomponents/generatePassword';
import ViewErrors from '@/components/subcomponents/viewErrors';
import EntryForm from '@/components/forms/entryForm';
import PasswordForm from '@/components/forms/passwordForm';
import ShareForm from '@/components/forms/shareForm';
import DetailForm from '@/components/forms/detailForm';
import { CustomDialogState, Entry } from '@/types';
import capAndSplit from '@/lib/capAndSplit';
import { useUser } from '@clerk/nextjs';
import { Trash2 } from 'lucide-react';

export default function CustomDialog({
  action,
  submitFunc,
  description,
  formData,
  skipFunc,
  confirmFunc,
  extOpenState,
  submitText,
  deleteFunc,
}: {
    action: 'add' | 'update' | 'delete' | 'share' | 'pending' | 'reset' | 'confirm' | 'details'
    submitFunc: (e: FormEvent<HTMLFormElement>, state: CustomDialogState) => void,
    description?: string,
    formData?: Entry[],
    skipFunc?: (e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>, state: CustomDialogState) => void,
    confirmFunc?: (e: FormEvent<HTMLFormElement>, state: CustomDialogState) => void,
    extOpenState?: [boolean, Dispatch<SetStateAction<boolean>>]
    submitText?: string,
    deleteFunc?: (e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>, state: CustomDialogState) => void,
}) {
  const [errors, setErrors] = useState<string[]>([]);
  const [entryOffset, setEntryOffset] = useState(0);
  const [confirmIsOpen, setConfirmIsOpen] = useState(false);
  const defaultOpenState = useState(false);
  const [isOpen, setIsOpen] = extOpenState ? extOpenState : defaultOpenState;
  const formRef = useRef<HTMLFormElement>(null);

  function confirmMatch() {
    return !!(formRef?.current && formRef.current.password.value === formRef.current.confirm.value)
  }

  function getCurrentEntry() {
    return formData ? formData[entryOffset] : undefined;
  }

  const state: CustomDialogState = {
    isOpen,
    setIsOpen,
    formRef,
    formData,
    errors,
    setErrors,
    confirmIsOpen,
    setConfirmIsOpen,
    confirmMatch,
    entryOffset,
    setEntryOffset,
    getCurrentEntry,
  };

  useEffect(() => {
    // if (!formData || action === 'delete' || action === 'share') return;
    if (!formData || ['delete', 'share', 'details'].includes(action)) return;
    if (formData.length <= entryOffset) return setIsOpen(false);
    ['service', 'userId', 'password'].forEach(formId => {
      if (formRef.current) {
        formRef.current[formId].value = formData[entryOffset][formId]
      }
    })
  }, [formData, entryOffset])

  useEffect(() => {
    setErrors([])
    setEntryOffset(0)
  }, [isOpen]);

  const actionTypes = {
    reset: 'Password',
    confirm: 'PasswordReset',
    details: ' ',
  }
  // @ts-ignore
  const actionType = actionTypes[action] || (formData && formData.length > 1 ? 'Entries' : 'Entry')
  const btnVariant = ['delete', 'reset', 'confirm'].includes(action) ? 'destructive' : 'default';
  const username = useUser().user?.username;
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {extOpenState ? [] :
        <DialogTrigger asChild>
          <Button className='capitalize' variant={btnVariant} disabled={!(action === 'add' || formData && formData.length)}>
            {capAndSplit(action.split('')) + (action === 'pending' && formData ? ` (${formData.length})` : '')}
          </Button>
        </DialogTrigger>
      }
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{capAndSplit(`${action+actionType} `.split(''))}</DialogTitle>
        </DialogHeader>
        {!description ? [] : 
          <DialogDescription>{description}</DialogDescription>
        }
        <ViewErrors errors={errors} name={`${action}-Errors`} />
        <form className='grid gap-4'
          ref={formRef}
          onSubmit={(e) => submitFunc(e, state)}
        >
          {
            {
              add: <EntryForm />,
              update: <EntryForm entry={formData?.[entryOffset]}
                shared={formData?.[entryOffset]?.owner !== username}
              />,
              delete: <div className='max-h-[40vh] overflow-y-auto flex flex-col items-center'>
                {formData?.map(entry => (
                  <div className='text-center'
                    key={`${entry.owner}-${entry.service}`}
                  >{entry.service}</div>
                ))}
              </div>,
              share: <>
                {formData?.[entryOffset]?.sharedWith.map(username => {
                  return <div
                    key={`${formData?.[entryOffset]?.owner}-${formData?.[entryOffset]?.service}-${username}`}
                    className='flex justify-center items-center gap-4 p-4 w-4/5 mx-auto'
                  >
                    <p className='w-full text-center'>{username}</p>
                    <Button type='button'
                      variant='destructive'
                      value={username}
                      onClick={(e) => {
                        if (deleteFunc) deleteFunc(e, state)
                      }}>
                      <Trash2 className='w-4 h-4' />
                    </Button>
                  </div>
                })}
                <ShareForm entry={formData?.[entryOffset]} />
              </>,
              pending: <EntryForm entry={formData?.[entryOffset]} shared={true} />,
              reset: <PasswordForm confirmMatch={confirmMatch} confirmOld match />,
              confirm: undefined,
              details: formData?.[entryOffset] ? <DetailForm entry={formData?.[entryOffset]}/> : [],
            }[action]
          }
          <DialogFooter>
            <DialogClose asChild>
              <Button variant='secondary' type='button'>Cancel</Button>
            </DialogClose>
            {!formData || ['delete', 'details'].includes(action) ? [] :
              <Button variant='secondary'
                type='button'
                onClick={() => {
                  !formData ? formRef.current?.reset() :
                    ['service', 'userId', 'password'].forEach(key => {
                      if (formRef.current) formRef.current[key].value = formData[0][key];
                    });
                  // if (formData) {
                  //   ['service', 'userId', 'password'].forEach(key => {
                  //     if (formRef.current) formRef.current[key].value = formData[0][key];
                  //   });
                  // } else {
                  //   formRef.current?.reset();
                  // }
                }}
              >Reset</Button>
            }
            {!['add', 'update', 'reset'].includes(action) ? [] :
              <GeneratePassword
                buttonText='Generate'
                secondary
                func={(pwd) => {
                  ['password', 'confirm'].forEach(formId => {
                    if (state.formRef.current && state.formRef.current[formId]) {
                      state.formRef.current[formId].value = pwd
                    }
                  })
                  // if (state.formRef.current?.password) {
                  //   state.formRef.current.password.value = pwd
                  // }
                  // if (state.formRef.current?.confirm) {
                  //   state.formRef.current.confirm.value = pwd
                  // }
                }}
              />
            }
            {!skipFunc ? [] : 
              <Button variant='secondary'
                type='button'
                onClick={(e) => skipFunc(e, state)}
              >Skip</Button>
            }
            <Button type='submit' variant={btnVariant}>
              {capAndSplit((submitText || action).split(''))}
            </Button> 
          </DialogFooter>
        </form>
        {!confirmFunc ? [] :
          <CustomDialog 
            description='This action cannot be done, please be careful'
            action='confirm'
            submitText="Yes I'm sure"
            submitFunc={(e) => confirmFunc(e, state)}
            extOpenState={[confirmIsOpen, setConfirmIsOpen]}
          />
        }
      </DialogContent>
    </Dialog>
  )
}
