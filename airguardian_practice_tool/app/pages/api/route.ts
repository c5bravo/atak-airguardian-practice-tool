import { NextResponse } from 'next/server'
import { Aircraft } from '@/app/page';
import { forward } from "mgrs";
import { db } from '@/lib/db/db';
import { Aircrafttable } from '@/lib/db/schema';
import { SelectAircraft, InsertAircraft } from '@/lib/db/schema';

 
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
    //const a: InsertAircraft = mapData(reqdata)
    await database.insert(Aircrafttable).values({id: reqdata.id,
        speed: reqdata.speed,
        altitude: reqdata.altitude,
        latitude: reqdata.latitude,
        longitude: reqdata.longitude,
        additionalinfo: reqdata.additionalInfo,
        heading: reqdata.heading,
        waypoints: JSON.stringify(reqdata.waypoints),
        waypointindex: reqdata.waypointindex,
        sposLat: reqdata.sposLat,
        sposLng: reqdata.sposLng
    })
    return NextResponse.json(reqdata)
}

export async function GET(request: Request) {
  const database = db 
  const oldcraft =  await database.select().from(Aircrafttable)

  const newcraft = oldcraft.map(craft => {
    const latlong = new LatLng(craft.latitude, craft.longitude)
    let waypointi = craft.waypointindex
    let waypoint = JSON.parse(craft.waypoints[waypointi])
    let nexpos = new LatLng(waypoint.latitude, waypoint.longitude)
    const checkwaypoint = checkfornewwaypoint(latlong, nexpos)
    
    if(checkwaypoint){
        if(waypointi == craft.waypoints.length-1)
        {
            //TODO: stop positions from resetting
            handleDeleteAircraft(craft.id)
            return {...craft}
        }
        waypointi += 1
        waypoint = JSON.parse(craft.waypoints[waypointi])
        nexpos = new LatLng(waypoint.lat, waypoint.lng)
    
    const h = (360 + calculateheading(latlong, nexpos)) % 360
    const pos = calculateposition(latlong, craft.speed, h)
    craft.latitude = pos.lat
    craft.longitude = pos.lng
    craft.heading = h
    return {
        ...craft,         
        latitude: pos.lat,
        longitude: pos.lng,
        heading: h,
        waypointindex: waypointi
    }
  }})
   return NextResponse.json(newcraft)
}

function handleDeleteAircraft(name: string){

}

  const checkfornewwaypoint = (pos: LatLng, wpos: LatLng) =>{
    if(GeometryUtil.length([pos, wpos]) <= 300){
        return true
    }
    return false
  }

const calculateposition = (pos: LatLng, speed: number, heading: number) =>{
    const dstchange = speed *  0.00027777777777777778 //one second interval
    const result = GeometryUtil.destination(pos, heading, dstchange*1000);
    return result
  }

const calculateheading = (curpos: LatLng, nextpos: LatLng) => {
    /*
    const p1 = map?.latLngToContainerPoint(curpos)
    const p2 = map?.latLngToContainerPoint(nextpos)
    */
   //TODO: why does the plane fly off the track?????
    const p1 = new Point(curpos.lat, curpos.lng)
    const p2 = new Point(nextpos.lat, nextpos.lng)
    return GeometryUtil.computeAngle(p1!, p2!)
  }

/*
function mapData(oldcraft: Aircraft): InsertAircraft{
    return {id: oldcraft.id,
    speed: oldcraft.speed,
    altitude: oldcraft.altitude,
    latitude: oldcraft.latitude,
    longitude: oldcraft.longitude,
    additionalinfo: oldcraft.additionalInfo,
    heading: oldcraft.heading,
    waypoints: oldcraft.waypoints,
    waypointindex: oldcraft.waypointindex,
    sposLat: oldcraft.sposLat,
    sposLng: oldcraft.sposLng}
}
/*
}

    const speed = oldcraft.speed < 140 ? "slow" : oldcraft.speed < 280 ? "fast" : "supersonic";
    const altitude = oldcraft.altitude < 300 ? "surface" : oldcraft.altitude < 3000 ? "low" : "high";
    const location = forward([oldcraft.longitude, oldcraft.latitude], 1); 
*/