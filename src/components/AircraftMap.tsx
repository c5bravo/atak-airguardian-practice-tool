"use client";
import { useEffect, useRef, useState } from "react";
import { MapContainer, Marker, Polyline, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import { Icon, LatLng, Map } from "leaflet";
import { Popup, useMapEvents } from "react-leaflet";
import { useAtom, useAtomValue } from "jotai";
import {
  waypointAtom,
  aircraftStartAtom,
  placingPointsAtom,
  aircraftFormAtom,
} from "./AircraftForm";
import { Tooltip } from "react-leaflet";
import { SelectAircraft, Waypoint } from "@/lib/db/schema";
import { dist } from "@/app/api/route";

function WaypointMarkers({
  placingPoints,
  selectedAircraft,
  drawnWaypoints,
  startPos,
}: {
  placingPoints: boolean;
  selectedAircraft?: number | null;
  drawnWaypoints?: Waypoint[];
  startPos: Waypoint | null;
}) {
  const waypoints = [
    ...(startPos ? [startPos] : []),
    ...useAtomValue(waypointAtom),
  ];
  const aircraftForm = useAtomValue(aircraftFormAtom);

  const speed = parseInt(aircraftForm.speed);

  if (placingPoints) {
    return (
      <>
        {waypoints.map((marker, i) => (
          <Marker
            key={i}
            position={new LatLng(marker.latitude, marker.longitude)}
          >
            {i === 0 && (
              <Tooltip permanent direction="top">
                Start Position
              </Tooltip>
            )}
            {i !== 0 && aircraftForm.speed !== "" && (
              <Tooltip permanent direction="top">
                {Math.round(
                  (dist(waypoints[i - 1], marker) / 1000 / speed) * 60,
                )}
              </Tooltip>
            )}
          </Marker>
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

function WaypointLines({
  selectedAircraft,
  drawnWaypoints,
  aircraft,
}: {
  selectedAircraft?: number | null;
  drawnWaypoints?: Waypoint[];
  aircraft: SelectAircraft[];
}) {
  const craft = aircraft.find((a) => a.id === selectedAircraft);
  if (!craft) return null;
  const positionsarr: LatLng[] = [new LatLng(craft!.sposLat, craft!.sposLng)];

  drawnWaypoints?.forEach((p) =>
    positionsarr.push(new LatLng(p.latitude, p.longitude)),
  );

  return <Polyline pathOptions={{ color: "red" }} positions={positionsarr} />;
}

export default function AircraftMap({
  aircraft,
  setM,
}: {
  aircraft: SelectAircraft[];
  setM: (m: Map | null) => void;
}) {
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
  const [, setWaypoints] = useAtom(waypointAtom);
  const [startPos, setStartPos] = useAtom(aircraftStartAtom);
  const [placingPoints] = useAtom(placingPointsAtom);

  function ClickHandler() {
    useMapEvents({
      click(e) {
        if (!placingPoints) return;
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;

        if (!startPos) {
          setStartPos({ latitude: lat, longitude: lng });
          return;
        }

        setWaypoints((prev) => [...prev, { latitude: lat, longitude: lng }]);
      },
    });

    return null;
  }

  useEffect(() => {
    setM(map);
  }, [map, setM]);

  return (
    <div
      ref={mapRef}
      className="relative h-[700px] w-full bg-linear-to-br from-blue-100 via-blue-50 to-green-50 overflow-hidden"
    >
      <MapContainer
        center={new LatLng(62, 24)}
        zoom={6}
        scrollWheelZoom={true}
        dragging={true}
        touchZoom={true}
        doubleClickZoom={true}
        style={{ height: "700px", width: "full", zIndex: 5 }}
        ref={setMap}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ClickHandler />

        {startPos && (
          <Marker position={[startPos.latitude, startPos.longitude]}>
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
                  if (selectedAircraft === craft.id) return;
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
                  <div className="text-sm space-y-1 flex-container text-slate-600">
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

        <WaypointMarkers
          drawnWaypoints={drawnWaypoints}
          placingPoints={placingPoints}
          selectedAircraft={selectedAircraft}
          startPos={startPos}
        />
        <WaypointLines
          aircraft={aircraft}
          drawnWaypoints={drawnWaypoints}
          selectedAircraft={selectedAircraft}
        />
      </MapContainer>
    </div>
  );
}
