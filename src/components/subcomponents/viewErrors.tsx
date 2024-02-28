export default function ViewErrors({ errors, name }: { errors: string[], name: string }) {
  return (
    <>
      {errors.length === 0 ? [] : 
        <div className='text-red-500 flex justify-center'>
          {errors.map((msg, i) => <div key={`${name}-${i}`}>{msg}</div>)}
        </div>
      }
    </>
  )
}
