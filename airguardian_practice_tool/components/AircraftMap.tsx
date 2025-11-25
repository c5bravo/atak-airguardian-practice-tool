"use client";
import { Aircraft, Waypoint } from "@/app/page";
import { Plane } from "lucide-react";
import { useEffect, useRef, useState, Fragment } from "react";
import {
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  Tooltip,
  Popup,
  useMapEvents
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import { Icon, LatLng, Map } from "leaflet";
import { useAtom } from "jotai";

import { settingwpAtom, waypointAtom, aircraftStartAtom, settingStartAtom } from "./AircraftForm"; 

interface AircraftMapProps {
  aircraft: Aircraft[];
  selectedAircraft: string | null;
  onSelectAircraft: (id: string | null) => void;
  setM: (m: Map|null) => void
}

export default function AircraftMap({ aircraft, onSelectAircraft, setM }: AircraftMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  const planeIcon = new Icon({
    iconUrl: "../plane.svg",
    iconRetinaUrl: "../plane.svg",
    iconSize: [38, 95],
    shadowSize: [50, 64],
    popupAnchor: [-3, -20],
  });

  const [drawnwaypoints, setDrawnWaypoints] = useState<Waypoint[]>();
  const [selectedAircraft, setSelectedAircraft] = useState<string | null>();
  const [map, setMap] = useState<Map | null>(null);

  // atoms
  const [settingwp] = useAtom(settingwpAtom);
  const [, setWaypoints] = useAtom<Waypoint[]>(waypointAtom);
  const [startPos, setStartPos] = useAtom(aircraftStartAtom);  
  const [settingStart] = useAtom(settingStartAtom);

  // handle clicking map
  function ClickHandler() {
    useMapEvents({
      click(e) {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;

        if (settingwp) {
          setWaypoints((prev) => [...prev, { latitude: lat, longitude: lng }]);
        } else if (settingStart) {
          setStartPos({ lat, lng }); // only set start when settingStart mode is active
        }
      }
    });
    return null;
  }

  function WaypointMarkers() {
    const [settingwp] = useAtom(settingwpAtom);
    const [waypoints] = useAtom<Waypoint[]>(waypointAtom);

    if (settingwp) {
      return (
        <>
          {waypoints.map((marker, i) => (
            <Marker key={i} position={new LatLng(marker.latitude, marker.longitude)} />
          ))}
        </>
      );
    }

    if (selectedAircraft) {
      return (
        <>
          {drawnwaypoints?.map((marker, i) => (
            <Marker key={i} position={new LatLng(marker.latitude, marker.longitude)} />
          ))}
        </>
      );
    }

    return null;
  }

  function WaypointLines() {
    let positionsarr: LatLng[] = [];
    const craft = aircraft.find((a) => a.id === selectedAircraft);
    if (!craft) return null;

    positionsarr.push(new LatLng(craft.sposLat, craft.sposLng));

    drawnwaypoints?.forEach(point => {
      positionsarr.push(new LatLng(point.latitude, point.longitude));
    });

    return <Polyline pathOptions={{color: "red"}} positions={positionsarr} />;
  }

  function selectAircraft(id: string) {
    if (selectedAircraft === id) return;
    setSelectedAircraft(id);
    const craft = aircraft.find((a) => a.id === id);
    setDrawnWaypoints(craft?.waypoints);
  }

  function closePopup() {
    setSelectedAircraft(null);
    setDrawnWaypoints([]);
  }

  useEffect(() => {
    setM(map);
  }, [map]);

  return (
    <div
      ref={mapRef}
      className="relative h-[700px] w-full bg-gradient-to-br from-blue-100 via-blue-50 to-green-50 overflow-hidden"
    >
      <MapContainer
        center={new LatLng(62, 24)}
        zoom={6}
        scrollWheelZoom={true}
        style={{ height: "700px", width: "full", zIndex: 5 }}
        ref={setMap}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ClickHandler />

        {/* selected start position */}
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
                click: () => selectAircraft(craft.id),
              }}
            >
              <Popup
                eventHandlers={{ remove: () => closePopup() }}
              >
                <div>
                  <div className="mb-1">
                    <strong className="text-slate-900">{craft.id}</strong>
                  </div>
                  <div className="text-sm space-y-1 text-slate-600">
                    <div>Speed: {craft.speed} km/h</div>
                    <div>Altitude: {craft.altitude.toLocaleString()} ft</div>
                    <div>Heading: {craft.heading.toFixed(3)}°</div>
                    <div>
                      Position: {craft.latitude.toFixed(4)}°,{" "}
                      {craft.longitude.toFixed(4)}°
                    </div>
                    {craft.additionalInfo && (
                      <div className="mt-2 pt-2 border-t border-slate-200 text-xs">
                        {craft.additionalInfo}
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
