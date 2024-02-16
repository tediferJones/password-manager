import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu' 

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { Input } from '@/components/ui/input';
import { Button } from '../ui/button';
import { Table } from '@tanstack/react-table';
import AddEntry from '../addEntry';
import { EditVaultFunction } from '@/types';
import { useState } from 'react';
import capAndSplit from '@/lib/capAndSplit';
import EntryForm from '../entryForm';

export default function TableOptions({
  table,
  editVault,
}: {
  table: Table<any>,
  editVault: EditVaultFunction,
}) {
  const [searchBy, setSearchBy] = useState('service')
  const [searchByIsOpen, setSearchByIsOpen] = useState(false);
  const [filterColsIsOpen, setFilterColsIsOpen] = useState(false);

  return (
    <div className='flex items-center py-4 mx-4 gap-4 flex-wrap'>
      <div className='flex-1 text-sm text-muted-foreground'>
        {table.getFilteredSelectedRowModel().rows.length} of{' '}
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
      <DropdownMenu open={filterColsIsOpen} onOpenChange={setFilterColsIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button onClick={() => setFilterColsIsOpen(!filterColsIsOpen)}>Columns</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          {table
            .getAllColumns()
            .filter((column) => column.getCanHide())
            .map((column) => {
              return (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className='capitalize'
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

      <Dialog>
        <DialogTrigger asChild>
          <Button>Add</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Entry</DialogTitle>
          </DialogHeader>
          <form className='grid gap-4 py-4' onSubmit={(e) => {
            e.preventDefault();
            editVault({
              action: 'add',
              keys: [{
                service: e.currentTarget.service.value,
                userId: e.currentTarget.userId.value,
                password: e.currentTarget.password.value,
              }],
            })
          }}>
            <EntryForm />
            <DialogFooter>
              <DialogClose asChild>
                <Button type='submit'>Add</Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className='w-full flex gap-4'>
        <Input
          placeholder={`Search by ${capAndSplit(searchBy.split(''))}...`}
          value={(table.getColumn(searchBy)?.getFilterValue() as string) ?? ''}
          onChange={(event) => table.getColumn(searchBy)?.setFilterValue(event.target.value)}
        />
        <DropdownMenu open={searchByIsOpen} onOpenChange={setSearchByIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button onClick={() => setSearchByIsOpen(!searchByIsOpen)}>
              {capAndSplit(searchBy.split(''))}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className='w-56'>
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
