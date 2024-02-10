'use client';

// This is nextjs's optimized way of sending images
// import Image from 'next/image';
import { UserButton } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { encrypt, decrypt, getFullKey } from '@/modules/security';
import { UserInfo, VaultInfo } from '@/types';
import { ToggleTheme } from '@/components/toggleTheme';
import GetPassword from '@/components/getPassword';
import AddEntry from '@/components/addEntry';
import MyTable from '@/components/table/myTable';
import { columns } from '@/components/table/columns';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

// import {
//   Accordion,
//   AccordionContent,
//   AccordionItem,
//   AccordionTrigger,
// } from "@/components/ui/accordion"
// import { Button } from '@/components/ui/button';

// Encryption key can be gotten by using the getFullKey function

// THESE METHODS IMPLEMENT PBKDF2, FOR PASSWORD BASED ENCRYPTION
// More Info: https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/deriveKey#pbkdf2_2
//
// Apparently salt and iv can be stored in the db next to the encrypted data
//   - Salt should always be unique (we cant guarantee every password is unique)
//   - Rotate IV every time we re-encrypt the data
//   - Recommended to iterate hash 2^(Current Year - 2000) times, so we want 2^24 which is 16777216
// More Info: https://security.stackexchange.com/questions/177990/what-is-the-best-practice-to-store-private-key-salt-and-initialization-vector-i
//
// If we want to use phone number for login and/or OTP, you must pay for clerk pro
//
// What to do next:
// Start building ui
// Edit modules/security, all functions should take salt and iv as base64 strings
//  - see if we can use base64 everywhere, especially for the plaintext and password
// Salt and IV are always recycled, fix this, see notes above
//  - IV is now changed everytime vault is updated
//  - Make sure salt is unique in api when new vault is created
// Add an extra conditional to the render chain that checks for a vault, else displays an error message
// [ DONE ] Need to setup some kind of ORM
//  - [ DONE ] we are currently trusting user inputs, this is a very bad idea
// Search bar only searches by userId, create a checkbox dropdown like the columns selector to choose what columns we're searching in
// It would be nice we indicated which columns are being sorted, also the X should only appear if it is being sorted
// Add a settings menu, should have these options:
//  - Change passwordd
//  - Export existing entries
//  - Import new entries
//
// Extras:
//  - delete components/Test.tsx
//  - delete components/ui/dropdown-menu
//  - delete components/ui/accordion and uninstall radix-ui/react-accordion
//  - move contents of src/modules to src/lib, src/lib is required by shadcn-ui
//    - Or go to components.json file and change the alias for utils
//
// Shadcn-ui components we want to use:
//   - Alert Dialog (pop-up with user input)
//   - Data Table (use for main body of the page)
//
// Basic workflow
// 1. User logs in with email/username
// 2. UserInfo is fetched from DB in the form of { salt, iv, vault }
// 3. Prompt user for password, and attempt to decrypt the vault
//      - What happens if user inputs wrong password?
//        - ANSWER: We can detect if decryption fails because it will try to throw an error
//    If there is no existing vault, this should display a dialog to create/confirm a new password

