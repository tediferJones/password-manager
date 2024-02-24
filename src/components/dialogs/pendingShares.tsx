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
import ViewErrors from '@/components/viewErrors'
import { decrypt, getFullKey } from '@/lib/security'
import { EditVaultFunction, Entry, Share, UserInfo } from '@/types'

export default function PendingShares({ userInfo, editVault }: { userInfo: UserInfo, editVault: EditVaultFunction }) {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingShares, setPendingShares] = useState<Share[]>([]);
  const [entry, setEntry] = useState<Entry>();
  const [shareErrors, setShareErrors] = useState<string[]>([]);
  const [skipOffset, setSkipOffset] = useState(0);
  const form = useRef<HTMLFormElement>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/share')
      const newShares: Share[] = await res.json()
      setPendingShares(newShares)
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (pendingShares.length <= skipOffset) {
        return setIsOpen(false)
      }
      const share = pendingShares[skipOffset]
      setEntry(
        JSON.parse(
          await decrypt(
            share.sharedEntry,
            await getFullKey(userInfo.username, share.salt),
            share.iv,
          )
        )
      )
    })();
  }, [pendingShares, skipOffset]);

  useEffect(() => {
    setSkipOffset(0);
    setShareErrors([]);
  }, [isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button disabled={!pendingShares.length}>
          Pending ({pendingShares.length})
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pending Shares</DialogTitle>
        </DialogHeader>
        <form className='grid gap-4 py-4'
          onSubmit={async (e) => {
            e.preventDefault();
            console.log(entry)
            if (!entry) throw Error('No entry found')
            const errors = editVault({
              action: 'add',
              toChange: [{
                ...entry,
                service: e.currentTarget.service.value,
              }]
            })
            errors ? setShareErrors([errors]) 
              : setPendingShares(pendingShares.toSpliced(skipOffset, 1))
          }}
        >
          <ViewErrors errors={shareErrors} name='shareErrors'/>
          <EntryForm entry={entry} shared key={JSON.stringify(entry)} />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant='secondary'>Close</Button>
            </DialogClose>
            <Button variant='secondary'
              type='button'
              onClick={() => setSkipOffset(skipOffset + 1)}
            >Skip</Button>
            <Button type='submit'>Add</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
