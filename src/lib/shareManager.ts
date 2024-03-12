import easyFetch from '@/lib/easyFetch';
import { encrypt, getFullKey, getHash, getRandBase64 } from '@/lib/security';
import { Entry, UserInfo } from '@/types';

export async function deleteShares(entries: Entry[]) {
  // Delete share record from DB
  return entries.forEach(async entry => {
    easyFetch('/api/share', 'DELETE', { uuid: await getHash(entry.uuid) })
  })
}

export async function uploadShares(entry: Entry, users: string[]) {
  // Add share record to DB
  users.forEach(async username => {
    console.log('send share to', username, entry)
    const salt = getRandBase64('salt');
    const iv = getRandBase64('iv');
    easyFetch('/api/share', 'POST', {
      recipient: await getHash(username),
      uuid: await getHash(entry.uuid),
      salt,
      iv,
      sharedEntry: await encrypt(
        JSON.stringify(entry),
        await getFullKey(username, salt),
        iv,
      ),
    })
  })
}

type shareActions = 'update' | 'remove' | 'unshare';
export function shareHandler(action: shareActions, vault: Entry[], entries: Entry[], userInfo: UserInfo) {
  // There are 4 cases
  // 1. Owner updates entry, send newEntry to all sharedWith
  // 2. Owner removes entire entry, set sharedWith = [], send this new entry to all users in sharedWith
  // 3. User removes shared entry, remove user from sharedWith, send updated entry to all users and owner
  // 4. Owner removes a user (unshare), send updated entry to all users in old sharedWith, including removed user

  const sendTo: { [key in shareActions]: (entry: Entry) => string[] } = {
    remove: (entry) => {
      console.log('is owner:', entry.owner === userInfo.username)
      return entry.owner === userInfo.username ? entry.sharedWith
        : entry.sharedWith
        .filter(username => username !== userInfo.username)
        .concat(entry.owner)
    },
    unshare: (entry) => {
      const oldSharedWith = vault.find(existing => existing.uuid === entry.uuid)
      if (!oldSharedWith) throw Error('cant find existing share')
      return oldSharedWith.sharedWith;
    },
    update: (entry) => {
      return entry.sharedWith;
    }
  }

  entries.forEach(entry => {
    uploadShares(
      action !== 'remove' ? entry : {
        ...entry,
        sharedWith: entry.owner === userInfo.username ? [] : 
          entry.sharedWith.filter(username => username !== userInfo.username)
      },
      sendTo[action](entry)
    )
  })
}
