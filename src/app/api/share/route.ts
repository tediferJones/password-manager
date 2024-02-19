import { db } from "@/db";
import { share } from "@/drizzle/schema";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const x = db.select().from(share).all()
  console.log(x)
  // return NextResponse.json(x)
  return NextResponse.json('shared route')
}
