import { EditVaultFunction, TableColumns } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "../ui/checkbox";
import ColumnHeader from "./columnHeader";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import RowActions from "./rowActions";

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
      cell: ({ row }) => {
        const [showPwd, setShowPwd] = useState(false);
        return (
          <div className='flex gap-2'>
            <div className='w-full truncate'
              onMouseEnter={() => setShowPwd(true)}
              onMouseLeave={() => setShowPwd(false)}
            >
              {showPwd ? row.getValue('password') : '●●●●●●●●'}
            </div>
            <button onClick={() => setShowPwd(!showPwd)}>
              {showPwd ? <EyeOff className='h-4 w-4 mx-4' /> : 
                <Eye className='h-4 w-4 mx-4'/>
              }
            </button>
          </div>
        )
      }
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => <RowActions row={row} editVault={editVault} />
    },
  ] as ColumnDef<TableColumns>[] 
}
