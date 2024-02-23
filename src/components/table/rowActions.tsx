import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { useState } from 'react';
import { Row } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UpdateSingle from '@/components/dialogs/updateSingle';
import DeleteSingle from '@/components/dialogs/deleteSingle';
import ShareSingle from '@/components/dialogs/shareSingle';
import { EditVaultFunction, Entry } from '@/types';

export default function RowActions({ row, editVault }: { row: Row<Entry>, editVault: EditVaultFunction }) {
  const [isOpen, setIsOpen] = useState(false);

  const [editTrigger, editContent] = UpdateSingle(editVault, row);
  const [deleteTrigger, deleteContent] = DeleteSingle(editVault, row);
  const [shareTrigger, shareContent] = ShareSingle(editVault, row);

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
        {editTrigger}
        <DropdownMenuSeparator />
        {deleteTrigger}
        <DropdownMenuSeparator />
        {shareTrigger}
      </DropdownMenuContent>
      {editContent}
      {deleteContent}
      {shareContent}
    </DropdownMenu>
  )
}
