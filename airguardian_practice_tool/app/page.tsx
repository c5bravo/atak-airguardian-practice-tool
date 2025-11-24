"use client";
import { useEffect, useState } from "react";
import { AircraftForm } from "@/components/AircraftForm";
import { AircraftList } from "@/components/AircraftList";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import { Map } from "leaflet";
import L from "leaflet";

export interface Aircraft {
  id: string;
  speed: number;
  altitude: number;
  latitude: number;
  longitude: number;
  additionalInfo: string;
  heading: number;
  waypoints: Waypoint[];
  waypointindex: number
  sposLat: number
  sposLng: number
}

export interface Waypoint {
  latitude: number;
  longitude: number;
}

const initialAircraft: Aircraft[] = [
  {
    id: "FIN001",
    speed: 450,
    altitude: 35000,
    latitude: 60.1699,
    longitude: 24.9384,
    additionalInfo: "Commercial flight to Stockholm",
    heading: 0,
    waypoints: [{latitude: 63, longitude: 25}],
    waypointindex: 0,
    sposLat:60.1699,
    sposLng:24.9384
  }
];

export default function App() {
  const [aircraft, setAircraft] = useState<Aircraft[]>(initialAircraft);
  const [selectedAircraft, setSelectedAircraft] = useState<string | null>(null);
  const [map, Setmap] = useState<Map|null>(null)

  const setMap = (m: Map|null) => {
    Setmap(m)
  }

  const handleAddAircraft = (newAircraft: Aircraft) => {
    setAircraft([...aircraft, newAircraft]);
  };
  
  const handleDeleteAircraft = (id: string) => {
    setAircraft(aircraft.filter((a) => a.id !== id));
    if (selectedAircraft === id) {
      setSelectedAircraft(null);
    }
  };

  const Map = useMemo(
    () =>
      dynamic(() => import("@/components/AircraftMap"), {
        loading: () => <p>A map is loading</p>,
        ssr: false,
      }),
    [],
  );

  const [ready, setReady] = useState(false);

  useEffect(() => {
    import("leaflet").then(() => {
      import("leaflet-geometryutil").then(() => {
        setReady(true);
      });
    });
  }, []);

useEffect(() =>{
    const interval = setInterval(() =>{
      setAircraft(prev => {
        const toDelete: string[] = [];

        const updated = prev.map(craft => {
          const latlong = new L.LatLng(craft.latitude, craft.longitude)
          let waypointi = craft.waypointindex
          let nexpos = new L.LatLng(craft.waypoints[waypointi].latitude, craft.waypoints[waypointi].longitude)
          const checkwaypoint = checkfornewwaypoint(latlong, nexpos)

          if (checkwaypoint && checkwaypoint !== -1) {
            if (waypointi === craft.waypoints.length - 1) {
              toDelete.push(craft.id);        // delete once reach the destination
              return craft;                  // return unchanged (the rest of aircrafts continue until destination)
            }
            waypointi += 1
            nexpos = new L.LatLng(craft.waypoints[waypointi].latitude, craft.waypoints[waypointi].longitude)
          }

          const h = (360 + calculateHeading(latlong, nexpos)) % 360
          const pos = calculateposition(latlong, craft.speed, h)

          return {
            ...craft,
            latitude: pos.lat,
            longitude: pos.lng,
            heading: h,
            waypointindex: waypointi
          };
        });

        // Perform deletions AFTER update (safe)
        if (toDelete.length > 0) {
          return updated.filter(a => !toDelete.includes(a.id))
        }

        return updated;
      });
    }, 200)

    return () => clearInterval(interval)
}, [map])
 

  const calculateposition = (pos: L.LatLng, speed: number, heading: number) =>{
    const dstchange = speed *  0.00027777777777777778 //one second interval
    const result = L.GeometryUtil.destination(pos, heading, dstchange*1000);
    return result
  }

  const checkfornewwaypoint = (pos: L.LatLng, wpos: L.LatLng) =>{
    if(map == null) return -1
    if(L.GeometryUtil.length([pos, wpos]) <= 300){
        return true
    }
    return false
  }

// Uses a geodesic bearing calculation for smoother heading transitions between waypoints.
// This replaces the previous calculateHeading method, which produced inaccurate turn behavior.
const calculateHeading = (currentPos: L.LatLng, nextPos: L.LatLng) => {
  // Convert latitude values from degrees to radians
  const lat1 = currentPos.lat * Math.PI / 180;
  const lat2 = nextPos.lat * Math.PI / 180;

  // Difference in longitude (in radians)
  const deltaLon = (nextPos.lng - currentPos.lng) * Math.PI / 180;

  // Compute components of the bearing formula
  const y = Math.sin(deltaLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) -
            Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLon);

  // Calculate initial bearing in radians
  let bearing = Math.atan2(y, x);

  // Convert bearing to degrees
  bearing = bearing * 180 / Math.PI;

  // Normalize to 0–360°
  return (bearing + 360) % 360;
};


  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <img 
            src="ilmavahti.svg"
            className="h-10 w-auto"
          />
          <h1 className="text-slate-1000, bold">TAK ilmavalvonta simulaatio</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <Map
                aircraft={aircraft}
                selectedAircraft={selectedAircraft}
                onSelectAircraft={setSelectedAircraft}
                setM={setMap}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Add Aircraft Form */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-slate-900 mb-4">Add Aircraft</h2>
              <AircraftForm onSubmit={handleAddAircraft} />
            </div>

            {/* Aircraft List */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-slate-900 mb-4">
                Aircraft List ({aircraft.length})
              </h2>
              <AircraftList
                aircraft={aircraft}
                selectedAircraft={selectedAircraft}
                onSelectAircraft={setSelectedAircraft}
                onDeleteAircraft={handleDeleteAircraft}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
