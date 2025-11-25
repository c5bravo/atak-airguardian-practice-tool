import { NextResponse } from 'next/server'
import { db } from '@/lib/db/db';
import { Aircrafttable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
 
export interface latlong{
    lat: number;
    lng: number;
}

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

  const newcraft = oldcraft.map((craft) => {
    const latlong: latlong = {lat: craft.latitude, lng: craft.longitude}
    let waypointi = craft.waypointindex
    let waypoints = JSON.parse(craft.waypoints)
    let waypoint = waypoints[waypointi]
    let nexpos: latlong = {lat: waypoint.latitude, lng: waypoint.longitude}
    const checkwaypoint = checkfornewwaypoint(latlong, nexpos)
    
    if(checkwaypoint){
        if(waypointi == craft.waypoints.length-1)
        {
            //TODO: stop positions from resetting
            handleDeleteAircraft(craft.id)
            return {...craft}
        }
        waypointi += 1
        waypoints = JSON.parse(craft.waypoints)
        waypoint = waypoints[waypointi]
        nexpos = {lat: waypoint.latitude, lng: waypoint.longitude}
    }
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
        waypointindex: waypointi,
        waypoints: JSON.parse(craft.waypoints)
    }
  })
  newcraft.forEach(async(craft) => {
    await database.update(Aircrafttable).set({
    latitude: craft.latitude,
    longitude: craft.longitude,
    heading: craft.heading,
    waypointindex: craft.waypointindex,
    waypoints: JSON.stringify(craft.waypoints)}).where(eq(Aircrafttable.id, craft.id))
  });

   return NextResponse.json(newcraft)
}

export async function DELETE(request: Request){
    const database = db 
    const reqdata = await request.json()
    await database.delete(Aircrafttable).where(eq(Aircrafttable.id, reqdata))
    return NextResponse.json(reqdata)
}

function handleDeleteAircraft(name: string){

}

  const checkfornewwaypoint = (pos: latlong, wpos: latlong) =>{
    if(dist(pos, wpos) <= 300){
        return true
    }
    return false
  }

const calculateposition = (pos: latlong, speed: number, heading: number) =>{
    const dstchange = speed *  0.00027777777777777778 //one second interval
    const result = newpos(pos, heading, dstchange*1000);
    return result
  }

  function newpos(pos: latlong, heading: number, distance: number){

        heading = (heading + 360) % 360;
        let rad = Math.PI / 180
        let radInv = 180 / Math.PI
        let R = 6378137 // approximation of Earth's radius
        let lon1 = pos.lng * rad
        let lat1 = pos.lat * rad
        let rheading = heading * rad
        let sinLat1 = Math.sin(lat1)
        let cosLat1 = Math.cos(lat1)
        let cosDistR = Math.cos(distance / R)
        let sinDistR = Math.sin(distance / R)
        let lat2 = Math.asin(sinLat1 * cosDistR + cosLat1 * sinDistR * Math.cos(rheading))
        let lon2 = lon1 + Math.atan2(Math.sin(rheading) * sinDistR * cosLat1, cosDistR - sinLat1 * Math.sin(lat2));
        lon2 = lon2 * radInv;
        lon2 = lon2 > 180 ? lon2 - 360 : lon2 < -180 ? lon2 + 360 : lon2;
        return {lat: lat2 * radInv, lng: lon2}
  }

const calculateheading = (curpos: latlong, nextpos: latlong) => {
    const φ1 = curpos.lat * Math.PI/180;
    const φ2 = nextpos.lat * Math.PI/180;
    const Δλ = (nextpos.lng - curpos.lng) * Math.PI/180;

    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) -
              Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

    let res = Math.atan2(y, x);
    res = res * 180 / Math.PI;

    return (res + 360) % 360; // normalize 0-360°
  }

  function dist(pos: latlong, wpos: latlong) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(wpos.lat-pos.lat);  // deg2rad below
    var dLon = deg2rad(wpos.lng-pos.lng); 
    var a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(pos.lat)) * Math.cos(deg2rad(wpos.lat)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2)
        ; 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in km    return d
    return d*1000
  }

function deg2rad(deg: number) {
  return deg * (Math.PI/180)
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