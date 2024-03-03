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

export const vaultActions: VaultActions = {
  add: (vault, entries) => {
    return vault.concat(entries)
  },
  remove: (vault, entries) => {
    return vault.filter(existing => {
      return !entries.some(entry => {
        // return ['service', 'owner'].every(key => existing[key] === entry[key])
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
    entries.forEach(entry => {
      if (entry.owner !== userInfo.username) return
      entry.sharedWith.forEach(username => {
        uploadEntry(entry, username, getRandBase64('salt'), getRandBase64('iv'))
      })
    })

    // const newEntries = 
    //   entries.map(({ newService, service, ...rest }) => {
    //     return { ...rest, service: newService || service }
    //   })

    // newEntries.forEach(entry => {
    //   entry.sharedWith.forEach(username => {
    //     uploadEntry(entry, username, getRandBase64('salt'), getRandBase64('iv'))
    //   })
    // })

    return vaultActions.add(
      vaultActions.remove(vault, entries, userInfo),
      entries,
      userInfo,
      // entries.map(entry => {
      //   return { ...entry, service: entry.newService || entry.service }
      // })
      // entries.map(({ newService, service, ...rest }) => {
      //   return { ...rest, service: newService || service }
      // })
      // newEntries
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
    }
  },
  update: {
    'New service name already exists': (vault, entry) => {
      return vault.some(existing => existing.service === entry.service && existing.owner === entry.owner)
      // const { newService, service } = entry
      // if (!newService) throw Error('no new service name found');
      // if (newService === service) return false
      // return vault.some(existing => newService === existing.service && entry.owner === existing.owner)
    },
    'Cannot update this entry, you are not the owner': (vault, entry, userInfo) => {
      // return entry.owner !== useUser().user?.username
      return entry.owner !== userInfo.username
    }
  },
  remove: {},
  share: {
    // sharedWith cannot contain owner
    // verify new usernames exist with fetch request OR just let the form take care of this
    // shared with cannot contain a existing users
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
  auto: {},
}
