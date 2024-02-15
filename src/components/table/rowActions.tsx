import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog'

import { useState } from 'react';
import { Row } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, MoreHorizontal } from 'lucide-react';
import { EditVaultFunction, TableColumns } from '@/types';

export default function RowActions({ row, editVault }: { row: Row<TableColumns>, editVault: EditVaultFunction }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  return (
    <Dialog>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='h-8 w-8 p-0' onClick={() => setIsOpen(!isOpen)}>
            <span className='sr-only'>Open menu</span>
            <MoreHorizontal className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' onEscapeKeyDown={() => setIsOpen(false)}>
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
          editVault({
            action: 'update',
            keys: [{
              newService: e.currentTarget.service.value,
              userId: e.currentTarget.userId.value,
              password: e.currentTarget.password.value,
              service: row.original.service
            }],
          })
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
            <div className='col-span-3 flex'>
            <Input
              id='password'
              placeholder='myPassword123'
              required
              maxLength={64}
              defaultValue={row.original.password}
              type={showPwd ? 'text' : 'password'}
              // onMouseEnter={() => setShowPwd(true)}
              // onMouseLeave={() => setShowPwd(false)}
              // onFocus={() => setShowPwd(true)}
              // onBlur={() => setShowPwd(false)}
            />
              <button type='button' onClick={() => setShowPwd(!showPwd)}>
                {showPwd ? <EyeOff className='h-4 w-4 mx-4' /> : 
                  <Eye className='h-4 w-4 mx-4'/>
                }
              </button>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type='submit'>Confirm</Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
