// This is nextjs's optimized way of sending images
// import Image from 'next/image';
import { UserButton } from '@clerk/nextjs';
import { turso } from '@/lib/turso';
// import * as crypto from 'crypto';
import Test from '@/components/Test';

// How do we want to create the users encryption key
// We dont want parts of this key to be taken from clerk data or stored in the database
// Thus it must be entirely user provided

export default async function Home() {
  // const test = await turso.execute('CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, data TEXT);')
  console.log(turso)
  const test = await turso.execute('SELECT * FROM users')
  console.log(test)
  // console.log(crypto.getCiphers())
  // const key = crypto.generateKey('aes', { length: 256 }, (err, key) => {
  //   if (err) throw err
  //   return key.export().toString('hex');
  //   // const result = key.export().toString('hex');
  //   // console.log('THIS IS THE KEY:', result)
  //   // return result; 
  // })
  // console.log(key)
  // const encrypted = crypto.createCipheriv
  return (
    <div>
      <UserButton />
      <div>Hello World</div>
      <Test />
    </div>
  );
}
