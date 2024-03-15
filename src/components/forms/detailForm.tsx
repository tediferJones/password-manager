import { Entry } from '@/types';
import capAndSplit from '@/lib/capAndSplit';
import ShowHidePwd from '@/components/subcomponents/showHidePwd';

export default function DetailForm({ entry, keys }: { entry?: Entry, keys?: string[] }) {
  const prettyPrint: { [key: string]: Function } = {
    // date: (date: Date) => new Date(date).toLocaleDateString(),
    date: (date: Date) => {
      const dateStr = new Date(date).toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
      const timeStr = new Date(date).toLocaleTimeString()
      return `${dateStr} at ${timeStr}`
    },
    password: (pwd: string) => {
      return <ShowHidePwd pwd={pwd} />
    },
    sharedWith: (users: string[]) => {
      if (!users.length) return 'None'
      return users.reduce((str, user, i, arr) => {
        return i + 1 < arr.length ? `${str}, ${user}` : `${str} and ${user}`
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
        return <div className={`my-auto p-2 text-sm text-center break-words ${customClasses[key] ? customClasses[key] : ''}`}
          key={`key-${i}`}
        >
          <span className='font-semibold'>
            {capAndSplit(key.split(''))}:{' '}
          </span>
          {prettyPrint[key] ? prettyPrint[key](entry[key]) : entry[key]?.toString()}
        </div>
      })}
    </div>
}
