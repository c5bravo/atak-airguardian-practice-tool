"use client";
import { Plane } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { MapContainer, Marker, Polyline, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import { Icon, LatLng, Map } from "leaflet";
import { Popup, useMapEvents } from "react-leaflet";
import { useAtom, useAtomValue } from "jotai";
import {
  settingwpAtom,
  waypointAtom,
  aircraftStartAtom,
  settingStartAtom,
} from "./AircraftForm";
import { Tooltip } from "react-leaflet";
import { SelectAircraft, Waypoint } from "@/lib/db/schema";

interface AircraftMapProps {
  aircraft: SelectAircraft[];
  setM: (m: Map | null) => void;
}

export default function AircraftMap({ aircraft, setM }: AircraftMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  const planeIcon = new Icon({
    iconUrl: "../plane.svg",
    iconRetinaUrl: "../plane.svg",
    iconSize: [38, 95],
    shadowSize: [50, 64],
    popupAnchor: [-3, -20],
  });

  const [drawnWaypoints, setDrawnWaypoints] = useState<Waypoint[]>();
  const [selectedAircraft, setSelectedAircraft] = useState<number | null>();
  const [map, setMap] = useState<Map | null>(null);

  const [settingwp] = useAtom(settingwpAtom);
  const [, setWaypoints] = useAtom<Waypoint[]>(waypointAtom);
  const [startPos, setStartPos] = useAtom(aircraftStartAtom);
  const [settingStart, setSettingStart] = useAtom(settingStartAtom);

  // handle clicking map
  function ClickHandler() {
    useMapEvents({
      click(e) {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;

        if (settingwp) {
          setWaypoints((prev) => [...prev, { latitude: lat, longitude: lng }]);
        } else if (settingStart) {
          setStartPos({ lat, lng }); //choose aircraft start
          setSettingStart(false);
        }
      },
    });

    return null;
  }

  function WaypointMarkers() {
    const settingwp = useAtomValue(settingwpAtom);
    const waypoints = useAtomValue(waypointAtom);

    if (settingwp) {
      return (
        <>
          {waypoints.map((marker, i) => (
            <Marker
              key={i}
              position={new LatLng(marker.latitude, marker.longitude)}
            />
          ))}
        </>
      );
    }

    if (selectedAircraft) {
      return (
        <>
          {drawnWaypoints?.map((marker, i) => (
            <Marker
              key={i}
              position={new LatLng(marker.latitude, marker.longitude)}
            />
          ))}
        </>
      );
    }

    return null;
  }

  function WaypointLines() {
    const positionsarr: LatLng[] = [];
    const craft = aircraft.find((a) => a.id === selectedAircraft);
    if (!craft) return null;

    positionsarr.push(new LatLng(craft!.sposLat, craft!.sposLng));
    drawnWaypoints?.forEach((p) =>
      positionsarr.push(new LatLng(p.latitude, p.longitude)),
    );

    return <Polyline pathOptions={{ color: "red" }} positions={positionsarr} />;
  }

  useEffect(() => {
    setM(map);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  return (
    <div
      ref={mapRef}
      className="relative h-[700px] w-full bg-linear-to-br from-blue-100 via-blue-50 to-green-50 overflow-hidden"
    >
      <MapContainer
        center={new LatLng(62, 24)}
        zoom={6}
        scrollWheelZoom={true}
        style={{ height: "700px", width: "full", zIndex: 5 }}
        ref={setMap}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ClickHandler />

        {startPos && (
          <Marker position={[startPos.lat, startPos.lng]}>
            <Tooltip permanent direction="top">
              Start Position
            </Tooltip>
          </Marker>
        )}

        {aircraft.map((craft) => {
          const position = new LatLng(craft.latitude, craft.longitude);

          return (
            <Marker
              key={craft.id}
              position={position}
              icon={planeIcon}
              eventHandlers={{
                click: () => {
                  if (selectedAircraft == craft.id) return;
                  setSelectedAircraft(craft.id);
                  const newCraft = aircraft.find((a) => a.id === craft.id);
                  setDrawnWaypoints(newCraft?.waypoints);
                },
              }}
            >
              <Popup
                eventHandlers={{
                  remove: () => {
                    setSelectedAircraft(null);
                    setDrawnWaypoints([]);
                  },
                }}
              >
                <div>
                  <div className="mb-1">
                    <strong className="text-slate-900">
                      {craft.aircraftId}
                    </strong>
                  </div>
                  <div className="text-sm space-y-1 text-slate-600">
                    <div>Speed: {craft.speed} km/h</div>
                    <div>Altitude: {craft.altitude.toLocaleString()} m</div>
                    <div>Heading: {craft.heading.toFixed(3)}°</div>
                    <div>
                      Position: {craft.latitude.toFixed(4)}°,{" "}
                      {craft.longitude.toFixed(4)}°
                    </div>
                    {craft.additionalinfo && (
                      <div className="mt-2 pt-2 border-t border-slate-200 text-xs">
                        {craft.additionalinfo}
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        <WaypointMarkers />
        <WaypointLines />
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4">
        <div className="text-sm">
          <div className="mb-2 text-slate-700">Map Legend</div>
          <div className="space-y-2 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center">
                <Plane className="h-4 w-4 text-white" />
              </div>
              <span>Aircraft</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-slate-700 rounded-full"></div>
              <span>City</span>
            </div>
          </div>
        </div>
      </div>

      {/* Coordinates display */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg px-3 py-2 text-xs text-slate-600">
        Finland • {aircraft.length} aircraft tracked
      </div>
    </div>
  );
}
