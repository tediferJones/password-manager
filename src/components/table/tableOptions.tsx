import { useEffect, useState } from 'react';
import { Table } from '@tanstack/react-table';
import GeneratePassword from '@/components/subcomponents/generatePassword';
import Searchbar from '@/components/table/searchbar';
import CustomDialog from '@/components/subcomponents/customDialog';
import { EditVaultFunction, Entry, Share } from '@/types';
import { decrypt, getFullKey } from '@/lib/security';
import { useUser } from '@clerk/nextjs';
import { deleteShares } from '@/lib/shareManager';

export default function TableOptions({
  table,
  editVault,
}: {
  table: Table<Entry>,
  editVault: EditVaultFunction,
}) {
  const username = useUser().user?.username;
  if (!username) throw Error('you are not logged in')

  const [pendingShares, setPendingShares] = useState<Entry[]>([]);

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/share')
      const newShares: Share[] = await res.json()
      const existingIds = table.getCoreRowModel().rows.map(row=> row.original.uuid);
      const entries = (
        await Promise.all(
          newShares.map(async (share) => {
            return JSON.parse(
              await decrypt(
                share.sharedEntry,
                await getFullKey(username, share.salt),
                share.iv,
              )
            ) as Entry;
          })
        )
      )
      // try to use filter instead of reduce, that way entries that way existing entries that were updated can be garbage collected
      // But we need to pass all updates to editVault at once, so we kind of need two seperate arrays
      .reduce((obj, newEntry) => {
        const entryExists = existingIds.includes(newEntry.uuid) || !newEntry.sharedWith.includes(username)
        obj[entryExists ? 'existingShares' : 'newShares'].push(newEntry);
        return obj
      }, { newShares: [], existingShares: [] } as { newShares: Entry[], existingShares: Entry[] })

      if (entries.existingShares.length) {
        // This must be run in a timeout because react does this goofy double rending thing
        // If we immediately edit the vault, the delete request wont be processed by the time we re-fetch the shares
        // CONSIDER CLEARING THIS TIME OUT, JUST LIKE IN shareForm component
        setTimeout(() => {
          console.log('error auto editing vault', 
            editVault('auto', entries.existingShares)
          )
        }, 500)
      }

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
          state.setErrors([])
          table.getFilteredSelectedRowModel().rows[0].toggleSelected(false);
        }}
      />

      <CustomDialog 
        action='share'
        formData={table.getFilteredSelectedRowModel().rows.map(row => row.original)}
        submitFunc={(e, state) => {
          e.preventDefault();
          state.setErrors([])
          if (!e.currentTarget.usernameIsValid.ariaChecked) {
            return state.setErrors(['Username is not valid'])
          }

          const row = table.getFilteredSelectedRowModel().rows[state.entryOffset];
          const error = editVault('share', [{
            ...row.original,
            sharedWith: row.original.sharedWith.concat(e.currentTarget.recipient.value)
          }])
          error ? state.setErrors([error]) : state.formRef.current?.reset();
        }}
        skipFunc={(e, state) => {
          e.preventDefault();
          state.setErrors([])
          table.getFilteredSelectedRowModel().rows[state.entryOffset].toggleSelected(false);
        }}
        deleteFunc={(e, state) => {
          console.log('inside delteFunc', e, state)
          e.preventDefault();
          const entry = state.getCurrentEntry();
          if (!entry) return
          editVault('unshare', [{
            ...entry,
            sharedWith: entry.sharedWith.filter(username => username !== e.currentTarget.value)
          }])
        }}
      />

      <CustomDialog 
        action='pending'
        counter={pendingShares.length}
        formData={pendingShares}
        submitFunc={(e, state) => {
          e.preventDefault();
          const entry = state.getCurrentEntry();
          if (!entry) throw Error('No entry found')
          const error = editVault('pending', [entry])
          error ? state.setErrors([error]) : 
            setPendingShares(pendingShares.toSpliced(state.entryOffset, 1))
        }}
        skipFunc={(e, state) => {
          e.preventDefault();
          state.setErrors([])
          state.setEntryOffset(state.entryOffset + 1)
        }}
        rejectFunc={(e, state) => {
          e.preventDefault();
          console.log('IMPORT SHARE DELETE FUNCTION HERE')
          state.setErrors([])
          state.setEntryOffset(state.entryOffset + 1)

          // This will only delete the share from the DB
          // We should also remove the user from the sharedWith list
          // The easiest way to do this, is just to add and then immediately remove the entry
          //
          // const entry = state.getCurrentEntry();
          // if (entry) {
          //   deleteShares([entry])
          //   setPendingShares(pendingShares.toSpliced(state.entryOffset, 1))
          // }
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
