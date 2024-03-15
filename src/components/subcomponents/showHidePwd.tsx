import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

export default function ShowHidePwd({ pwd, truncate }: { pwd: string, truncate?: boolean }) {
  const [showPwd, setShowPwd] = useState(false);
  return (
    <span className='flex gap-2'>
      <span className={`w-full ${truncate ? 'truncate' : ''}`}
        onMouseEnter={() => setShowPwd(true)}
        onMouseLeave={() => setShowPwd(false)}
      >
        {showPwd ? pwd : '●●●●●●●●'}
      </span>
      <button onClick={() => setShowPwd(!showPwd)} type='button'>
        {showPwd ? <EyeOff className='h-4 w-4' /> : 
          <Eye className='h-4 w-4' />
        }
      </button>
    </span>
  )
}
