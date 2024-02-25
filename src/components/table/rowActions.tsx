import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { useEffect, useRef, useState } from 'react';
import { Row } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UpdateSingle from '@/components/dialogs/updateSingle';
import DeleteSingle from '@/components/dialogs/deleteSingle';
import ShareSingle from '@/components/dialogs/shareSingle';
import { EditVaultFunction, Entry } from '@/types';
import CustomDialog from '../customDialog';

export default function RowActions({ row, editVault }: { row: Row<Entry>, editVault: EditVaultFunction }) {
  const [isOpen, setIsOpen] = useState(false);

  // const [editTrigger, editContent] = UpdateSingle(editVault, row);
  const [deleteTrigger, deleteContent] = DeleteSingle(editVault, row);
  const [shareTrigger, shareContent] = ShareSingle(editVault, row);

  const [editIsOpen, setEditIsOpen] = useState(false);
  const [shareIsOpen, setShareIsOpen] = useState(false);
  // const [editErrors, setEditErrors] = useState<string[]>([]);
  // const editForm = useRef<HTMLFormElement>(null);
  // useEffect(() => setEditErrors([]), [editIsOpen]);

  return (
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
        {/*
        {editTrigger}
        */}
        <DropdownMenuItem onSelect={() => setEditIsOpen(!editIsOpen)}>
          Update 2.0
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {deleteTrigger}
        <DropdownMenuSeparator />
        {shareTrigger}
        <DropdownMenuItem onSelect={() => setShareIsOpen(!shareIsOpen)}>
          Share 2.0
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => {
          console.log(row.original)
        }}>
          Details
        </DropdownMenuItem>
      </DropdownMenuContent>
      {deleteContent}
      {shareContent}
      {/*
      {editContent}
      */}
      <CustomDialog 
        title='Update 2.0'
        formType='entry'
        formData={row.original}
        formReset
        generateRandom
        openState={editIsOpen}
        setOpenState={setEditIsOpen}
        submitText='Update'
        submitFunc={(e, state) => {
          e.preventDefault();
          console.log('submitted', state)
          state.setErrors([]);
          const error = editVault({
            action: 'update',
            toChange: [{
              ...row.original,
              newService: e.currentTarget.service.value,
              userId: e.currentTarget.userId.value,
              password: e.currentTarget.password.value,
            }],
          })
          error ? state.setErrors([error]) : setIsOpen(false);
        }}
      />
      <CustomDialog 
        title='Share 2.0'
        description='Are you sure you want to share this entry?'
        formType='share'
        openState={shareIsOpen}
        setOpenState={setShareIsOpen}
        submitText='Share'
        submitVariant='destructive'
        submitFunc={(e, state) => {
          e.preventDefault();
          console.log('submitted share form', e, state)
        }}
        localFunc={() => {
          console.log('wow?')
        }}
        confirm
      />
    </DropdownMenu>
  )
}
