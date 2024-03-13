import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Loading() {
  return (
    <Button className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none'>
      <Loader2 className='mr-2 h-4 w-4 animate-spin' />Please wait
    </Button>
  )
}
