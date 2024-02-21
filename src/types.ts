interface UserInfo {
  [key: string]: string,
  username: string,
  vault: string,
  salt: string,
  iv: string,
}

interface Entry {
  service: string,
  userId: string,
  password: string,
  owner: string,
  sharedWith: string[],
  newService?: string,
}

interface VaultInfo {
  [key: string]: Entry
}

interface EditVaultParams {
  action: 'add' | 'remove' | 'update',
  keys: Entry[]
}

type EditVaultFunction = ({ action, keys }: EditVaultParams) => string | undefined;

export type {
  UserInfo,
  Entry,
  VaultInfo,
  EditVaultParams,
  EditVaultFunction,
}
