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

export type {
  Share,
  UserInfo,
  Entry,
  EditVaultParams,
  EditVaultFunction,
}
