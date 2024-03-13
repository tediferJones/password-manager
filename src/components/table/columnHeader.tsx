import { Entry } from "@/types";
import { Column } from "@tanstack/react-table";
import { ArrowUpDown, ArrowUp, ArrowDown, X } from "lucide-react";
import capAndSplit from "@/lib/capAndSplit";

export default function ColumnHeader({ column }: { column: Column<Entry, unknown> }) {
  const sortDir= column.getIsSorted();
  return (
    <div className='flex justify-between items-center w-full'>
      <p className='truncate'>{capAndSplit(column.id.split(''))}</p>
      <div className='flex items-center gap-2'>
        {!sortDir ? [] : 
          <button onClick={() => column.clearSorting()}>
            <X className='cursor-pointer h-4 w-4'></X>
          </button>
        }
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {sortDir === 'asc' ? <ArrowUp  className="h-4 w-4 cursor-pointer"/>
            : sortDir === 'desc' ? <ArrowDown  className="h-4 w-4 cursor-pointer"/>
              : <ArrowUpDown  className="h-4 w-4 cursor-pointer"/>
          }
        </button>
      </div>
    </div>
  )
}
