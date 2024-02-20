import { db } from "@/drizzle/db";
import { users } from "@/drizzle/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

// Is there any reason why we cant just use recipient's username as the encrypt key?
// DB will only store username hash and the encrypted entry
// Encrypted entry can look like this: {
//   service: string,
//   userId: string,
//   password: string,
//   owner: string,
//   sharedWith: string[],
// }
// This way user will fetch their pending shares by send their hashed username to /api/share
// This api route will return all shares for that hashed username
// Then all shares can automatically be decrypted using a fullKey generated from the current user's username
// Then we need to make some kind of pop-up that allows user to confirm, delete, or skip each new entry
//  - confirmed entrys will be added to vault and a request will be sent to delete the entry from the share table
//  - deleted entries will just send a request to delete the entry from the share table
//  - skipped entries should not be added to the vault but should not be deleted from the share table either
// Yeah but heres the problem, how do we delete an entry?
// Send row id to user, if they want to delete send id back to server
//  - the server will then create it own hash of the username from currentUser(), if the id exists and the hash matches it can be deleted

// This should probably just return { exists: true | false }, this way we dont get all these 404 errors in the web console
export async function GET(req: Request, { params }: { params: { username: string } }) {
  if (params.username && await db.select().from(users).where(eq(users.username, params.username)).get()) {
    // const result = await db.select().from(users).where(eq(users.username, params.username)).get()
    // console.log(result)
    return NextResponse.json({ exists: true })
  }
  return NextResponse.json({ exists: false }, { status: 404 })
}
