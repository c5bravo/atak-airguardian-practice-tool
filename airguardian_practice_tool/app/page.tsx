"use client";
import { useEffect, useState } from "react";
import { AircraftForm } from "@/components/AircraftForm";
import { AircraftList } from "@/components/AircraftList";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import { Map } from "leaflet";
//import { LatLng} from "leaflet";

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
    waypointindex: 0
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
    // dynamically import the plugin after window exists
    import("leaflet").then(() => {
      import("leaflet-geometryutil").then(() => {
        setReady(true);
    });
    });

  }, []);


  useEffect(() =>{
    //if(!ready) return
    setInterval(() =>{
      setAircraft(prev => prev.map(craft => {
        const latlong = new L.LatLng(craft.latitude, craft.longitude)
        const h = (360 + calculateheading(latlong, new L.LatLng(craft.waypoints[craft.waypointindex].latitude, craft.waypoints[craft.waypointindex].longitude))) % 360
        const pos = calculateposition(latlong, craft.speed, h)
        craft.latitude = pos.lat
        craft.longitude = pos.lng
        craft.heading = h.toPrecision(3) as unknown as number
          return {
            ...craft,         
            latitude: pos.lat,
            longitude: pos.lng,
            heading: Number(h.toPrecision(3)),
    };
      }));
    }, 1000)
  }, [map]) 
/*
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
*/
  const calculateposition = (pos: L.LatLng, speed: number, heading: number) =>{
    const dstchange = speed *  0.00027777777777777778 //one second interval
    const result = L.GeometryUtil.destination(pos, heading, dstchange*1000);
    return result
  }


  const calculateheading = (curpos: L.LatLng, nextpos: L.LatLng) => {
    if(map == null) return 0
    /*
    const p1 = map?.latLngToContainerPoint(curpos)
    const p2 = map?.latLngToContainerPoint(nextpos)
    */
    const p1 = new L.Point(curpos.lat, curpos.lng)
    const p2 = new L.Point(nextpos.lat, nextpos.lng)
    return L.GeometryUtil.computeAngle(p1!, p2!)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-slate-900">TAK ilmavalvonta harjoitustyökalu</h1>
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
