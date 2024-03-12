import { db } from "@/drizzle/db";
import { users } from "@/drizzle/schema";
import { getHash } from "@/lib/security";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { username: string } }) {
  const user = await currentUser();
  if (!user) return NextResponse.json('Unauthorized', { status: 401 });

  const hashedUser = await getHash(params.username);
  return NextResponse.json({ 
    userExists: params.username && (
      await db.select()
      .from(users)
      .where(eq(users.username, hashedUser))
      .get()
    )
  })
}
