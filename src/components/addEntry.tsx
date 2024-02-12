import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { PopoverClose } from '@radix-ui/react-popover';
import { Button } from '@/components/ui/button';
import { EditVaultFunction } from '@/types';

export default function AddEntry({ editVault }: { editVault: EditVaultFunction }) {
  return (
    <Popover>
      <PopoverTrigger asChild><Button>Add</Button></PopoverTrigger>
      <PopoverContent>
        <form className='grid gap-4 py-4' onSubmit={(e) => {
          e.preventDefault();
          console.log('added password from addEntry component')
          editVault({
            action: 'add',
            keys: [{
              service: e.currentTarget.service.value,
              userId: e.currentTarget.userId.value,
              password: e.currentTarget.password.value,
            }]
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
            />
          </div>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='password' className='text-center'>
              Password
            </Label>
            <Input
              id='password'
              placeholder='myPassword123'
              className='col-span-3'
              required
              maxLength={64}
            />
          </div>
          <PopoverClose asChild>
            <Button type='submit'>Add Password</Button>
          </PopoverClose>
        </form>
      </PopoverContent>
    </Popover>
  )
}
