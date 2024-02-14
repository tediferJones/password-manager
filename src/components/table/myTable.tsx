// "use client"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
  VisibilityState,
  Column,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog"

import * as React from 'react';
import TableOptions from "./tableOptions";
import { EditVaultFunction, Entry, TableColumns } from "@/types";
import { Checkbox } from "../ui/checkbox";
import { Button } from "../ui/button";
import { ArrowUpDown, ArrowUp, ArrowDown, MoreHorizontal, X } from "lucide-react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

export default function MyTable({
  data,
  editVault,
}: {
  data: Entry[],
  editVault: EditVaultFunction,
}) {
  function capAndSplit(str: string[], i = 0) {
    if (!str[i]) return str.join('');
    if (i === 0) return capAndSplit(str.with(0, str[0].toUpperCase()), i + 1)
    if ('A' < str[i] && str[i] < 'Z') return capAndSplit(str.toSpliced(i, 0, ' '), i + 2)
    return capAndSplit(str, i + 1)
  }

  function getHeader(column: Column<TableColumns>) {
    const sortDir= column.getIsSorted();
    return <div className='flex justify-between items-center w-full sm:flex-row flex-col'>
      <p className='truncate'>{capAndSplit(column.id.split(''))}</p>
      <div className='flex items-center gap-2'>
        {!sortDir ? [] : 
          <button onClick={() => column.clearSorting()}>
            <X className='cursor-pointer h-4 w-4'></X>
          </button>
        }
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {sortDir === 'asc' ? <ArrowUp  className="h-4 w-4 cursor-pointer"/>
            : sortDir === 'desc' ? <ArrowDown  className="h-4 w-4 cursor-pointer"/>
              : <ArrowUpDown  className="h-4 w-4 cursor-pointer"/>
          }
        </button>
      </div>
    </div>
  }

  const columns: ColumnDef<TableColumns>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          className='ml-4'
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "service",
      header: ({ column }) => getHeader(column),
    },
    {
      accessorKey: "userId",
      header: ({ column }) => getHeader(column,)
    },
    {
      accessorKey: "password",
      header: ({ column }) => getHeader(column),
      cell: ({ row }) => {
        const pwd: string = row.getValue('password')
        const dummyPwd = '●●●●●●●●';
        return (
          <div // className='text-transparent bg-gray-400 h-min max-w-min hover:bg-transparent hover:text-current px-2 rounded overflow-ellipsis overflow-hidden'
            // className='text-transparent bg-gray-400 h-min hover:bg-transparent hover:text-current rounded truncate px-2'
            onMouseEnter={(e) => e.currentTarget.innerText = pwd}
            onMouseLeave={(e) => e.currentTarget.innerText = dummyPwd}
          >
            {dummyPwd}
          </div>
        )
      }
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        return (
          <Dialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(row.getValue('userId'))}>
                  Copy User Id 
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(row.getValue('password'))}>
                  Copy Password
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <DialogTrigger asChild>
                  <DropdownMenuItem>
                    Update
                  </DropdownMenuItem>
                </DialogTrigger>

                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => editVault({ action: 'remove', keys: [row.original] })}>
                  Delete
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Share</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Entry</DialogTitle>
                <DialogDescription>
                  Something something, update entry information here
                </DialogDescription>
              </DialogHeader>
              <form className='grid gap-4 py-4' onSubmit={(e) => {
                e.preventDefault();
                const newEntry = {
                  service: e.currentTarget.service.value,
                  userId: e.currentTarget.userId.value,
                  password: e.currentTarget.password.value,
                }
                console.log(newEntry)
              }}>
                <div className='grid grid-cols-4 items-center gap-4'>
                  <Label htmlFor='service' className='text-center'>
                    Service
                  </Label>
                  <Input
                    id='service'
                    className='col-span-3'
                    placeholder='amazon.com'
                    required
                    maxLength={64}
                    defaultValue={row.original.service}
                  />
                </div>
                <div className='grid grid-cols-4 items-center gap-4'>
                  <Label htmlFor='userId' className='text-center'>
                    User ID
                  </Label>
                  <Input
                    id='userId'
                    className='col-span-3'
                    placeholder='Email or Username'
                    required
                    maxLength={64}
                    defaultValue={row.original.userId}
                  />
                </div>
                <div className='grid grid-cols-4 items-center gap-4'>
                  <Label htmlFor='password' className='text-center'>
                    Password
                  </Label>
                  <Input
                    id='password'
                    placeholder='myPassword123'
                    className='col-span-3'
                    required
                    maxLength={64}
                    defaultValue={row.original.password}
                    type='password'
                    onMouseOver={(e) => e.currentTarget.type = 'text'}
                    onMouseLeave={(e) => e.currentTarget.type = 'password'}
                    onFocus={(e) => e.currentTarget.type = 'text'}
                    onBlur={(e) => e.currentTarget.type = 'password'}
                  />
                </div>

                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="submit">Confirm</Button>
                  </DialogClose>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )
      },
    },
  ]

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

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

  return (
    <div className="rounded-md border">
      <TableOptions table={table} editVault={editVault} />
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}
                    className={['actions', 'select'].includes(header.column.id) ? 'w-12' : 'max-w-0'}
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
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}
                    className={['actions', 'select'].includes(cell.column.id) ? 'my-auto px-0' : 'truncate max-w-0'}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

