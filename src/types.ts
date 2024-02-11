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

export type {
  UserInfo,
  VaultInfo,
  TableColumns,
}
