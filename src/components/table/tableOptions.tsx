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
      )).sort((a, b) => new Date(a.decrypted.date).getTime() - new Date(b.decrypted.date).getTime())
      .reduce((obj, newEntry) => {
        // const keys = ['service', 'owner'];
        // const vault = table.getCoreRowModel().rows.map(row => row.original)
        // const entryExists = vault.some((entry) => keys.every(key => entry[key] === newEntry.decrypted[key]))
        const entryExists = (
          table.getCoreRowModel().rows
          .map(row => row.original)
          .some((entry) => 
            ['service', 'owner'].every(key => entry[key] === newEntry.decrypted[key])
          )
        )
        if (entryExists) {
          obj.existingShares.push(newEntry)
        } else {
          obj.newShares.push(newEntry)
        }
        return obj
      }, { newShares: [], existingShares: [] } as { newShares: NewShare[], existingShares: NewShare[] })

      // YOU STILL HAVE TO REVERSE THREAD THE NEEDLE
      // If a userA shares an entry with userB and then also updates that entry, 
      // then userB will recieve two seperate requests for the same entry

      const error = editVault('update', entries.existingShares.map(share => share.decrypted))
      console.log(error)
      if (!error) {
        entries.existingShares.forEach(entry => {
          fetch('/api/share', {
            method: 'DELETE',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(entry.encrypted)
          })
        })
      }
      console.log(error)

      // .filter(newEntry =>  {
      //   // array is already in order
      //   // if the decrypted entry exists, update user vault and return false to filter out this element
      //   // if entry doesnt exist, return true, this is a new entry that has not been accepted by the user
      //   const keys = ['service', 'owner'];
      //   const vault = table.getCoreRowModel().rows.map(row => row.original)
      //   const entryExists = vault.some((entry) => keys.every(key => entry[key] === newEntry.decrypted[key]))
      //   if (entryExists) {
      //     editVault()
      //     return false
      //   }
      //   return true
      // })
      console.log('Fetched entries', entries)

      // console.log(table.getCoreRowModel())
      // const vault = table.getCoreRowModel().rows.map(row => row.original)
      // console.log(vault)
      // Update existing and remove entry from DB

      setPendingShares(entries.newShares)
      // setPendingShares(entries)
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
            newService: e.currentTarget.service.value,
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
          // console.log('submit pending', e, state)
          // console.log('current entry', state.getCurrentEntry())
          const entry = state.getCurrentEntry();
          if (!entry) throw Error('No entry found')
          const error = editVault('add', [entry])
          if (error) return state.setErrors([error])
          fetch('/api/share', {
            method: 'DELETE',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(pendingShares[state.entryOffset].encrypted)
          })
          setPendingShares(pendingShares.toSpliced(state.entryOffset, 1))
          // error ? state.setErrors([error]) :
          //   setPendingShares(pendingShares.toSpliced(state.entryOffset, 1))
        }}
        skipFunc={(e, state) => {
          e.preventDefault();
          // console.log('skip pending', e, state)
          // console.log('pending', pendingShares)
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
            owner: username,
          }])
          error ? state.setErrors([error]) : state.setIsOpen(false);
        }}
      />
      <Searchbar table={table} />
    </div>
  )
}
