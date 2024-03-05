import { useEffect, useState } from 'react';
import { Table } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import GeneratePassword from '@/components/subcomponents/generatePassword';
import Searchbar from '@/components/table/searchbar';
import CustomDialog from '@/components/subcomponents/customDialog';
import { EditVaultFunction, Entry, Share } from '@/types';
import { decrypt, getFullKey } from '@/lib/security';
import { useUser } from '@clerk/nextjs';

export default function TableOptions({
  table,
  editVault,
}: {
  table: Table<Entry>,
  editVault: EditVaultFunction,
}) {
  const username = useUser().user?.username;
  if (!username) throw Error('you are not logged in')

  const [pendingShares, setPendingShares] = useState<{ encrypted: Share, decrypted: Entry }[]>([]);

  interface NewShare {
    encrypted: Share,
    decrypted: Entry,
  }

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/share')
      const newShares: Share[] = await res.json()
      const entries = (await Promise.all(
        newShares.map(async (share) => {
          // We only need uuid to delete entry, so there is no need to keep track of encrypted
          return {
            encrypted: share,
            decrypted: JSON.parse(
              await decrypt(
                share.sharedEntry,
                await getFullKey(username, share.salt),
                share.iv,
              )
            )
          } as NewShare
        })
      ))
      // try to use filter instead of reduce, that way entries that way existing entries that were updated can be garbage collected
      // But we need to pass all updates to editVault at once, so we kind of need two seperate arrays
      .reduce((obj, newEntry) => {
        const entryExists = (
          table.getCoreRowModel().rows
          .map(row => row.original)
          .some(entry => entry.uuid === newEntry.decrypted.uuid)
        )
        // console.log('all rows', table.getCoreRowModel().rows.map(row => row.original))
        // console.log('looking for', newEntry.decrypted.uuid)
        obj[entryExists ? 'existingShares' : 'newShares'].push(newEntry);
        return obj
      }, { newShares: [], existingShares: [] } as { newShares: NewShare[], existingShares: NewShare[] })

      if (entries.existingShares.length) {
        // const error = editVault('auto', entries.existingShares.map(share => share.decrypted))
        // console.log('error auto editing vault', error)
        // This must be run in a timeout because react does this goofy double rending thing
        // If we immediately edit the vault, the delete request wont be processed by the time we re-fetch the share
        // CONSIDER CLEARING THIS TIME OUT, JUST LIKE IN shareForm component
        setTimeout(() => {
          console.log('error auto editing vault', 
            editVault('auto', entries.existingShares.map(share => share.decrypted))
          )
        }, 500)
      } else {
        console.log('no existing entries to update')
      }

      // if (!error) {
      //   entries.existingShares.forEach(entry => {
      //     fetch('/api/share', {
      //       method: 'DELETE',
      //       headers: { 'content-type': 'application/json' },
      //       body: JSON.stringify(entry.encrypted)
      //     })
      //   })
      // }

      console.log('Fetched entries', entries)
      setPendingShares(entries.newShares)
    })();
  }, []);

  return (
    <div className='flex items-center py-4 mx-4 gap-4 flex-wrap'>
      <div className='flex-1 text-sm text-muted-foreground'>
        {table.getFilteredSelectedRowModel().rows.length} of{' '}
        {table.getFilteredRowModel().rows.length} selected
      </div>
      <GeneratePassword buttonText='Copy' />
      <CustomDialog 
        action='delete'
        description='Are you sure you want to delete these entries?'
        formData={table.getFilteredSelectedRowModel().rows.map(row => row.original)}
        submitFunc={(e, state) => {
          e.preventDefault();
          editVault('remove',
            table.getFilteredSelectedRowModel().rows.map(row => row.original)
          );
          table.resetRowSelection();
          state.setIsOpen(false);
        }}
      />

      <CustomDialog 
        action='update'
        formData={table.getFilteredSelectedRowModel().rows.map(row => row.original)}
        submitFunc={(e, state) => {
          e.preventDefault();
          const [ currentRow ] = table.getFilteredSelectedRowModel().rows;
          state.setErrors([]);
          console.log('edit vault func')
          const error = editVault('update', [{
            ...currentRow.original,
            service: e.currentTarget.service.value,
            userId: e.currentTarget.userId.value,
            password: e.currentTarget.password.value,
          }])
          error ? state.setErrors([error]) : currentRow.toggleSelected(false);
        }}
        skipFunc={(e, state) => {
          e.preventDefault();
          table.getFilteredSelectedRowModel().rows[0].toggleSelected(false);
        }}
      />

      <Button disabled={!table.getFilteredSelectedRowModel().rows.length}>Share</Button>

      <CustomDialog 
        action='pending'
        formData={pendingShares.map(pending => pending.decrypted)}
        submitFunc={(e, state) => {
          e.preventDefault();
          const entry = state.getCurrentEntry();
          if (!entry) throw Error('No entry found')
          const error = editVault('pending', [entry])
          error ? state.setErrors([error]) : 
            setPendingShares(pendingShares.toSpliced(state.entryOffset, 1))

          // if (error) return state.setErrors([error])
          // fetch('/api/share', {
          //   method: 'DELETE',
          //   headers: { 'content-type': 'application/json' },
          //   body: JSON.stringify(pendingShares[state.entryOffset].encrypted)
          // })
          // setPendingShares(pendingShares.toSpliced(state.entryOffset, 1))
        }}
        skipFunc={(e, state) => {
          e.preventDefault();
          state.setEntryOffset(state.entryOffset + 1)
        }}
      />

      <CustomDialog 
        action='add'
        submitFunc={(e, state) => {
          e.preventDefault();
          state.setErrors([]);
          const error = editVault('add', [{
            service: e.currentTarget.service.value,
            userId: e.currentTarget.userId.value,
            password: e.currentTarget.password.value,
            sharedWith: [],
            date: new Date(),
            uuid: `${username}-${crypto.randomUUID()}`,
            owner: username,
          }])
          error ? state.setErrors([error]) : state.setIsOpen(false);
        }}
      />
      <Searchbar table={table} />
    </div>
  )
}
