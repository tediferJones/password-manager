# password-manager

What is the stack and how are we gunna do this?

NextJS app
Clerk auth
Turso database
drizzle orm
shadcnui style library
Some client side crypto library
Can we do all of this in bun?
trpc?

User logs in with clerk
Client will fetch encrypted vault and salt for decryption key from server, if the user is authenticated
Client must then enter the secret part of the decryption key
    - The secret key + key salt from database will form the full decryption key
Once decrypted the user can modify the object as they wish
To save changes, encrypt the object with the full decryption key, and send it to the server
    - The server will update the user record with the new encrypted vault

If userA wants to share a password with userB
userA will the other person's username (userB)
userA's password will be encrypted with the key usernameA + usernameB
this encrypted password is then sent to the server, it will be saved in a seperate table called sharedPasswords
    sharedPasswords will have 2 columns, usernameToShareWith and encryptedPassword
When userB reloads the page, it will send a fetch request to check if there are any new shared passwords for this user
If there is, they will be returned to the user
The user must then enter username of the sender (userA) and then the password can be decrypted and added to the currentUsers password list

A shared password needs to track who it has been shared with, that way when the password gets updated, we can instally update it for all clients it have been shared with
If we give each shared password a unique ID, then users wont have to re-enter the sender's username when the password updates
