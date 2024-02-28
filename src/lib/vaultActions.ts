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
    // Only add entries that have a unique service name
    // const existing = vault.map(entry => entry.service)
    // return vault.concat(entries.filter(entry => !existing.includes(entry.service)));

    return vault.concat(entries)
  },
  remove: (vault, entries) => {
    // Filter out all values with matching service name
    // const services = entries.map(entry => entry.service)
    // return vault.filter(({ service }) => !services.includes(service))

    return vault.filter(existing => {
      return !entries.some(entry => {
        return ['service', 'owner'].every(key => existing[key] === entry[key])
      })
    })
  },
  update: (vault, entries) => {
    // Just remove and then add
    entries.forEach(entry => {
      entry.sharedWith.forEach(username => {
        uploadEntry(entry, username, getRandBase64('salt'), getRandBase64('iv'))
      })
    })
    return vaultActions.add(
      vaultActions.remove(vault, entries),
      entries.map(entry => {
        return { ...entry, service: entry.newService || entry.service }
      })
    )
  },
  share: (vault, entries) => {
    return vaultActions.update(vault, entries)
  },

  // add: (vault: Entry[], entry: Entry) => {
  //   return vault.concat(entry)
  // },
  // remove: (vault: Entry[], entry: Entry) => {
  //   return vault.toSpliced(
  //     vault.findIndex(existing => ['service', 'owner'].every(key => entry[key] === existing[key])),
  //     1
  //   )
  // },
  // update: (vault: Entry[], entry: Entry) => {
  //   const { newService, service, ...rest } = entry;

  //   entry.sharedWith.forEach(username => {
  //     uploadEntry(entry, username, getRandBase64('salt'), getRandBase64('iv'))
  //   })

  //   return vaultActions.add(
  //     vaultActions.remove(vault, entry),
  //     { ...rest, service: newService ? newService : service }
  //   )
  // },
  // share: (vault: Entry[], entry: Entry) => {
  //   return vaultActions.update(vault, entry)
  // },
}

export const actionErrors: ActionErrors = {
  add: {
    'This service already exists': (vault: Entry[], entry: Entry) => {
      return vault.some(existing => existing.service === entry.service && existing.owner === entry.owner)
    }
  },
  update: {
    'New service name already exists': (vault: Entry[], entry: Entry) => {
      const { newService, service } = entry
      if (!newService) throw Error('no new service name found');
      if (newService === service) return false
      return vault.some(existing => newService === existing.service && entry.owner === existing.owner)
    }
  },
  remove: {},
  share: {
    // sharedWith cannot contain owner
    // verify new usernames exist with fetch request OR just let the form take care of this
    // shared with cannot contain a existing users
    'You are the owner of this entry': (vault: Entry[], entry: Entry) => {
      return entry.sharedWith.includes(entry.owner)
    },
    'Already shared with this user': (vault: Entry[], entry: Entry) => {
      return entry.sharedWith.length !== new Set(entry.sharedWith).size
    }
  }
}
