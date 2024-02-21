import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { Settings } from "lucide-react";
import { Button } from "./ui/button";
import { useEffect, useRef, useState } from "react";
import PasswordForm from "./passwordForm";
import { UserInfo, VaultInfo} from "@/types";
import { decrypt, getFullKey } from "@/lib/security";
import ViewErrors from "./viewErrors";
import GetRandomString from "./getRandomString";

export default function UserSettings({
  userInfo,
  setFullKey,
  vaultData,
  setVaultData,
}: {
  userInfo: UserInfo,
  setFullKey: Function,
  vaultData: VaultInfo,
  setVaultData: Function,
}) {
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const [resetIsOpen, setResetIsOpen] = useState(false);
  const [errorMsgs, setErrorMsgs] = useState<string[]>([])
  const [confirmIsOpen, setConfirmIsOpen] = useState(false);
  const form = useRef<HTMLFormElement>(null);
  const vaultImport = useRef<HTMLInputElement>(null);

  useEffect(() => setErrorMsgs([]), [menuIsOpen])

  function confirmMatch() {
    return form.current && form.current.password.value === form.current.confirm.value
  }

  return (
    <DropdownMenu open={menuIsOpen} onOpenChange={setMenuIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" onClick={() => setMenuIsOpen(true)}>
          <span className='sr-only'>Open settings</span>
          <Settings className='h-[1.2rem] w-[1.2rem]' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Settings</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => {
          console.log('vault data', vaultData)
        }} asChild>
          <a href={URL.createObjectURL(new File(JSON.stringify(vaultData, null, 2).split(''), 'tempFileName'))}
            download='exported-vault.json'
          >Export Vault</a>
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            console.log('trigger file upload')
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
                const test: VaultInfo = JSON.parse(await target.files[0].text());
                setVaultData(test)
                // const fixed = Object.keys(test).reduce((fixed, entryKey) => {
                //   fixed[entryKey] = {
                //     ...test[entryKey],
                //   }
                //   return fixed
                // }, {} as VaultInfo)
                // console.log(fixed)
                // setVaultData(fixed)
              }
              target.value = '';
            }}
          />
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setResetIsOpen(true)}
        >Change Password</DropdownMenuItem>
      </DropdownMenuContent>
      <Dialog open={resetIsOpen} onOpenChange={setResetIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Please be careful, your data cannot be recovered if you forget this password
            </DialogDescription>
          </DialogHeader>
          <ViewErrors errors={errorMsgs} name='passwordResetErrors' />
          <form ref={form} className='grid gap-4 py-4' onSubmit={async (e) => {
            // Confirm new password matches confirm
            // Make sure old password can decrypt the current userInfo.vault
            // If both of these are true, create a new key, and set UserInfo.vault to new encryption of current vault

            e.preventDefault();
            setErrorMsgs([]);
            console.log('submitting')
            const formData = {
              oldPassword: e.currentTarget.oldPassword.value,
              password: e.currentTarget.password.value,
              confirm: e.currentTarget.confirm.value,
            }
            if (!confirmMatch()) return setErrorMsgs(['New passwords do not match'])
            if (formData.oldPassword === formData.password) return setErrorMsgs(['New password is the same as old password'])
            const oldKey = await getFullKey(formData.oldPassword, userInfo.salt)

            try {
              await decrypt(userInfo.vault, oldKey, userInfo.iv) 
            } catch {
              setErrorMsgs(['Old password is not correct'])
              return;
            }
            setConfirmIsOpen(true);
          }}>
            <PasswordForm confirmMatch={confirmMatch} match={true} confirmOld={true} />
            <DialogFooter>
              <DialogClose asChild>
                <Button variant='secondary'>Cancel</Button>
              </DialogClose>
              <GetRandomString
                buttonText='Generate'
                secondary
                func={(pwd) => {
                  if (form.current) {
                    form.current.password.value = pwd
                    form.current.confirm.value = pwd
                  }
                }}
              />
              <Button type='submit'>Change Password</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={confirmIsOpen} onOpenChange={setConfirmIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Are you sure you want to change your decryption password?  This change can not be undone
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant='secondary'>Cancel</Button>
            </DialogClose>
            <Button variant='destructive' onClick={async() => {
              if (form.current) {
                setFullKey(await getFullKey(form.current.password.value, userInfo.salt))
                form.current?.reset();
                setConfirmIsOpen(false);
                setResetIsOpen(false);
              }
            }}>Yes I'm sure</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DropdownMenu>
  )
}
