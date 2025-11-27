"use client";
import { useEffect, useState } from "react";
import { AircraftForm } from "@/components/AircraftForm";
import { AircraftList } from "@/components/AircraftList";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import { Map } from "leaflet";
import { InsertAircraft, SelectAircraft } from "@/lib/db/schema";
import Image from "next/image";

const postData = async (a: InsertAircraft) => {
  await fetch("/api", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(a),
  });
};

const getData = async () => {
  const res = await fetch("/api", {
    method: "GET",
  });
  return await res.json();
};

const deleteData = async (id: number) => {
  const res = await fetch("/api", {
    method: "DELETE",
    body: JSON.stringify(id),
  });
  return await res.json();
};

export default function App() {
  const [aircraft, setAircraft] = useState<SelectAircraft[]>([]);
  const [selectedAircraft, setSelectedAircraft] = useState<number | null>(null);
  const [, setMap] = useState<Map | null>(null);

  const handleAddAircraft = (newAircraft: InsertAircraft) => {
    setAircraft((prev) => [...prev, { ...newAircraft, id: 0 }]);
    postData(newAircraft);
  };

  const handleDeleteAircraft = (id: number) => {
    setAircraft(aircraft.filter((a) => a.id !== id));
    deleteData(id);
    if (selectedAircraft === id) {
      setSelectedAircraft(null);
    }
  };

  const Map = useMemo(
    () =>
      dynamic(() => import("@/components/AircraftMap"), {
        loading: () => <p>The map is loading</p>,
        ssr: false,
      }),
    [],
  );

  useEffect(() => {
    // dynamically import the plugin after window exists
    import("leaflet").then(() => {
      import("leaflet-geometryutil").then(() => {});
    });
  }, []);

  useEffect(() => {
    //if(!ready) return
    const i = setInterval(() => {
      async function fetching() {
        const craft = await getData();
        setAircraft(craft);
      }
      fetching();
    }, 1000);
    return () => {
      clearInterval(i);
    };
  });

  return (
    <div className="min-h-screen bg-slate-50 bg-[url('/leijona-bg-gray.svg')] bg-cover bg-no-repeat">
      <header className="bg-sky-900 border-b border-zinc-500 shadow-sm">
        <div className="container mx-auto py-4 flex items-center space-x-4">
          <Image src="/ilmavahti.svg" alt="logo" height={30} width={30} />
          <h1 className="text-white font-bold">TAK Air Ops Simulator</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border-2 border-solid border-neutral-950 overflow-hidden">
              <Map aircraft={aircraft} setM={setMap} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Add Aircraft Form */}
            <div className="bg-white rounded-lg border-2 border-solid border-neutral-950 p-6">
              <h2 className="text-slate-900 font-bold mb-4">Add Aircraft</h2>
              <AircraftForm onSubmit={handleAddAircraft} />
            </div>

            {/* Aircraft List */}
            <div className="bg-white rounded-lg border-2 border-solid border-neutral-950 p-6">
              <h2 className="text-slate-900 font-bold mb-4">
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
