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
  // basic update (can only be done by owner, so just send newEntry to all sharedWith)
  // entry removed
  //  - If owner, send sharedWith = []
  //  - If not owner, remove yourself from sharedWith, send to remaining users and owner
  // Owner removes user (unshare)
  //  - Send new share to all users including removed user

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
    let newSharedWith = entry.sharedWith;
    if (action === 'remove') {
      if (entry.owner === userInfo.username) {
        newSharedWith = [];
      } else {
        newSharedWith = entry.sharedWith.filter(username => username !== userInfo.username)
      }
    }
    uploadShares(
      { ...entry, sharedWith: newSharedWith },
      sendTo[action](entry)
    )
  })
}
