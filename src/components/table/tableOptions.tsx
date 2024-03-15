import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Table } from '@tanstack/react-table';
import GeneratePassword from '@/components/subcomponents/generatePassword';
import Searchbar from '@/components/table/searchbar';
import CustomDialog from '@/components/subcomponents/customDialog';
import { useToast } from '@/components/ui/use-toast';
import { EditVaultFunction, Entry, Share } from '@/types';
import { decrypt, getFullKey } from '@/lib/security';
import { deleteShares, uploadShares } from '@/lib/shareManager';
import easyFetch from '@/lib/easyFetch';

export default function TableOptions({
  table,
  editVault
}: {
  table: Table<Entry>,
  editVault: EditVaultFunction
}) {
  const username = useUser().user?.username;
  if (!username) throw Error('you are not logged in');

  const [pendingShares, setPendingShares] = useState<Entry[]>([]);
  const { toast } = useToast();

  async function getShares() {
    if (!username) throw Error('you are not logged in');
    const newShares: Share[] = await easyFetch('/api/share', 'GET');
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
    ).reduce((obj, newEntry) => {
      const entryExists = existingIds.includes(newEntry.uuid) || !newEntry.sharedWith.includes(username)
      obj[entryExists ? 'existingShares' : 'newShares'].push(newEntry);
      return obj
    }, { newShares: [], existingShares: [] } as { newShares: Entry[], existingShares: Entry[] })

    if (entries.existingShares.length) {
      // This must be run in a timeout because react does this goofy double rending thing
      // If we immediately edit the vault, the delete request wont be processed by the time we re-fetch the shares
      setTimeout(() => editVault('auto', entries.existingShares), 500)
    }

    setPendingShares(entries.newShares)
  }

  useEffect(() => {
    // update initially and re-fetch results every 60 seconds
    getShares();

    let delay: NodeJS.Timeout | undefined
    delay = setInterval(() => getShares(), 60000)
    return () => clearInterval(delay)
  }, []);

  return (
    <div className='flex items-center py-4 mx-4 gap-4 flex-wrap justify-end'>
      <div className='m-auto ml-2 text-sm text-muted-foreground text-wrap'>
        {table.getFilteredSelectedRowModel().rows.length} of{' '}
        {table.getFilteredRowModel().rows.length} selected
      </div>
      <GeneratePassword
        buttonText='Copy'
        func={() => toast({
          title: 'Copied to clipboard',
          duration: 1000
        })}
      />
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
          const error = editVault('update', [{
            ...currentRow.original,
            service: e.currentTarget.service.value,
            userId: e.currentTarget.userId.value,
            password: e.currentTarget.password.value,
          }])
          error ? state.setErrors([error]) : currentRow.toggleSelected(false);
        }}
        extraBtns={{
          Next: {
            variant: 'secondary',
            onClick: (e, state) => {
              e.preventDefault();
              state.setErrors([])
              table.getFilteredSelectedRowModel().rows[0].toggleSelected(false);
            }
          }
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
        deleteFunc={(e, state) => {
          e.preventDefault();
          const entry = state.getCurrentEntry();
          if (!entry) return
          editVault('unshare', [{
            ...entry,
            sharedWith: entry.sharedWith.filter(username => username !== e.currentTarget.value)
          }])
        }}
        extraBtns={{
          Next: {
            variant: 'secondary',
            onClick: (e, state) => {
              e.preventDefault();
              state.setErrors([])
              table.getFilteredSelectedRowModel().rows[state.entryOffset].toggleSelected(false);
            }
          }
        }}
      />

      <CustomDialog 
        action='pending'
        counter={pendingShares.length}
        formData={pendingShares}
        submitText='add'
        submitFunc={(e, state) => {
          e.preventDefault();
          const entry = state.getCurrentEntry();
          if (!entry) throw Error('No entry found')
          const error = editVault('pending', [entry])
          error ? state.setErrors([error]) : 
            setPendingShares(pendingShares.toSpliced(state.entryOffset, 1))
        }}
        extraBtns={{
          Next: {
            variant: 'secondary',
            onClick: (e, state) => {
              e.preventDefault();
              state.setErrors([])
              state.setEntryOffset(state.entryOffset + 1)
            }
          },
          Reject: {
            variant: 'destructive',
            onClick: (e, state) => {
              e.preventDefault();
              state.setErrors([])
              const entry = state.getCurrentEntry();
              if (!entry) return

              const newShareList = entry.sharedWith.filter(user => user !== username);
              uploadShares(
                { ...entry, sharedWith: newShareList },
                newShareList.concat(entry.owner)
              );
              deleteShares([ entry ]);
              setPendingShares(pendingShares.toSpliced(state.entryOffset, 1));
            }
          }
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
