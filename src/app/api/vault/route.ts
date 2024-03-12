import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { UserInfo } from '@/types';
import { db } from '@/drizzle/db';
import { users } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { getHash, isBase64 } from '@/lib/security';

export async function GET(req: Request) {
  const user = await currentUser()
  if (!user || !user.username) return NextResponse.json('Unauthorized', { status: 401 })

  const hashedUser = await getHash(user.username)
  const userInfo = await db.select({
    salt: users.salt,
    iv: users.iv,
    vault: users.vault,
  }).from(users).where(eq(users.username, hashedUser)).get()

  return NextResponse.json({
    username: user.username,
    ...userInfo,
  })
}

export async function POST(req: Request) {
  const user = await currentUser() || { username: '' };
  if (!user || !user.username) return NextResponse.json('Unauthorized', { status: 401 })

  const { salt, iv, vault }: UserInfo = await req.json();
  if (!salt || !iv || !vault || !isBase64([salt, iv, vault])) return NextResponse.json('Incomplete user info', { status: 400 })

  const hashedUser = await getHash(user.username)
  const recordExists = await db.select().from(users).where(eq(users.username, hashedUser)).get()
  if (recordExists) {
    await db.update(users).set({ salt, iv, vault }).where(eq(users.username, hashedUser));
  } else {
    await db.insert(users).values({ username: hashedUser, salt, iv, vault });
  }

  return new NextResponse
}

export async function DELETE(req: Request) {
  const user = await currentUser();
  if (!user || !user.username) return NextResponse.json('Unauthorized', { status: 401 })

  const hashedUser = await getHash(user.username)
  await db.delete(users).where(eq(users.username, hashedUser))
  return new NextResponse;
}
