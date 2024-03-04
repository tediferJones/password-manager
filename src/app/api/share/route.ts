import { db } from '@/drizzle/db';
import { share } from '@/drizzle/schema';
import { getHash } from '@/lib/security';
import { Share } from '@/types';
import { currentUser } from '@clerk/nextjs/server';
import { and, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const user = await currentUser();
  if (!user || !user.username) return NextResponse.json('Unauthorized', { status: 401 })
  const hash = await getHash(user.username)
  return NextResponse.json(
    await db.select({
      salt: share.salt,
      iv: share.iv,
      sharedEntry: share.sharedEntry,
      uuid: share.uuid,
    }).from(share).where(eq(share.recipient, hash)).all()
  )
}

export async function POST(req: Request) {
  const { recipient, salt, iv, sharedEntry, uuid }: Share = await req.json();
  if (!recipient || !salt || !iv || !sharedEntry || !uuid) return NextResponse.json('Incomplete user info', { status: 400 });

  const exists = await db.select().from(share).where(eq(share.uuid, uuid)).get()
  if (exists) {
    await db.update(share).set({ recipient, salt, iv, sharedEntry }).where(eq(share.uuid, uuid));
  } else {
    await db.insert(share).values({ recipient, salt, iv, sharedEntry, uuid });
  }
  return new NextResponse;
}

export async function DELETE(req: Request) {
  const user = await currentUser();
  if (!user || !user.username) return NextResponse.json('Unauthorized', { status: 401 });
  const recipient = await getHash(user?.username);

  // const { salt, iv, sharedEntry, uuid }: Share = await req.json();
  // if (!recipient || !salt || !iv || !sharedEntry || !uuid) return NextResponse.json('Incomplete user info', { status: 400 });

  const { uuid }: Share = await req.json();
  if (!recipient || !uuid) return NextResponse.json('Incomplete user info', { status: 400 });

  await db.delete(share).where(
    and(
      eq(share.recipient, recipient),
      eq(share.uuid, uuid),
    )
  );
  return new NextResponse;
}
