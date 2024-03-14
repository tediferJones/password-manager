import { Entry } from '@/types';
import capAndSplit from '@/lib/capAndSplit';
import ShowHidePwd from '@/components/subcomponents/showHidePwd';

export default function DetailForm({ entry, keys }: { entry?: Entry, keys?: string[] }) {
  const prettyPrint: { [key: string]: Function } = {
    date: (date: Date) => new Date(date).toLocaleString(),
    password: (pwd: string) => {
      return <ShowHidePwd pwd={pwd} />
    },
    sharedWith: (users: string[]) => {
      return users.reduce((str, user, i) => {
        return i + 1 < users.length ? `${str}, ${user}` : `${str} and ${user}`
      })
    }
  }

  const customClasses: { [key: string]: string } = {
    date: 'col-span-2',
    sharedWith: 'col-span-2'
  }

  return !entry || !keys ? [] :
    <div className='grid grid-cols-2 gap-4'>
      {keys.map((key, i) => {
        return <div className={`p-2 text-sm text-center truncate ${customClasses[key] ? customClasses[key] : ''}`}
          key={`key-${i}`}
        >
          <span className='font-semibold'>
            {capAndSplit(key.split(''))}:{' '}
          </span>
          {prettyPrint[key] ? prettyPrint[key](entry[key]) : entry[key]?.toString() || 'None'}
        </div>
      })}
    </div>
}
