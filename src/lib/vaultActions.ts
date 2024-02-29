import { ActionErrors, Entry, VaultActions } from '@/types';
import { encrypt, getFullKey, getHash, getRandBase64 } from '@/lib/security';
import { useUser } from '@clerk/nextjs';

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
    return vault.concat(entries)
  },
  remove: (vault, entries) => {
    return vault.filter(existing => {
      return !entries.some(entry => {
        return ['service', 'owner'].every(key => existing[key] === entry[key])
      })
    })
  },
  update: (vault, entries) => {
    // Send new entry to all shared users
    entries.forEach(entry => {
      entry.sharedWith.forEach(username => {
        uploadEntry(entry, username, getRandBase64('salt'), getRandBase64('iv'))
      })
    })

    return vaultActions.add(
      vaultActions.remove(vault, entries),
      // entries.map(entry => {
      //   return { ...entry, service: entry.newService || entry.service }
      // })
      entries.map(({ newService, service, ...rest }) => {
        return { ...rest, service: newService || service }
      })
    )
  },
  share: (vault, entries) => {
    return vaultActions.update(vault, entries)
  },
}

export const actionErrors: ActionErrors = {
  add: {
    'This service already exists': (vault, entry) => {
      return vault.some(existing => existing.service === entry.service && existing.owner === entry.owner)
    }
  },
  update: {
    'New service name already exists': (vault, entry) => {
      const { newService, service } = entry
      if (!newService) throw Error('no new service name found');
      if (newService === service) return false
      return vault.some(existing => newService === existing.service && entry.owner === existing.owner)
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
  }
}
