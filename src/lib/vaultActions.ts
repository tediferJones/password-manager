import { ActionErrors, Entry, VaultActions } from '@/types';
import { encrypt, getFullKey, getHash, getRandBase64 } from '@/lib/security';

async function uploadEntry(entry: Entry, username: string, salt: string, iv: string, tryCount = 0) {
  console.log('SENDING ENTRY TO', username)
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

export const vaultActions: VaultActions = {
  add: (vault, entries, userInfo) => {
    // If entry owner is not current user, then we are adding a shared entry
    entries.forEach(entry => {
      if (entry.owner === userInfo.username) return
      console.log('sending delete request')
      deleteShare(entry.uuid)
      // fetch('/api/share', {
      //   method: 'DELETE',
      //   headers: { 'content-type': 'application/json' },
      //   body: JSON.stringify({ uuid: await getHash(entry.uuid) })
      // })
    })
    return vault.concat(entries)
  },
  remove: (vault, entries, userInfo) => {
    // If you are not the owner of an entry, then 'update' entry so user is no longer in share list
    // Send this updated entry to all shared with users and owner
    //
    // CASE 1 & 2
    // If owner, send delete request to all in sharedWith
    // If not owner, send updated entry (without user) to all in sharedWith (except for user)
    // entries.forEach(entry => {
    //   if (entry.owner === userInfo.username) {
    //     // If we are the owner, we want to delete this entry for all shared users
    //     // By setting this entry to an empty array, it will be filtered out in vaultActions update function
    //     // Thus it will be removed, but the new version wont be added
    //     entry.sharedWith.forEach(username => {
    //       uploadEntry(
    //         { ...entry, sharedWith: [] },
    //         username,
    //         getRandBase64('salt'),
    //         getRandBase64('iv')
    //       )
    //     })
    //   } else {
    //     const newShareList = entry.sharedWith.filter(username => username !== userInfo.username);
    //     console.log('sending entries for', [entry.owner, ...newShareList]);
    //     [entry.owner, ...newShareList].forEach(username => {
    //       uploadEntry(
    //         { ...entry, sharedWith: newShareList },
    //         username,
    //         getRandBase64('salt'),
    //         getRandBase64('iv')
    //       )
    //     })
    //   }
    // })


    return vault.filter(existing => {
      return !entries.some(entry => {
        return existing.uuid === entry.uuid;
      })
    })
  },
  update: (vault, entries, userInfo) => {
    // Send new entry to all shared users
    // MOVE FUNCTIN TO DELETE SHARES HERE
    // IF YOU ARE NOT THE OWNER SEND DELETE REQUEST
    // IF YOU ARE THE OWNER SEND NEW SHARE TO ALL SHARED WITH USERS
    // But this doesnt work for when we add pending shares
    //
    // CASE 3
    // Removing a user from shared list is just an update
    // But instead of operating on the new share list we need to operate on the old share list
    // If we acted on updated share list, we wouldn't know which user is supposed to auto-delete the shared entry
    entries.forEach(entry => {
      if (entry.owner === userInfo.username) {
        console.log('sending shares to', entry.sharedWith)
        entry.sharedWith.forEach(username => {
          uploadEntry(entry, username, getRandBase64('salt'), getRandBase64('iv'))
        })
      } else {
        console.log('delete from DB', entry)
        deleteShare(entry.uuid)
      }

      // OLD WORKING
      // if (entry.owner !== userInfo.username) return
      // entry.sharedWith.forEach(username => {
      //   uploadEntry(entry, username, getRandBase64('salt'), getRandBase64('iv'))
      // })
    })

    return vaultActions.add(
      vaultActions.remove(vault, entries, userInfo),
      // WORKING
      // entries.map(entry => {
      //   return { ...entry, date: new Date() }
      // }),

      // TESTING
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
  auto: (vault, entries, userInfo) => {
    return vaultActions.update(vault, entries, userInfo)
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
    }
  },
  update: {
    'New service name already exists': (vault, entry) => {
      return vault.some(existing => existing.service === entry.service && existing.owner === entry.owner)
    },
    'Cannot update this entry, you are not the owner': (vault, entry, userInfo) => {
      return entry.owner !== userInfo.username
    }
  },
  remove: {},
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
  // Are we certain there is no way for auto to error?
  auto: {},
}
