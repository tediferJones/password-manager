// import { turso } from "@/lib/turso";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  // const test = await turso.execute('CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, data TEXT);')
  // console.log(test)
  // await turso.execute('DROP TABLE users;')
  return NextResponse.json({
    test: 'hello',
  })
}
