import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import ColumnHeader from '@/components/table/columnHeader';
import RowActions from '@/components/table/rowActions';
import ShowHidePwd from '@/components/subcomponents/showHidePwd';
import { EditVaultFunction, Entry } from '@/types';

export default function getColumnDefs(editVault: EditVaultFunction) {
  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label='Select all'
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          className='ml-4'
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label='Select row'
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'service',
      header: ({ column }) => <ColumnHeader column={column} />,
    },
    {
      accessorKey: 'userId',
      header: ({ column }) => <ColumnHeader column={column} />,
    },
    {
      accessorKey: 'password',
      header: ({ column }) => <ColumnHeader column={column} />,
      cell: ({ row }) => <ShowHidePwd pwd={row.getValue('password')} truncate />,
    },
    {
      accessorKey: 'owner',
      header: ({ column }) => <ColumnHeader column={column} />
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => <RowActions row={row} editVault={editVault} />
    },
  ] as ColumnDef<Entry>[] 
}
