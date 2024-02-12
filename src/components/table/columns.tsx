"use client"

import { Column, ColumnDef } from "@tanstack/react-table";
import { Button } from "../ui/button";
import { ArrowUpDown, ArrowUp, ArrowDown, MoreHorizontal, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "../ui/checkbox";
import { TableColumns } from "@/types";

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
        <X onClick={() => column.clearSorting()} className='cursor-pointer h-4 w-4'></X>
      }
      {sortDir === 'asc' ? <ArrowUp onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}  className="ml-2 h-4 w-4 cursor-pointer"/>
        : sortDir === 'desc' ? <ArrowDown onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}  className="ml-2 h-4 w-4 cursor-pointer"/>
          : <ArrowUpDown onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="ml-2 h-4 w-4 cursor-pointer"/>
      }
    </div>
  </div>
}

export const columns: ColumnDef<TableColumns>[] = [
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
      return (
        <div className='text-transparent bg-gray-400 h-min max-w-min hover:bg-transparent hover:text-current px-2 rounded overflow-ellipsis overflow-hidden'>
          {row.getValue('password')}
        </div>
      )
    }
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(row.getValue('userId'))}
            >
              Copy User ID 
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(row.getValue('password'))}
            >
              Copy Password
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Share</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

