import { ActionErrors, Entry, VaultActions } from '@/types';
import { encrypt, getFullKey, getHash, getRandBase64 } from '@/lib/security';

async function uploadEntry(entry: Entry, username: string, salt: string, iv: string, tryCount = 0) {
  console.log('send share to', username, entry)
  const maxTryCount = 10;
  fetch('/api/share', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      recipient: await getHash(username),
      salt,
      iv,
      uuid: await getHash(entry.uuid),
      sharedEntry: await encrypt(
        JSON.stringify(entry),
        await getFullKey(username, salt),
        iv,
      ),
    })
  }).catch(() => {
      console.log(`request failed, trying again, ${tryCount} / ${maxTryCount}`)
      if (tryCount < maxTryCount) uploadEntry(entry, username, salt, iv, tryCount + 1)
    })
}

async function deleteShare(uuid: string) {
  // use module to retry fetch if it fails
  console.log('delete share from table')
  fetch('/api/share', {
    method: 'DELETE',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ uuid: await getHash(uuid) })
  })
}

// SHARE CASES:
// 1.) user deletes entry
// 2.) owner deletes entry
// 3.) owner removes a user from entry
function deleteHandler(entry: Entry, recipients: string[], newSharedWith: string[]) {
  recipients.forEach(username => {
    uploadEntry(
      { ...entry, sharedWith: newSharedWith },
      username,
      getRandBase64('salt'),
      getRandBase64('iv')
    )
  })
}

export const vaultActions: VaultActions = {
  add: (vault, entries, userInfo) => {
    return vault.concat(entries)
  },
  remove: (vault, entries, userInfo) => {
    // CASE 1 & 2
    // If owner, send delete request to all in sharedWith
    // If not owner, send updated entry (without user) to all in sharedWith (except for user)
    entries.forEach(entry => {
      const newShareList = entry.sharedWith.filter(username => username !== userInfo.username);
      const isOwner = entry.owner === userInfo.username
      deleteHandler(
        entry,
        isOwner ? entry.sharedWith : newShareList.concat(entry.owner),
        isOwner ? [] : newShareList,
      )
    })

    // On remove we want run the above code, but not when updating via 'auto' command
    const entryIds = entries.map(entry => entry.uuid);
    return vault.filter(existing => !entryIds.includes(existing.uuid));
  },
  update: (vault, entries, userInfo) => {
    // CASE 3
    // Removing a user from shared list is just an update
    // But instead of operating on the new share list we need to operate on the old share list
    // If we acted on updated share list, we wouldn't know which user is supposed to auto-delete the shared entry
    entries.forEach(entry => {
      // You can only update an entry if you are the owner, this check is kind of pointless
      // We only use update action in rowActions and tableOptions components
      if (entry.owner === userInfo.username) {
        console.log('sending shares to', entry.sharedWith)
        entry.sharedWith.forEach(username => {
          uploadEntry(entry, username, getRandBase64('salt'), getRandBase64('iv'))
        })
      } 
    })

    const entryIds = entries.map(entry => entry.uuid);
    return vaultActions.add(
      vault.filter(existing => !entryIds.includes(existing.uuid)),
      entries
        // Add entry as long as you are the owner or your username is included in sharedWith
        .filter(entry => entry.owner === userInfo.username || entry.sharedWith.includes(userInfo.username))
        .map(entry => ({ ...entry, date: new Date() })),
      userInfo,
    )
  },
  share: (vault, entries, userInfo) => {
    return vaultActions.update(vault, entries, userInfo)
  },
  unshare: (vault, entries, userInfo) => {
    entries.forEach(entry => {
      const oldSharedWith = vault.find(existing => existing.uuid === entry.uuid)
      if (oldSharedWith) {
        const removedUsers = oldSharedWith.sharedWith.filter(existingUser => {
          return !entry.sharedWith.includes(existingUser)
        })
        deleteHandler(
          entry,
          removedUsers,
          entry.sharedWith
        )
      }
    })

    return vaultActions.update(vault, entries, userInfo)
  },
  pending: (vault, entries, userInfo) => {
    entries.forEach(entry => {
      deleteShare(entry.uuid)
    })
    return vaultActions.add(vault, entries, userInfo)
  },
  auto: (vault, entries, userInfo) => {
    entries.forEach(entry => {
      deleteShare(entry.uuid)
    })
    const entryIds = entries.map(entry => entry.uuid);
    return vaultActions.add(
      vault.filter(existing => !entryIds.includes(existing.uuid)),
      entries
        .filter(entry => entry.owner === userInfo.username || entry.sharedWith.includes(userInfo.username))
        .map(entry => ({ ...entry, date: new Date() })),
      userInfo,
    )
  }
}

export const actionErrors: ActionErrors = {
  add: {
    'This service already exists': (vault, entry) => {
      return vault.some(existing => existing.service === entry.service && existing.owner === entry.owner)
    },
    'This UUID already exists': (vault, entry) => {
      // This will probably never happen, but if it did happen it would be very problematic
      return vault.some(existing => existing.uuid === entry.uuid)
    },
  },
  update: {
    'Cannot update this entry, you are not the owner': (vault, entry, userInfo) => {
      return entry.owner !== userInfo.username
    },
    'New service name already exists': (vault, entry, userInfo) => {
      return vault.some(existing => (
        existing.uuid !== entry.uuid &&
          existing.service === entry.service 
      ))
    },
  },
  remove: {
    'UUID not found': (vault, entry, userInfo) => {
      return !vault.some(existing => existing.uuid === entry.uuid)
    }
  },
  share: {
    // These can probably just be moved to the update function,
    // BUT this does provide a certain level of clarity in components
    // Update can mean a lot of things, but share just means we are modify the sharedWith array
    'Cannot share this entry, you are not the owner': (vault, entry, userInfo) => {
      return entry.owner !== userInfo.username
    },
    'Entry cannot be shared with the owner': (vault, entry) => {
      return entry.sharedWith.includes(entry.owner)
    },
    'Already shared with this user': (vault, entry) => {
      return entry.sharedWith.length !== new Set(entry.sharedWith).size
    },
  },
  // Are we certain there is no way for these to error?
  unshare: {},
  pending: {},
  auto: {},
}
