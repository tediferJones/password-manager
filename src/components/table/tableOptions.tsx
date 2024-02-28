import { useEffect, useState } from 'react';
import { Table } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import GeneratePassword from '@/components/subcomponents/generatePassword';
import Searchbar from '@/components/table/searchbar';
import CustomDialog from '@/components/subcomponents/customDialog';
import { EditVaultFunction, Entry, Share, UserInfo } from '@/types';
import { decrypt, getFullKey } from '@/lib/security';

export default function TableOptions({
  table,
  editVault,
  userInfo,
}: {
  table: Table<Entry>,
  editVault: EditVaultFunction,
  userInfo: UserInfo,
}) {
  const [pendingShares, setPendingShares] = useState<Entry[]>([]);
  useEffect(() => {
    (async () => {
      const res = await fetch('/api/share')
      const newShares: Share[] = await res.json()
      setPendingShares(
        await Promise.all(newShares.map(async (share) => {
          return JSON.parse(
            await decrypt(
              share.sharedEntry,
              await getFullKey(userInfo.username, share.salt),
              share.iv,
            )
          );
        }))
      )
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

          // const entries = table.getFilteredSelectedRowModel().rows.map(row => row.original);
          // table.getFilteredSelectedRowModel().rows.forEach(row => {
          //   editVault({ action: 'remove', toChange: row.original });
          //   row.toggleSelected(false);
          // })

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
        formData={pendingShares}
        submitFunc={(e, state) => {
          e.preventDefault();
          console.log('submit pending', e, state)
          console.log('current entry', state.getCurrentEntry())
          const entry = state.getCurrentEntry();
          if (!entry) throw Error('No entry found')
          const error = editVault('add', [entry])
          error ? state.setErrors([error]) :
            setPendingShares(pendingShares.toSpliced(state.entryOffset, 1))
        }}
        skipFunc={(e, state) => {
          e.preventDefault();
          console.log('skip pending', e, state)
          console.log('pending', pendingShares)
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
            owner: userInfo.username,
          }])
          error ? state.setErrors([error]) : state.setIsOpen(false);
        }}
      />
      <Searchbar table={table} />
    </div>
  )
}
