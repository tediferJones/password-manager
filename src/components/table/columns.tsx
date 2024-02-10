"use client"

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "../ui/button";
import { ArrowUpDown, MoreHorizontal, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "../ui/checkbox";

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
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        className='ml-4'
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "service",
    // header: "Service",
    header: ({ column }) => {
      return (
        // <Button
        //   variant="ghost"
        //   onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        //   className='flex justify-between w-full'
        // >
        //   Service
        //   <ArrowUpDown className="ml-2 h-4 w-4" />
        // </Button>
        <div className='flex justify-between items-center w-full sm:flex-row flex-col'>
          <p className='truncate'>Service</p>
          <div className='flex items-center gap-2'>
            <ArrowUpDown className="ml-2 h-4 w-4 cursor-pointer" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}/>
            <X className='cursor-pointer' onClick={() => column.clearSorting()}></X>
          </div>
        </div>
      )
    }
    // size: 50,
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
    // header: "User ID",
    header: ({ column }) => {
      return (
        // <Button
        //   variant="ghost"
        //   onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        //   className='flex justify-between w-full'
        // >
        //   User Id
        //   <ArrowUpDown className="ml-2 h-4 w-4" />
        // </Button>

        <div className='flex justify-between items-center w-full sm:flex-row flex-col'>
          <p className='truncate'>User Id</p>
          <div className='flex items-center gap-2'>
            <ArrowUpDown className="ml-2 h-4 w-4 cursor-pointer" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}/>
            <X className='cursor-pointer' onClick={() => column.clearSorting()}></X>
          </div>
        </div>
      )
    }
  },
  {
    accessorKey: "password",
    // header: "Password",
    header: ({ column }) => {
      // console.log(column.getIsSorted(), column.toggleSorting(undefined))
      return (
        // <Button
        //   variant="ghost"
        //   onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        //   className='flex justify-between w-full'
        // >
        //   Password
        //   <ArrowUpDown className="ml-2 h-4 w-4" />
        // </Button>
        <div className='flex justify-between items-center w-full sm:flex-row flex-col'>
          <p className='truncate'>Password</p>
          <div className='flex items-center gap-2'>
            <ArrowUpDown className="ml-2 h-4 w-4 cursor-pointer" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}/>
            <X className='cursor-pointer' onClick={() => column.clearSorting()}></X>
          </div>
        </div>
      )
    },
    // header: ({ column }) => {
    //   // console.log(column.getIsSorted(), column.toggleSorting(undefined))
    //   return (
    //     <div
    //       className='flex justify-between w-full'
    //     >
    //       <p className='text-center'>Password</p>
    //       <Button
    //         variant="ghost"
    //         onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    //       >

    //       <ArrowUpDown className="ml-2 h-4 w-4" />
    //       </Button>
    //     </div>
    //   )
    // },

    // cell: ({ row }) => {
    //   return (
    //     <div className='flex justify-between items-center'>
    //       <div className='text-transparent bg-gray-400 h-min max-w-min hover:bg-transparent hover:text-current px-2 mr-4 rounded overflow-ellipsis overflow-hidden'>
    //         {row.getValue('password')}
    //       </div>
    //       <Button onClick={() => {
    //         navigator.clipboard.writeText(row.getValue('password'))
    //       }}>Copy</Button>
    //     </div>
    //   )
    // }

    // WORKING
    cell: ({ row }) => {
      return (
          <div className='text-transparent bg-gray-400 h-min max-w-min hover:bg-transparent hover:text-current px-2 rounded overflow-ellipsis overflow-hidden'>
            {row.getValue('password')}
          </div>
      )
    }

    // cell: ({ row }) => {
    //   return (
    //     <div className='flex justify-between items-center'>
    //       <div className='text-transparent bg-gray-400 h-min max-w-min hover:bg-transparent hover:text-current px-2 mr-4 rounded overflow-ellipsis overflow-hidden'>
    //         {row.getValue('password')}
    //       </div>
    //       <div>
    //         <DropdownMenu>
    //           <DropdownMenuTrigger asChild>
    //             <Button variant="ghost" className="h-8 w-8 p-0">
    //               <span className="sr-only">Open menu</span>
    //               <MoreHorizontal className="h-4 w-4" />
    //             </Button>
    //           </DropdownMenuTrigger>
    //           <DropdownMenuContent align="end">
    //             <DropdownMenuLabel>Actions</DropdownMenuLabel>
    //             <DropdownMenuItem
    //               onClick={() => navigator.clipboard.writeText(row.getValue('userId'))}
    //             >
    //               Copy User ID 
    //             </DropdownMenuItem>
    //             <DropdownMenuItem
    //               onClick={() => navigator.clipboard.writeText(row.getValue('password'))}
    //             >
    //               Copy Password
    //             </DropdownMenuItem>
    //             <DropdownMenuSeparator />
    //             <DropdownMenuItem>Share</DropdownMenuItem>
    //           </DropdownMenuContent>
    //         </DropdownMenu>
    //       </div>
    //     </div>
    //   )
    // },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      // const payment = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(row.getValue('userId'))}
            >
              Copy User ID 
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(row.getValue('password'))}
            >
              Copy Password
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Share</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText('idkTest')}
            >
              Copy payment ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View customer</DropdownMenuItem>
            <DropdownMenuItem>View payment details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

