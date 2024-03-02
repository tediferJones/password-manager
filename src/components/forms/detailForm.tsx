import { Entry } from '@/types';

export default function DetailForm({ entry }: { entry: Entry }) {
  return (
    <div className='grid grid-cols-2 gap-4'>
      {Object.keys(entry).map((key, i) => {
        return <p key={`key-${i}`} className='p-2 text-sm'>{key}: {entry[key]?.toString()}</p>
      })}
    </div>
  )
}
