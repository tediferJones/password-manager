import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
  VisibilityState,
} from '@tanstack/react-table'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { useState } from 'react';
import TableOptions from '@/components/table/tableOptions';
import getColumnDefs from '@/components/table/columns';
import { EditVaultFunction, Entry } from '@/types';

export default function MyTable({ 
  data,
  editVault,
}: {
  data: Entry[],
  editVault: EditVaultFunction,
}) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})

  const columns = getColumnDefs(editVault)
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),

    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),

    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),

    onColumnVisibilityChange: setColumnVisibility,

    onRowSelectionChange: setRowSelection,

    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  const getCustomClass: {
    [key in 'header' | 'cell']: {
      [key: string]: string
    }
  } = {
    header: {
      select: 'w-12',
      service: 'max-w-0',
      userId: 'max-w-0 sm:table-cell hidden',
      password: 'max-w-0 md:table-cell hidden',
      owner: 'max-w-0',
      actions: 'w-12',
    },
    cell: {
      select:   'my-auto px-0',
      service:  'truncate max-w-0',
      userId:   'truncate max-w-0 sm:table-cell hidden',
      password: 'truncate max-w-0 md:table-cell hidden',
      owner:    'truncate max-w-0',
      actions:  'my-auto px-0',
    }
  }

  return (
    <div className='rounded-md border w-11/12 md:w-4/5 mx-auto my-8'>
      <TableOptions {...{ table, editVault }} />
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                console.log(header.column.id)
                return (
                  <TableHead key={header.id}
                    className={getCustomClass.header[header.column.id]}
                  >
                    {header.isPlaceholder ? null :
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}
                    className={getCustomClass.cell[cell.column.id]}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className='h-24 text-center'>
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
