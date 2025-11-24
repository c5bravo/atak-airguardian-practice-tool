import { NextResponse } from 'next/server'
import { Aircraft } from '@/app/page';
import { forward } from "mgrs";
import { db } from '@/lib/db/db';
import { Aircrafttable } from '@/lib/db/schema';
 
type ResponseData = {
    id: number;
    aircraftId: string;
    position: string;
    speed: string;
    direction: number;
    altitude: string;
    details: string;
};

export async function POST(request: Request) {
    const database = db 
    const reqdata = await request.json()
    //const a: ResponseData[] = reqdata.map(mapData);
    database.insert(Aircrafttable).values(reqdata)
    return NextResponse.json(reqdata)
}

export async function GET(request: Request) {
  return NextResponse.json({"message": "xd"})
}

function mapData(oldcraft: Aircraft){
    const speed = oldcraft.speed < 140 ? "slow" : oldcraft.speed < 280 ? "fast" : "supersonic";
    const altitude = oldcraft.altitude < 300 ? "surface" : oldcraft.altitude < 3000 ? "low" : "high";
    const location = forward([oldcraft.longitude, oldcraft.latitude], 1); 

    return {    
        id: oldcraft.id,
        aircraftId: oldcraft.id,
        position: location,
        speed: speed,
        direction: oldcraft.heading,
        altitude: altitude,
        details: oldcraft.additionalInfo
}
}

