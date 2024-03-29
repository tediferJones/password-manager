import { db } from '@/drizzle/db';
import { share } from '@/drizzle/schema';
import { getHash, isBase64 } from '@/lib/security';
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
  const user = await currentUser();
  if (!user) return NextResponse.json('Unauthorized', { status: 401 });

  const { recipient, salt, iv, sharedEntry, uuid }: Share = await req.json();
  if (!recipient || !salt || !iv || !sharedEntry || !uuid || !isBase64([salt, iv, sharedEntry, uuid])) {
    return NextResponse.json('Incomplete user info', { status: 400 });
  }

  const exists = await db.select().from(share).where(
    and(
      eq(share.uuid, uuid),
      eq(share.recipient, recipient),
    )
  ).get();

  if (exists) {
    await db.update(share)
    .set({ recipient, salt, iv, sharedEntry })
    .where(
      and(
        eq(share.uuid, uuid),
        eq(share.recipient, recipient),
      )
    );
  } else {
    await db.insert(share).values({ recipient, salt, iv, sharedEntry, uuid });
  }
  return new NextResponse;
}

export async function DELETE(req: Request) {
  const user = await currentUser();
  if (!user || !user.username) return NextResponse.json('Unauthorized', { status: 401 });
  const recipient = await getHash(user.username);

  const { uuid }: Share = await req.json();
  if (!uuid || !isBase64([uuid])) return NextResponse.json('Incomplete user info', { status: 400 });

  await db.delete(share).where(
    and(
      eq(share.recipient, recipient),
      eq(share.uuid, uuid),
    )
  );
  return new NextResponse;
}
