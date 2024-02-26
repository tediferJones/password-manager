import { Dispatch, RefObject, SetStateAction, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table } from '@tanstack/react-table';
import GetRandomString from '@/components/getRandomString';
// import DeleteMultiple from '@/components/dialogs/deleteMultiple';
// import UpdateMultiple from '@/components/dialogs/updateMultiple';
// import AddSingle from '@/components/dialogs/addSingle';
import Searchbar from '@/components/searchbar';
import PendingShares from '@/components/dialogs/pendingShares';
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

  function setForm(entry: Entry, formRef: RefObject<HTMLFormElement>) {
    if (formRef.current) {
      formRef.current.service.value = entry.service;
      formRef.current.userId.value = entry.userId;
      formRef.current.password.value = entry.password;
    }
  }

  // Can we move entry iteration to inside of custom dialog component?
  function setNextEntry(
    data: Entry[],
    entry: Entry,
    formRef: RefObject<HTMLFormElement>,
    setIsOpenState: Dispatch<SetStateAction<boolean>>,
  ) {
    if (formRef.current) {
      // const [currentRow, nextRow] = table.getFilteredSelectedRowModel().rows;
      // currentRow.toggleSelected(false);
      // nextRow ? setForm(nextRow.original, formRef) : setIsOpenState(false);
      // currentRow.toggleSelected(false);

      const [currentRow, nextRow] = data;
      // nextRow ? setForm(nextRow, formRef) : setIsOpenState(false);

      if (nextRow) {
        // const strEntry = JSON.stringify(entry)
        // const nextIndex = data.findIndex(entry => JSON.stringify(entry) === strEntry) + 1;
        setForm(
          // data[nextIndex],
          nextRow,
          formRef
        )
      } else {
        setIsOpenState(false)
      }
    }
  }
  return (
    <div className='flex items-center py-4 mx-4 gap-4 flex-wrap'>
      <div className='flex-1 text-sm text-muted-foreground'>
        {table.getFilteredSelectedRowModel().rows.length} of{' '}
        {table.getFilteredRowModel().rows.length} selected
      </div>
      <GetRandomString buttonText='Copy' />
      <CustomDialog 
        triggerText='Delete 2.0'
        triggerVariant='destructive'
        disableTrigger={!table.getFilteredSelectedRowModel().rows.length}
        title='Delete Entry'
        description='Are you sure you want to delete these entries?'
        formType='delete'
        formData={table.getFilteredSelectedRowModel().rows.map(row => row.original)}
        submitText='Delete'
        submitVariant='destructive'
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
        triggerText='Update 2.0'
        disableTrigger={!table.getFilteredSelectedRowModel().rows.length}
        formType='entry'
        formData={table.getFilteredSelectedRowModel().rows.map(row => row.original)}
        title='Update Entry'
        submitText='Update'
        generateRandom
        formReset
        submitFunc={(e, state) => {
          e.preventDefault();
          console.log('update dialog', e, state)
          const [ currentRow ] = table.getFilteredSelectedRowModel().rows;
          console.log('EDITING', currentRow.original)
          state.setErrors([]);
          const error = editVault({
            action: 'update',
            toChange: [{
              ...currentRow.original,
              newService: e.currentTarget.service.value,
              userId: e.currentTarget.userId.value,
              password: e.currentTarget.password.value,
            }],
          })
          if (error) {
            state.setErrors([error]) 
          } else {
            setNextEntry(
              table.getFilteredSelectedRowModel().rows.map(row => row.original),
              // table.getFilteredSelectedRowModel().rows[0].original,
              state.formRef,
              state.setIsOpen,
            )
            currentRow.toggleSelected(false);
          }
          // error ? state.setErrors([error]) 
          //   : setNextEntry(
          //     table.getFilteredSelectedRowModel().rows.map(row => row.original),
          //     state.formRef,
          //     state.setIsOpen
          //   );
        }}
        skipFunc={(e, state) => {
          console.log('this is the part where we skip')
          setNextEntry(
            table.getFilteredSelectedRowModel().rows.map(row => row.original),
            // table.getFilteredSelectedRowModel().rows[0].original,
            state.formRef,
            state.setIsOpen,
          );
          table.getFilteredSelectedRowModel().rows[0].toggleSelected(false);
        }}
      />

      <Button disabled={!table.getFilteredSelectedRowModel().rows.length}>Share</Button>
      <PendingShares editVault={editVault} userInfo={userInfo} />
      <CustomDialog 
        triggerText={`Pending 2.0 (${pendingShares.length})`}
        title='Pending requests'
        submitText='Add'
        formType='entry'
        formData={pendingShares}
        disableInputs
        submitFunc={(e, state) => {
          e.preventDefault();
          console.log('submit pending', e, state)
        }}
        skipFunc={(e, state) => {
          e.preventDefault();
          console.log('skip pending', e, state)
          console.log('pending', pendingShares)
          setNextEntry(
            pendingShares,
            // table.getFilteredSelectedRowModel().rows.map(row => row.original),
            state.formRef,
            state.setIsOpen,
          );
          setPendingShares(pendingShares.slice(1))
        }}
      />

      <CustomDialog 
        triggerText='Add 2.0'
        title={'Add Entry'}
        formType='entry'
        submitText='Add'
        generateRandom
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
