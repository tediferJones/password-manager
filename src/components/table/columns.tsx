"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "../ui/button"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
// export type Payment = {
//   id: string
//   amount: number
//   status: "pending" | "processing" | "success" | "failed"
//   email: string
// }

interface VaultData {
  service: string,
  userId: string,
  password: string,
}

export const columns: ColumnDef<VaultData>[] = [
  {
    accessorKey: "service",
    // size: 50,
    header: "Service",
    // enableResizing: true,
    // maxSize: 250,
    // enableResizing: true,

    // header: () => <div className='sm:block hidden'>ServiceName</div>,
    // cell: ({ row }) => <div className='sm:block hidden'>{row.getValue('service')}</div>,
    // header: () => <div className=''>ServiceName</div>,
    // cell: ({ row }) => <div className='overflow-clip overflow-ellipsis max-w-12 sm:max-w-max'>{row.getValue('service')}</div>,
    // cell: ({ row }) => <div className=''>{row.getValue('service')}</div>,
  },
  {
    accessorKey: "userId",
    header: "User ID",
  },
  {
    accessorKey: "password",
    header: "Password",
    cell: ({ row }) => {
      return (
        <div className='flex justify-between items-center'>
          <div className='text-transparent bg-gray-400 h-min max-w-min hover:bg-transparent hover:text-current px-2 mr-4 rounded overflow-ellipsis overflow-hidden'>
            {row.getValue('password')}
          </div>
          <Button onClick={() => {
            navigator.clipboard.writeText(row.getValue('password'))
          }}>Copy</Button>
        </div>
      )
    }
    
  },
]

