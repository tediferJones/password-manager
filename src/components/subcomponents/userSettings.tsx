import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRef, useState } from 'react';
import CustomDialog from '@/components/subcomponents/customDialog';
import { decrypt, getFullKey } from '@/lib/security';
import { Entry, UserInfo } from '@/types';

export default function UserSettings({
  userInfo,
  setFullKey,
  vault,
  setVault,
}: {
  userInfo: UserInfo,
  setFullKey: Function,
  vault: Entry[],
  setVault: Function,
}) {
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const [resetIsOpen, setResetIsOpen] = useState(false);
  const vaultImport = useRef<HTMLInputElement>(null);

  return (
    <DropdownMenu open={menuIsOpen} onOpenChange={setMenuIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' size='icon' onClick={() => setMenuIsOpen(true)}>
          <span className='sr-only'>Open settings</span>
          <Settings className='h-[1.2rem] w-[1.2rem]' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Settings</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => {
          console.log('vault data', vault)
        }} asChild>
          <a href={URL.createObjectURL(new File(JSON.stringify(vault, null, 2).split(''), 'tempFileName'))}
            download='exported-vault.json'
          >Export Vault</a>
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            vaultImport.current?.click();
          }}
        >
          Import Vault
          <input ref={vaultImport}
            className='hidden'
            type='file'
            id='uploadFile'
            accept='application/json'
            onChange={async (e) => {
              const target = e.currentTarget;
              if (target.files?.length) {
                setVault(JSON.parse(await target.files[0].text()) as Entry[])
              }
              target.value = '';
            }}
          />
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setResetIsOpen(true)}
        >Change Password</DropdownMenuItem>
      </DropdownMenuContent>
      <CustomDialog
        submitText='Change Password'
        action='reset'
        extOpenState={[resetIsOpen, setResetIsOpen]}
        submitFunc={async (e, state) => {
          e.preventDefault();
          state.setErrors([]);
          const formData = {
            oldPassword: e.currentTarget.oldPassword.value,
            password: e.currentTarget.password.value,
            confirm: e.currentTarget.confirm.value,
          }
          if (!state.confirmMatch()) return state.setErrors(['New passwords do not match'])
          if (formData.oldPassword === formData.password) return state.setErrors(['New password is the same as old password'])
          const oldKey = await getFullKey(formData.oldPassword, userInfo.salt)

          try {
            await decrypt(userInfo.vault, oldKey, userInfo.iv) 
          } catch {
            state.setErrors(['Old password is not correct'])
            return;
          }
          state.setConfirmIsOpen(true);
        }}
        confirmFunc={async (e, state) => {
          e.preventDefault();
          if (state.formRef.current) {
            setFullKey(await getFullKey(state.formRef.current.password.value, userInfo.salt))
            state.formRef.current?.reset();
            state.setConfirmIsOpen(false)
            state.setIsOpen(false)
          }
        }}
      />
    </DropdownMenu>
  )
}
