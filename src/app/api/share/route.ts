import { db } from "@/drizzle/db";
import { share } from "@/drizzle/schema";
import { getHash } from "@/lib/security";
import { Share } from "@/types";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

// if use a hash of the username instead of raw username, can we safely just user sender+recipient as password?
// then we would have to store hashed versions usernames for both sender and recipient
//
// HERES THE DEAL
// on client, run encrypt(JSON.stringify(entry), getFullKey(recipientUsername, salt), iv?) to get encrypted entry
// in db we store hash of recipient username and encrypted entry
// When user load page, send hash of username to db and get matching records
// Then all of these can be decrypted by running getFullKey(recipientUsername, salt), iv

// FROM USER EXISTS ROUTE:
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

export async function GET(req: Request) {
  const user = await currentUser();
  if (!user || !user.username) return NextResponse.json('Unauthorized', { status: 401 })
  const hash = await getHash(user.username)
  return NextResponse.json(
    await db.select({
      salt: share.salt,
      iv: share.iv,
      sharedEntry: share.sharedEntry,
    }).from(share).where(eq(share.recipient, hash)).all()
  )
}

export async function POST(req: Request) {
  const { recipient, salt, iv, sharedEntry }: Share = await req.json();
  if (!recipient || !salt || !iv || !sharedEntry) return NextResponse.json('Incomplete user info', { status: 400 });
  await db.insert(share).values({ recipient, salt, iv, sharedEntry });
  return new NextResponse;
}
