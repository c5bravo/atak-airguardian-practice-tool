"use client";
import { useEffect, useState } from "react";
import { AircraftForm } from "@/components/AircraftForm";
import { AircraftList } from "@/components/AircraftList";
import dynamic from "next/dynamic";
import { useMemo } from "react";
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
}

export interface Waypoint {
  latitude: number;
  longitude: number;
}

// Mock initial aircraft data over Finland
const initialAircraft: Aircraft[] = [
  {
    id: "FIN001",
    speed: 450,
    altitude: 35000,
    latitude: 60.1699,
    longitude: 24.9384, // Helsinki
    additionalInfo: "Commercial flight to Stockholm",
    heading: 0,
    waypoints: [{latitude: 63, longitude: 25}],
  }
];

export default function App() {
  const [aircraft, setAircraft] = useState<Aircraft[]>(initialAircraft);
  const [selectedAircraft, setSelectedAircraft] = useState<string | null>(null);

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
      setAircraft(aircraft.map(craft => {
        const pos = calculateposition(new L.LatLng(craft.latitude, craft.longitude), craft.speed, craft.heading)
        craft.latitude = pos.lat
        craft.longitude = pos.lng
        return craft
      }));
    }, 1000)
  }, []) 
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
