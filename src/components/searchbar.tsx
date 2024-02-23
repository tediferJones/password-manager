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

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Table } from '@tanstack/react-table'
import capAndSplit from '@/lib/capAndSplit'
import { Entry } from '@/types'
import { useState } from 'react'

export default function Searchbar({ table }: { table: Table<Entry> }) {
  const [searchBy, setSearchBy] = useState('service')
  const [searchByIsOpen, setSearchByIsOpen] = useState(false);
  const [filterColsIsOpen, setFilterColsIsOpen] = useState(false);

  return (
    <div className='w-full flex gap-4'>
      <Input
        placeholder={`Search by ${capAndSplit(searchBy.split(''))}...`}
        value={(table.getColumn(searchBy)?.getFilterValue() as string) ?? ''}
        onChange={(event) => table.getColumn(searchBy)?.setFilterValue(event.target.value)}
      />
      <DropdownMenu open={searchByIsOpen} onOpenChange={setSearchByIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button onClick={() => setSearchByIsOpen(!searchByIsOpen)}>
            Search
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
                return <DropdownMenuRadioItem key={col.id} value={col.id}>
                  {capAndSplit(col.id.split(''))}
                </DropdownMenuRadioItem>
              })
            }
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
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
    </div>
  )
}
