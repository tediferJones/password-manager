import { Button } from '../ui/button';
import { Table } from '@tanstack/react-table';
import { EditVaultFunction, Entry, Share, UserInfo } from '@/types';
import GetRandomString from '../getRandomString';
import DeleteMultiple from '../dialogs/deleteMultiple';
import UpdateMultiple from '../dialogs/updateMultiple';
import AddSingle from '../dialogs/addSingle';
import Searchbar from '../searchbar';
import PendingShares from '../dialogs/pendingShares';

export default function TableOptions({
  table,
  editVault,
  userInfo,
}: {
  table: Table<Entry>,
  editVault: EditVaultFunction,
  userInfo: UserInfo,
}) {
  return (
    <div className='flex items-center py-4 mx-4 gap-4 flex-wrap'>
      <div className='flex-1 text-sm text-muted-foreground'>
        {table.getFilteredSelectedRowModel().rows.length} of{' '}
        {table.getFilteredRowModel().rows.length} selected
      </div>
      <GetRandomString buttonText='Copy' />
      <DeleteMultiple table={table} editVault={editVault} />
      <UpdateMultiple table={table} editVault={editVault} />

      <Button disabled={!table.getFilteredSelectedRowModel().rows.length}>Share</Button>
      <PendingShares editVault={editVault} userInfo={userInfo} />

      <AddSingle editVault={editVault} userInfo={userInfo}/>
      <Searchbar table={table} />
    </div>
  )
}
