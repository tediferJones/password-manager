import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import EntryForm from '@/components/entryForm'
import { decrypt, getFullKey } from '@/lib/security'
import { EditVaultFunction, Entry, Share, UserInfo } from '@/types'

export default function PendingShares({ userInfo, editVault }: { userInfo: UserInfo, editVault: EditVaultFunction }) {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingShares, setPendingShares] = useState<Share[]>([]);
  const [nextEntry, setNextEntry] = useState<Entry>();
  const form = useRef<HTMLFormElement>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/share')
      const newShares: Share[] = await res.json()
      setPendingShares(newShares)
      await setForm(newShares[0]);
    })();
  }, [])

  async function setForm(share: Share) {
    setNextEntry(
      JSON.parse(
        await decrypt(
          share.sharedEntry,
          await getFullKey(userInfo.username, share.salt),
          share.iv,
        )
      ) as Entry
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          Pending ({pendingShares.length})
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pending Shares</DialogTitle>
        </DialogHeader>
        <form className='grid gap-4 py-4' ref={form} onSubmit={async (e) => {
          e.preventDefault();
          console.log(pendingShares)
          setPendingShares(pendingShares.slice(1))
          if (pendingShares.length > 1) {
            setForm(pendingShares[1])
          } else {
            setIsOpen(false)
            form.current?.reset();
          }
        }}>
          <EntryForm entry={nextEntry} />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant='secondary'>Close</Button>
            </DialogClose>
            <Button variant='secondary'
              onClick={() => {

              }}
            >Skip</Button>
            <Button type='submit'>Add</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
