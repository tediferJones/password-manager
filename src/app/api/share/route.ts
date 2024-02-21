import { db } from "@/drizzle/db";
import { share } from "@/drizzle/schema";
import { getHash } from "@/lib/security";
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

export async function GET(req: Request) {
  const user = await currentUser();
  if (user?.username) {
    const hash = await getHash(user.username)
    console.log(await crypto.subtle.digest('SHA-256', Buffer.from(user.username)))
    return NextResponse.json({ hash })
    // return NextResponse.json(
    //   await db.select({ 
    //     sharedEntry: share.sharedEntry
    //   }).from(share).where(eq(share.recipient, user.username))
    // )
  }
  // await db.insert(share).values({
  //   recipient: 'testUserIdk',
  //   sharedEntry: 'thisIsAlsoATest'
  // })
  // return NextResponse.json(x)
  return NextResponse.json('not authorized', { status: 401 })
}

export async function POST(req: Request) {
  const body = await req.json();
  console.log(body)
  return NextResponse.json('share post route');
}
