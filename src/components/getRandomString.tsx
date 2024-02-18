import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { Button } from "./ui/button"
import { useRef, useState } from "react";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { charTypes, getRandPwd } from "@/lib/security";

export default function GetRandomString({
  buttonText,
  secondary,
  func
}: {
  buttonText: string,
  secondary?: boolean,
  func: (pwd: string) => void
} ) {
  const [isOpen, setIsOpen] = useState(false);
  const form = useRef<HTMLFormElement>(null);
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant={secondary ? 'secondary' : 'default'}>Generate</Button>
      </PopoverTrigger>
      <PopoverContent className='w-min'>
        <form className='flex flex-col gap-4' ref={form} onSubmit={(e) => {
          e.preventDefault();
          func(
            getRandPwd(
              Number(e.currentTarget.pwdLength.value),
              Object.keys(charTypes).filter(charType => {
                return e.currentTarget[charType].ariaChecked === 'true'
              })
            )
          )
          setIsOpen(false)
        }}>
          <Label htmlFor='pwdLength'>Length</Label>
          <Input type='number' min={8} max={64} defaultValue={16} id='pwdLength' />
          {Object.keys(charTypes)
            .map((charType) => {
              return (
                <div className='flex gap-4' key={`getRandom-${charType}`}>
                  <Checkbox id={charType} defaultChecked />
                  <Label className='capitalize flex items-center justify-center'>{charType}</Label>
                </div>
              )
            })}
          <Button type='button' onClick={() => {
            if (form.current) {
              func(
                getRandPwd(
                  Number(form.current.pwdLength.value),
                  Object.keys(charTypes).filter(charType => {
                    return form.current && form.current[charType].ariaChecked === 'true'
                  })
                )
              )
              setIsOpen(false)
            }
          }}>{buttonText}</Button>
        </form>
      </PopoverContent>
    </Popover>
  )
}
