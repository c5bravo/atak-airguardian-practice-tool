import { Aircraft } from "@/app/page";
import { db } from "@/lib/db/db";
import { Aircrafttable } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { forward } from "mgrs";

export async function GET(request: Request) {
  const database = db;
  const craft = await database.select().from(Aircrafttable);
  const data = craft.map(mapdata);
  return NextResponse.json(data);
}

function mapdata(craft: any) {
  const speed =
    craft.speed < 140 ? "slow" : craft.speed < 280 ? "fast" : "supersonic";
  const altitude =
    craft.altitude < 300 ? "surface" : craft.altitude < 3000 ? "low" : "high";
  const location = forward([craft.longitude, craft.latitude], 1);
  return {
    id: craft.id,
    aircraftId: craft.id,
    position: location,
    speed: speed,
    direction: craft.heading,
    altitude: altitude,
    details: craft.additionalInfo,
  };
}
