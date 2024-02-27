import { useEffect, useState } from 'react';
import { Table } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import GetRandomString from '@/components/getRandomString';
import Searchbar from '@/components/searchbar';
import CustomDialog from '@/components/customDialog';
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
      <GetRandomString buttonText='Copy' />
      <CustomDialog 
        action='delete'
        description='Are you sure you want to delete these entries?'
        formData={table.getFilteredSelectedRowModel().rows.map(row => row.original)}
        submitFunc={(e, state) => {
          console.log('submited delete 2.0')
          e.preventDefault();
          editVault({
            action: 'remove',
            toChange: table.getFilteredSelectedRowModel().rows.map(row => row.original)
          })
          table.resetRowSelection();
          state.setIsOpen(false);
        }}
      />

      <CustomDialog 
        action='update'
        formData={table.getFilteredSelectedRowModel().rows.map(row => row.original)}
        submitFunc={(e, state) => {
          e.preventDefault();
          console.log('update dialog', e, state)
          const [ currentRow ] = table.getFilteredSelectedRowModel().rows;
          console.log('EDITING', currentRow.original)
          console.log(state)
          // state.setErrors([]);
          // const error = editVault({
          //   action: 'update',
          //   toChange: [{
          //     ...currentRow.original,
          //     newService: e.currentTarget.service.value,
          //     userId: e.currentTarget.userId.value,
          //     password: e.currentTarget.password.value,
          //   }],
          // })
          // if (error) {
          //   state.setErrors([error]) 
          // } else {
          //   setNextEntry(
          //     table.getFilteredSelectedRowModel().rows.map(row => row.original),
          //     // table.getFilteredSelectedRowModel().rows[0].original,
          //     state.formRef,
          //     state.setIsOpen,
          //   )
          //   currentRow.toggleSelected(false);
          // }
          //
          // error ? state.setErrors([error]) 
          //   : setNextEntry(
          //     table.getFilteredSelectedRowModel().rows.map(row => row.original),
          //     state.formRef,
          //     state.setIsOpen
          //   );
        }}
        skipFunc={(e, state) => {
          console.log('this is the part where we skip')
          e.preventDefault();
          // state.setEntryOffset(state.entryOffset + 1)
          // setNextEntry(
          //   table.getFilteredSelectedRowModel().rows.map(row => row.original),
          //   // table.getFilteredSelectedRowModel().rows[0].original,
          //   state.formRef,
          //   state.setIsOpen,
          // );
          table.getFilteredSelectedRowModel().rows[0].toggleSelected(false);
        }}
      />

      <Button disabled={!table.getFilteredSelectedRowModel().rows.length}>Share</Button>

      <CustomDialog 
        // triggerText={`Pending 2.0 (${pendingShares.length})`}
        action='pending'
        formData={pendingShares}
        submitFunc={(e, state) => {
          e.preventDefault();
          console.log('submit pending', e, state)
        }}
        skipFunc={(e, state) => {
          e.preventDefault();
          console.log('skip pending', e, state)
          console.log('pending', pendingShares)
          // setNextEntry(
          //   pendingShares,
          //   // table.getFilteredSelectedRowModel().rows.map(row => row.original),
          //   state.formRef,
          //   state.setIsOpen,
          // );
          state.setEntryOffset(state.entryOffset + 1)
          // setPendingShares(pendingShares.slice(1))
        }}
      />

      <CustomDialog 
        action='add'
        submitFunc={(e, state) => {
          e.preventDefault();
          state.setErrors([]);
          const error = editVault({
            action: 'add',
            toChange: [{
              service: e.currentTarget.service.value,
              userId: e.currentTarget.userId.value,
              password: e.currentTarget.password.value,
              sharedWith: [],
              owner: userInfo.username,
            }],
          })
          error ? state.setErrors([error]) : state.setIsOpen(false);
        }}
      />
      <Searchbar table={table} />
    </div>
  )
}
