import { NextResponse } from "next/server";
import { db } from "@/lib/db/db";
import { AircraftTable, InsertAircraft } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export interface latlong {
  lat: number;
  lng: number;
}

export async function POST(request: Request) {
  const reqData = (await request.json()) as InsertAircraft;
  //const a: InsertAircraft = mapData(reqdata)
  const [inserted] = await db
    .insert(AircraftTable)
    .values({
      aircraftId: reqData.aircraftId,
      speed: reqData.speed,
      altitude: reqData.altitude,
      latitude: reqData.latitude,
      longitude: reqData.longitude,
      additionalinfo: reqData.additionalinfo,
      heading: reqData.heading,
      waypoints: reqData.waypoints,
      waypointindex: reqData.waypointindex,
      sposLat: reqData.sposLat,
      sposLng: reqData.sposLng,
    })
    .returning();
  return NextResponse.json(inserted);
}

export async function GET() {
  const oldCraft = await db.select().from(AircraftTable);

  const newCraft = oldCraft.map((craft) => {
    const latlong: latlong = { lat: craft.latitude, lng: craft.longitude };
    let waypointi = craft.waypointindex;
    let waypoints = craft.waypoints;
    let waypoint = waypoints[waypointi];
    let nexpos: latlong = { lat: waypoint.latitude, lng: waypoint.longitude };
    const checkwaypoint = checkfornewwaypoint(latlong, nexpos);

    if (checkwaypoint) {
      if (waypointi == waypoints.length - 1) {
        //TODO: stop positions from resetting
        handleDeleteAircraft(craft.id);
        return { ...craft };
      }
      waypointi += 1;
      waypoints = craft.waypoints;
      waypoint = waypoints[waypointi];
      nexpos = { lat: waypoint.latitude, lng: waypoint.longitude };
    }
    const h = (360 + calculateheading(latlong, nexpos)) % 360;
    const pos = calculateposition(latlong, craft.speed, h);
    craft.latitude = pos.lat;
    craft.longitude = pos.lng;
    craft.heading = h;

    return {
      ...craft,
      latitude: pos.lat,
      longitude: pos.lng,
      heading: h,
      waypointindex: waypointi,
      waypoints: craft.waypoints,
    };
  });
  newCraft.forEach(async (craft) => {
    await db
      .update(AircraftTable)
      .set({
        latitude: craft.latitude,
        longitude: craft.longitude,
        heading: craft.heading,
        waypointindex: craft.waypointindex,
        waypoints: craft.waypoints,
      })
      .where(eq(AircraftTable.id, craft.id));
  });

  return NextResponse.json(newCraft);
}

export async function DELETE(request: Request) {
  const reqdata = await request.json();
  await db.delete(AircraftTable).where(eq(AircraftTable.id, reqdata));
  return NextResponse.json(reqdata);
}

async function handleDeleteAircraft(id: number) {
  await db.delete(AircraftTable).where(eq(AircraftTable.id, id));
}

const checkfornewwaypoint = (pos: latlong, wpos: latlong) => {
  if (dist(pos, wpos) <= 300) {
    return true;
  }
  return false;
};

const calculateposition = (pos: latlong, speed: number, heading: number) => {
  const dstchange = speed * 0.00027777777777777778; //one second interval
  const result = newpos(pos, heading, dstchange * 1000);
  return result;
};

function newpos(pos: latlong, heading: number, distance: number) {
  heading = (heading + 360) % 360;
  const rad = Math.PI / 180;
  const radInv = 180 / Math.PI;
  const R = 6378137; // approximation of Earth's radius
  const lon1 = pos.lng * rad;
  const lat1 = pos.lat * rad;
  const rheading = heading * rad;
  const sinLat1 = Math.sin(lat1);
  const cosLat1 = Math.cos(lat1);
  const cosDistR = Math.cos(distance / R);
  const sinDistR = Math.sin(distance / R);
  const lat2 = Math.asin(
    sinLat1 * cosDistR + cosLat1 * sinDistR * Math.cos(rheading),
  );
  let lon2 =
    lon1 +
    Math.atan2(
      Math.sin(rheading) * sinDistR * cosLat1,
      cosDistR - sinLat1 * Math.sin(lat2),
    );
  lon2 = lon2 * radInv;
  lon2 = lon2 > 180 ? lon2 - 360 : lon2 < -180 ? lon2 + 360 : lon2;
  return { lat: lat2 * radInv, lng: lon2 };
}

const calculateheading = (curPos: latlong, nextPos: latlong) => {
  const lat1 = (curPos.lat * Math.PI) / 180;
  const lat2 = (nextPos.lat * Math.PI) / 180;
  const deltaLng = ((nextPos.lng - curPos.lng) * Math.PI) / 180;

  const y = Math.sin(deltaLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng);

  let result = Math.atan2(y, x);
  result = (result * 180) / Math.PI;

  return (result + 360) % 360; // normalize 0-360°
};


function dist(pos: latlong, wpos: latlong) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(wpos.lat - pos.lat); // deg2rad below
  const dLon = deg2rad(wpos.lng - pos.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(pos.lat)) *
      Math.cos(deg2rad(wpos.lat)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km    return d
  return d * 1000;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}
