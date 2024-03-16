# password-manager

An encrypted password manager that allows you to securely store, generate and share passwords.

### Built with:
- NextJS
- Clerk
- Turso
- Drizzle
- ShadcnUI

## How it works
This app uses 
[PBKDF2](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/deriveKey#pbkdf2_2)
to implement password based encryption. Your vault is always sent and received
in an encrypted state, and your decryption password never leaves your machine.
In addition, every time your vault changes it will be re-encrypted and uploaded
to the database with a new IV. The downside of this strategy is that if a user
forgets their decryption password there is no way to restore their vault.

If a user chooses to share an entry, a copy of this entry will be encrypted with
the recipients username and sent to the share table. The next time the recipient
logs in they can choose to accept or reject the pending share, if accepted the share
will be added to their vault and deleted from the share table. From here if the
owner updates the entry, new copies of the entry will be sent to each user in the
share list. Entries can only be updated or shared by the owner, although a recipient
could manually copy the entry and share it with who ever they want.

Managing shared entries is easy. If a recipient deletes a shared password from
their vault, then they will be removed from the share list and an automatic update
will be triggered for all other users it has been shared with, including the owner.
If the owner deletes the entire entry, then this entry will be auto deleted from the
vaults of every user it has been shared with. The owner also has the ability to
remove individual users from a shared entry, prompting an auto delete for the user who
was removed, and an auto update for all users it is still shared with.
