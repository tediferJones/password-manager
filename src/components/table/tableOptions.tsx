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
import { EditVaultFunction, Entry, TableColumns } from '@/types';
import { useEffect, useRef, useState } from 'react';
import capAndSplit from '@/lib/capAndSplit';
import EntryForm from '../entryForm';
import ViewErrors from '../viewErrors';
import { getRandPwd } from '@/lib/security';
import GetRandomString from '../getRandomString';

export default function TableOptions({
  table,
  editVault,
}: {
  table: Table<TableColumns>,
  editVault: EditVaultFunction,
}) {
  const [searchBy, setSearchBy] = useState('service')
  const [searchByIsOpen, setSearchByIsOpen] = useState(false);
  const [filterColsIsOpen, setFilterColsIsOpen] = useState(false);

  const [addIsOpen, setAddIsOpen] = useState(false);
  const [addErrors, setAddErrors] = useState<string[]>([]);
  const addForm = useRef<HTMLFormElement>(null);

  const [updateIsOpen, setUpdateIsOpen] = useState(false);
  const [updateErrors, setUpdateErrors] = useState<string[]>([]);
  const updateForm = useRef<HTMLFormElement>(null);

  useEffect(() => setAddErrors([]), [addIsOpen])

  function setForm(entry: Entry) {
    if (updateForm.current) {
      updateForm.current.service.value = entry.service;
      updateForm.current.userId.value = entry.userId;
      updateForm.current.password.value = entry.password;
    }
  }

  function setNextEntry() {
    if (updateForm.current) {
      const [currentRow, nextRow] = table.getFilteredSelectedRowModel().rows;
      currentRow.toggleSelected(false);
      nextRow ? setForm(nextRow.original) : setUpdateIsOpen(false);
    }
  }

  return (
    <div className='flex items-center py-4 mx-4 gap-4 flex-wrap'>
      <div className='flex-1 text-sm text-muted-foreground'>
        {table.getFilteredSelectedRowModel().rows.length} of{' '}
        {table.getFilteredRowModel().rows.length} selected
      </div>
      <GetRandomString buttonText={'Copy'} />
      <Dialog>
        <DialogTrigger asChild>
          <Button disabled={!table.getFilteredSelectedRowModel().rows.length} variant='destructive'>
            Delete
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Are you sure you want to delete these entries?
          </DialogDescription>
          <div className='max-h-[40vh] overflow-y-auto'>
            {table.getFilteredSelectedRowModel().rows.map(row => {
              return <div key={`delete-${row.original.service}`} className='text-center'>{row.original.service}</div>
            })}
          </div>
          <form className='grid gap-4 py-4' onSubmit={(e) => {
            e.preventDefault();
            editVault({
              action: 'remove',
              keys: table.getFilteredSelectedRowModel().rows.map(row => row.original)
            })
            table.resetRowSelection();
          }}>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant='secondary'>Cancel</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button type='submit' variant='destructive'>Delete</Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={updateIsOpen} onOpenChange={setUpdateIsOpen}>
        <DialogTrigger asChild>
          <Button disabled={!table.getFilteredSelectedRowModel().rows.length}>
            Update
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Entry</DialogTitle>
          </DialogHeader>
          <ViewErrors errors={updateErrors} name='updateErrors'/>
          <form ref={updateForm} className='grid gap-4 py-4' onSubmit={(e) => {
            const [ currentRow ] = table.getFilteredSelectedRowModel().rows;
            console.log('EDITING', currentRow.original)
            e.preventDefault();
            setUpdateErrors([]);
            const error = editVault({
              action: 'update',
              keys: [{
                newService: e.currentTarget.service.value,
                userId: e.currentTarget.userId.value,
                password: e.currentTarget.password.value,
                service: currentRow.original.service
              }],
            })
            error ? setUpdateErrors([error]) : setNextEntry();
          }}>
            <EntryForm entry={table.getFilteredSelectedRowModel().rows.length ?
              table.getFilteredSelectedRowModel().rows[0].original : undefined
            }/>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant='secondary'>Close</Button>
              </DialogClose>
              <Button variant='secondary' type='button'
                onClick={() => setForm(table.getFilteredSelectedRowModel().rows[0].original)}
              >Reset</Button>
              <GetRandomString 
                buttonText='Generate'
                secondary
                func={(pwd) => {
                  if (updateForm.current) updateForm.current.password.value = pwd
                }}
              />
              <Button variant='secondary' type='button' 
                onClick={() => {
                  setUpdateErrors([]);
                  setNextEntry();
                }}>Skip</Button>
              <Button type='submit'>Update</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Button disabled={!table.getFilteredSelectedRowModel().rows.length}>Share</Button>

      <Dialog open={addIsOpen} onOpenChange={setAddIsOpen}>
        <DialogTrigger asChild>
          <Button>Add</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Entry</DialogTitle>
          </DialogHeader>
          <ViewErrors errors={addErrors} name='addErrors' />
          <form className='grid gap-4 py-4' ref={addForm} onSubmit={(e) => {
            e.preventDefault();
            setAddErrors([]);
            const error = editVault({
              action: 'add',
              keys: [{
                service: e.currentTarget.service.value,
                userId: e.currentTarget.userId.value,
                password: e.currentTarget.password.value,
              }],
            })
            error ? setAddErrors([error]) : setAddIsOpen(false);
          }}>
            <EntryForm />
            <DialogFooter>
              <DialogClose asChild>
                <Button variant='secondary'>Cancel</Button>
              </DialogClose>
              <GetRandomString 
                buttonText='Generate'
                secondary
                func={(pwd) => {
                  if (addForm.current) addForm.current.password.value = pwd
                }}
              />
              <Button type='submit'>Add</Button>
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
    </div>
  )
}
