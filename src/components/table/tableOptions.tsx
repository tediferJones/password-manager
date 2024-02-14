import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu" 

import { Input } from "@/components/ui/input";
import { Button } from "../ui/button";
import { Table } from "@tanstack/react-table";
import AddEntry from "../addEntry";
import { EditVaultFunction } from "@/types";
import { useState } from "react";

export default function TableOptions({
  table,
  editVault,
}: {
  table: Table<any>,
  editVault: EditVaultFunction,
}) {
  const [searchBy, setSearchBy] = useState('service')
  function capAndSplit(str: string[], i = 0) {
    if (!str[i]) return str.join('');
    if (i === 0) return capAndSplit(str.with(0, str[0].toUpperCase()), i + 1)
    if ('A' < str[i] && str[i] < 'Z') return capAndSplit(str.toSpliced(i, 0, ' '), i + 2)
    return capAndSplit(str, i + 1)
  }
  return (
    <div className="flex items-center py-4 mx-4 gap-4 flex-wrap">
      <div className="flex-1 text-sm text-muted-foreground">
        {table.getFilteredSelectedRowModel().rows.length} of{" "}
        {table.getFilteredRowModel().rows.length} selected
      </div>
      <Button disabled={!table.getFilteredSelectedRowModel().rows.length} variant='destructive'
        onClick={() => {
          editVault({
            action: 'remove',
            keys: table.getFilteredSelectedRowModel().rows.map(row => row.original),
          })
          table.resetRowSelection()
        }}
      >Delete</Button>
      <Button disabled={!table.getFilteredSelectedRowModel().rows.length}>Share</Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="ml-auto">Columns</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {table
            .getAllColumns()
            .filter((column) => column.getCanHide())
            .map((column) => {
              return (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) =>
                    column.toggleVisibility(!!value)
                  }
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              )
            })}
        </DropdownMenuContent>
      </DropdownMenu>
      <AddEntry editVault={editVault} />
      <div className='w-full flex gap-4'>
        <Input
          // placeholder="Search..."
          // value={(table.getColumn("userId")?.getFilterValue() as string) ?? ""}
          // onChange={(event) => table.getColumn("userId")?.setFilterValue(event.target.value)}
          placeholder={`Search by ${capAndSplit(searchBy.split(''))}...`}
          value={(table.getColumn(searchBy)?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn(searchBy)?.setFilterValue(event.target.value)}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>{capAndSplit(searchBy.split(''))}</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Search by column</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup value={searchBy} onValueChange={(newSearchCol) => {
              const searchTerm = table.getColumn(searchBy)?.getFilterValue()
              table.getColumn(searchBy)?.setFilterValue('')
              table.getColumn(newSearchCol)?.setFilterValue(searchTerm)
              setSearchBy(newSearchCol);
            }}>
              {table.getAllColumns()
                .filter(col => !['actions', 'select'].includes(col.id))
                .map(col => {
                  return <DropdownMenuRadioItem key={col.id} value={col.id}>{capAndSplit(col.id.split(''))}</DropdownMenuRadioItem>
                })
              }
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
