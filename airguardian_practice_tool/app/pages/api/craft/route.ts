import { db } from "@/lib/db/db"
import { Aircrafttable } from "@/lib/db/schema"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const database = db
  const craft =  await database.select().from(Aircrafttable)
  return NextResponse.json(craft)
}