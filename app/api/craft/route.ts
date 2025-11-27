import { db } from "@/lib/db/db";
import { AircraftTable } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { forward } from "mgrs";

export async function GET() {
  const craft = await db.select().from(AircraftTable);
  const data = craft.map((craft) => {
    const speed =
      craft.speed < 500 ? "slow" : craft.speed < 1000 ? "fast" : "supersonic";
    const altitude =
      craft.altitude < 300 ? "surface" : craft.altitude < 3000 ? "low" : "high";
    const location = forward([craft.longitude, craft.latitude], 1);
    return {
      id: craft.id,
      aircraftId: craft.aircraftId,
      position: location,
      speed: speed,
      direction: Math.round(craft.heading),
      altitude: altitude,
      details: craft.additionalinfo,
    };
  });
  return NextResponse.json(data);
}
