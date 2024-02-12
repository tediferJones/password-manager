interface UserInfo {
  [key: string]: any,
  username: string,
  vault: string,
  salt: string,
  iv: string,
}

interface VaultInfo {
  [key: string]: {
    userId: string,
    password: string,
    sharedWith: string[],
  }
}

interface TableColumns {
  service: string,
  userId: string,
  password: string,
}

interface Entry {
  service: string,
  userId: string,
  password: string,
  sharedWith?: string[]
}

interface EditVaultParams {
  action: 'add' | 'remove',
  keys: Entry[]
}

type EditVaultFunction = ({ action, keys }: EditVaultParams) => void;

export type {
  UserInfo,
  VaultInfo,
  TableColumns,
  Entry,
  EditVaultParams,
  EditVaultFunction,
}
