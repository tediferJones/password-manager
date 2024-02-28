import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ShareForm() {
  const [shareWith, setShareWith] = useState('');
  const [recipientExists, setRecipientExists] = useState(false);

  useEffect(() => {
    let delay: any;
    if (shareWith) {
      delay = setTimeout(() => {
        fetch(`/api/users/${shareWith}`)
          .then(res => res.json())
          .then(body => setRecipientExists(body.userExists))
          .catch(err => console.log('this is an error', err))
      }, 100)
    }
    return () => clearTimeout(delay)
  }, [shareWith]);

  return (
    <div className='grid grid-cols-4 items-center gap-4'>
      <Label htmlFor='recipient'
        className='text-center'
      >Recipient</Label>
      <Input
        className={`col-span-3 border-2 ${!shareWith ? '' : recipientExists ? 'border-green-500' : 'border-red-500'}`} 
        id='recipient'
        required
        onChange={(e) => setShareWith(e.currentTarget.value)}
      />
      <input id='usernameIsValid'
        type='hidden'
        aria-checked={recipientExists}
        onChange={() => {}}
      />
    </div>
  )
}
