import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { UserInfo } from "@/types";
import { db } from "@/drizzle/db";
import { users } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
  const user = await currentUser()
  if (!user || !user.username) return NextResponse.json('Unauthorized', { status: 401 })

  // await db.delete(users)

  const userInfo = await db.select({
    salt: users.salt,
    iv: users.iv,
    vault: users.vault,
  }).from(users).where(eq(users.username, user.username)).get()

  return NextResponse.json({
    username: user.username,
    ...userInfo,
  })
}

export async function POST(req: Request) {
  const user = await currentUser() || { username: '' };
  if (!user || !user.username) return NextResponse.json('Unauthorized', { status: 401 })

  const { salt, iv, vault }: UserInfo = await req.json();
  if (!salt || !iv || !vault) return NextResponse.json('Incomplete user info', { status: 400 })

  const recordExists = await db.select({ username: users.username}).from(users).where(eq(users.username, user.username)).get()
  if (recordExists) {
    await db.update(users).set({ salt, iv, vault }).where(eq(users.username, user.username));
  } else {
    await db.insert(users).values({ username: user.username, salt, iv, vault });
  }

  return new NextResponse
}
