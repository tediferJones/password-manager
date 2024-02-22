import { Entry } from "@/types";

// Theoretically we dont need to check for existing service names here,
// This step should have already been done in the editVault function

export const vaultActions = {
  add: (vault: Entry[], toChange: Entry[]) => {
    // Only add entries that have a unique service name
    const existing = vault.map(entry => entry.service)
    return vault.concat(toChange.filter(entry => !existing.includes(entry.service)));
  },
  remove: (vault: Entry[], toChange: Entry[]) => {
    // Filter out all values with matching service name
    const services = toChange.map(entry => entry.service)
    return vault.filter(({ service }) => !services.includes(service))
  },
  update: (vault: Entry[], toChange: Entry[]) => {
    // Just remove and then add
    return vaultActions.add(
      vaultActions.remove(vault, toChange),
      toChange.map(entry => {
        if (!entry.newService) throw Error('failed to update, no newService found')
        return { ...entry, service: entry.newService }
      })
    )
  },
}
