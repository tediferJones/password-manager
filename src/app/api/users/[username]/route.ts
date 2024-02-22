import { db } from "@/drizzle/db";
import { users } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { username: string } }) {
  return NextResponse.json({ 
    userExists: params.username && (
      await db.select()
      .from(users)
      .where(eq(users.username, params.username))
      .get()
    )
  })
}
