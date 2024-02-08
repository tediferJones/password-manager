import { NextResponse } from "next/server";
import { turso, toObject } from "@/modules/turso";
import { currentUser } from "@clerk/nextjs/server";
import { UserInfo } from "@/types";

export async function GET(req: Request) {
  // THIS SHOULD RETURN THE VAULT, SALT AND IV FOR THE AUTHORIZED USER
  const user = await currentUser()
  if (!user) return NextResponse.json('Unauthorized', { status: 401 })

  const userInfo = await turso.execute(`SELECT * FROM users WHERE username = '${user.username}'`)

  return NextResponse.json(toObject(userInfo)[0] || { username: user.username })
}

export async function POST(req: Request) {
  const user = await currentUser() || { username: '' };
  if (!user) return NextResponse.json('Unauthorized', { status: 401 })

  const { salt, iv, vault }: UserInfo = await req.json();
  if (!salt || !iv || !vault) return NextResponse.json('Incomplete user info', { status: 400 })

  const result = await turso.execute(`SELECT * FROM users WHERE username = '${user.username}';`)
  console.log('FROM SERVER', salt, iv, vault, user.username)
  if (result.rows.length) {
    // UPDATE EXISTING RECORD
    // console.log('UPDATE RECORD')
    await turso.execute(
      `UPDATE users SET salt = '${salt}', iv = '${iv}', vault = '${vault}' WHERE username = '${user.username}'`
    )
  } else {
    // CREATE NEW RECORD
    await turso.execute(
      'INSERT INTO users (username, salt, iv, vault) ' +
        `VALUES ('${user.username}', '${salt}', '${iv}', '${vault}')`
    )
  }
  return new NextResponse
}
