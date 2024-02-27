import { Dispatch, RefObject, SetStateAction } from "react";

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

interface EditVaultParams {
  action: 'add' | 'remove' | 'update',
  toChange: Entry[]
}

type EditVaultFunction = ({ action, toChange }: EditVaultParams) => string | undefined;

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
}

export type {
  Share,
  UserInfo,
  Entry,
  EditVaultParams,
  EditVaultFunction,
  CustomDialogState,
}
