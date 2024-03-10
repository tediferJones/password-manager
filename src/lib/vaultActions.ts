import { ActionErrors, ActionFunc, VaultActions } from '@/types';
import { deleteShares, shareHandler } from '@/lib/shareManager';

const basicActions: { [key in 'add' | 'remove' | 'update']: ActionFunc } = {
  add: (vault, entries, userInfo) => {
    return vault.concat(entries)
  },
  remove: (vault, entries, userInfo) => {
    const entryIds = entries.map(entry => entry.uuid);
    return vault.filter(existing => !entryIds.includes(existing.uuid));
  },
  update: (vault, entries, userInfo) => {
    return basicActions.add(
      basicActions.remove(vault, entries, userInfo),
      entries
        // Add entry as long as you are the owner or your username is included in sharedWith
        .filter(entry => entry.owner === userInfo.username || entry.sharedWith.includes(userInfo.username))
        .map(entry => ({ ...entry, date: new Date() })),
      userInfo,
    )
  },
}

export const vaultActions: VaultActions = {
  add: (vault, entries, userInfo) => {
    return basicActions.add(vault, entries, userInfo)
  },
  remove: (vault, entries, userInfo) => {
    shareHandler('remove', vault, entries, userInfo);
    return basicActions.remove(vault, entries, userInfo)
  },
  update: (vault, entries, userInfo) => {
    shareHandler('update', vault, entries, userInfo);
    return basicActions.update(vault, entries, userInfo)
  },
  share: (vault, entries, userInfo) => {
    // Should probably just merge this into update
    return vaultActions.update(vault, entries, userInfo)
  },
  unshare: (vault, entries, userInfo) => {
    shareHandler('unshare', vault, entries, userInfo);
    return basicActions.update(vault, entries, userInfo)
  },
  pending: (vault, entries, userInfo) => {
    deleteShares(entries)
    return basicActions.add(vault, entries, userInfo)
  },
  auto: (vault, entries, userInfo) => {
    deleteShares(entries)
    return basicActions.update(vault, entries, userInfo)
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
    'UUID not found': (vault, entry, userInfo) => {
      return !vault.some(existing => existing.uuid === entry.uuid)
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
