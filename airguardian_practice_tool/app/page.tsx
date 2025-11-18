"use client";
import { useState } from "react";
import { AircraftForm } from "@/components/AircraftForm";
import { AircraftList } from "@/components/AircraftList";
import dynamic from "next/dynamic";
import { useMemo } from "react";

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
    heading: 270,
    waypoints: [],
  },
  {
    id: "FIN002",
    speed: 380,
    altitude: 28000,
    latitude: 61.4978,
    longitude: 23.761, // Tampere
    additionalInfo: "Cargo transport",
    heading: 180,
    waypoints: [],
  },
  {
    id: "FIN003",
    speed: 520,
    altitude: 42000,
    latitude: 65.0121,
    longitude: 25.4651, // Oulu
    additionalInfo: "International flight",
    heading: 90,
    waypoints: [],
  },
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
