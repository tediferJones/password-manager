import { Dispatch, RefObject, SetStateAction } from 'react';

interface UserInfo {
  [key: string]: string,
  username: string,
  vault: string,
  salt: string,
  iv: string,
}

interface Share {
  recipient: string,
  salt: string,
  iv: string,
  sharedEntry: string,
}

interface Entry {
  [key: string]: string | string[] | undefined,
  service: string,
  userId: string,
  password: string,
  owner: string,
  sharedWith: string[],
  newService?: string,
}

type Actions = 'add' | 'remove' | 'update' | 'share';

type ActionFunc = (vault: Entry[], toChange: Entry[]) => Entry[]

type VaultActions = {
  [key in Actions]: ActionFunc
}

type ActionErrors = {
  [key in Actions]: {
    [key: string]: (vault: Entry[], entry: Entry, userInfo: UserInfo) => boolean
  }
}

type EditVaultFunction = (action: Actions, entires: Entry[]) => string | undefined;

interface CustomDialogState {
  isOpen: boolean,
  setIsOpen: Dispatch<SetStateAction<boolean>>,
  errors: string[],
  setErrors: Dispatch<SetStateAction<string[]>>,
  formRef: RefObject<HTMLFormElement>,
  formData?: Entry[],
  confirmIsOpen: boolean,
  setConfirmIsOpen: Dispatch<SetStateAction<boolean>>,
  confirmMatch: () => boolean,
  entryOffset: number,
  setEntryOffset: Dispatch<SetStateAction<number>>,
  getCurrentEntry: () => Entry | undefined,
}

export type {
  Share,
  UserInfo,
  Entry,
  EditVaultFunction,
  CustomDialogState,
  Actions,
  VaultActions,
  ActionErrors,
}
