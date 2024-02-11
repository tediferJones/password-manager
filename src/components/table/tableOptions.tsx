import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu" 

import { Input } from "@/components/ui/input";
import { Button } from "../ui/button";
import { Table } from "@tanstack/react-table";
import AddEntry from "../addEntry";

export default function TableOptions({
  table,
  editVault,
}: {
  table: Table<any>,
  editVault: Function,
}) {
  return (
    <div className="flex items-center py-4 mx-4 gap-4 flex-wrap">
      <div className="flex-1 text-sm text-muted-foreground">
        {table.getFilteredSelectedRowModel().rows.length} of{" "}
        {table.getFilteredRowModel().rows.length} selected
      </div>
      <Button disabled={!table.getFilteredSelectedRowModel().rows.length} variant='destructive'
        onClick={() => {
          editVault('remove', table.getFilteredSelectedRowModel().rows.map((row) => row.original.service))
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
      <Input
        placeholder="Search..."
        value={(table.getColumn("userId")?.getFilterValue() as string) ?? ""}
        onChange={(event) => table.getColumn("userId")?.setFilterValue(event.target.value)}
      />
    </div>
  )
}