export default function Home() {
  const [userInfo, setUserInfo] = useState<UserInfo>();
  const [fullKey, setFullKey] = useState<CryptoKey>();
  const [vaultData, setVaultData] = useState<VaultInfo>({});

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/vault');
      const userInfo: UserInfo = await res.json();
      console.log(userInfo)

      return setUserInfo({
        username: userInfo.username,
        vault: userInfo.vault || '',
        iv: userInfo.iv || crypto.getRandomValues(Buffer.alloc(12)).toString('base64'),
        salt: userInfo.salt || crypto.getRandomValues(Buffer.alloc(32)).toString('base64'),
      })
    })();
  }, []);

  useEffect(() => {
    (async () => {
      console.log('\n\n\n\nVAULT DATA HAS CHANGED\n\n\n\n');
      if (vaultData && fullKey && userInfo) {
        console.log('UPDATING DATA')
        console.log(userInfo)
        const newIv = crypto.getRandomValues(Buffer.alloc(12)).toString('base64');
        // const encVault = await encrypt(JSON.stringify(vaultData), fullKey, userInfo.iv)
        const encVault = await encrypt(JSON.stringify(vaultData), fullKey, newIv)
        fetch('/api/vault', {
          method: 'POST',
          headers:  {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...userInfo,
            iv: newIv,
            vault: encVault,
          }),
        });
      }
    })();
  }, [vaultData]);

  // const data = JSON.stringify({
  //   'amazon': {
  //     user: 'test@email.com',
  //     pwd: 'password123',
  //   },
  //   'github': {
  //     userId: 'test@email.com',
  //     pwd: 'fakePassword123',
  //   }
  // });
  // const password = 'testPassword';

  // // THIS WILL GENERATE A RANDOM SALT AND IV
  // // const randomSalt = crypto.getRandomValues(Buffer.alloc(32)).toString('base64')
  // // const randomIv = crypto.getRandomValues(Buffer.alloc(12)).toString('base64')
  // // console.log('Random salt and iv', randomSalt, randomIv)
  // // console.log(randomSalt)
  // // console.log(randomIv)
  // // These are just test values created using the above functions
  // const testSalt = '86nkYRRBJXHeUv1gp7R3k/E6/MAz7hTsNQNb/CnIDc8=';
  // const testIv = 'lVui9aPQM+AWtCzo';

  // getFullKey(password, testSalt).then(fullKey => {
  //   encrypt(data, fullKey, testIv).then(encrypted => {
  //     console.log('encrypted data', encrypted)
  //     decrypt(encrypted, fullKey, testIv).then(decrypted => {
  //       console.log('decrypted data', decrypted)
  //     })
  //     // getFullKey('wrongPassword', testSalt).then(fullKey => {
  //     //   decrypt(encrypted, fullKey, testIv).then(decrypted => {
  //     //     console.log('wrong password', decrypted)
  //     //   }).catch(err => console.log('DECRYPTION FAILED'))
  //     // })
  //   })
  // })

  return (
    <div>
      <div className='p-8 flex justify-between items-center flex-col sm:flex-row'>
        <h1 className='text-4xl font-bold'>Password Manager</h1>
        <div className='flex items-center gap-4'>
          {userInfo && userInfo.username ? <h1 className='text-xl'>{userInfo.username}</h1> : []}
          <UserButton />
          <ToggleTheme />
        </div>
      </div>
      {// !userInfo ? <h1>LOADING...</h1> : 
        !userInfo ? 
          <Button disabled className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Please wait
          </Button> :
        !fullKey ? <GetPassword match={!userInfo.vault} setFullKey={setFullKey} userInfo={userInfo} setVault={setVaultData}/> :
          <div className='w-11/12 md:w-4/5 mx-auto pb-12'>
            <AddEntry vaultData={vaultData} setVaultData={setVaultData} />
            <MyTable columns={columns} 
              data={Object.keys(vaultData).map(key => ({ ...vaultData[key], service: key, })).toReversed()} // To reversed so its in order from most recent
            />

            {/*
            <div className='flex justify-center'>
              <Accordion type="multiple" className="w-4/5">
                {Object.keys(vaultData).map((key, i) => {
                  return <AccordionItem key={`accordion-${i}`} value={`entry-${i}`}>
                    <AccordionTrigger>
                      <div className='overflow-hidden'>{key}</div>
                    </AccordionTrigger>
                    <AccordionContent>
                      Yes. It adheres to the WAI-ARIA design pattern.
                    </AccordionContent>
                  </AccordionItem>
                })}
                <AccordionItem value="item-1">
                  <AccordionTrigger>Is it accessible?</AccordionTrigger>
                  <AccordionContent>
                    Yes. It adheres to the WAI-ARIA design pattern.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>Is it styled?</AccordionTrigger>
                  <AccordionContent>
                    Yes. It comes with default styles that matches the other
                    components&apos; aesthetic.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>Is it animated?</AccordionTrigger>
                  <AccordionContent>
                    Yes. It&apos;s animated by default, but you can disable it if you
                    prefer.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

            </div>

            */}

          </div>
      }
    </div>
  );
}
