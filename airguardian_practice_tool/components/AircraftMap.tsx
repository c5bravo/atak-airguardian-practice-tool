"use client";
import { Aircraft, Waypoint } from "@/app/page";
import { Plane } from "lucide-react";
import { useEffect, useRef, useState, Fragment} from "react";
import { MapContainer, Marker, Polyline, TileLayer, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import { Icon, LatLng, LatLngExpression, Map, map } from "leaflet";
import { Popup, useMapEvents } from "react-leaflet";
import { useAtom } from "jotai";
import { settingwpAtom, waypointAtom } from "./AircraftForm";

interface AircraftMapProps {
  aircraft: Aircraft[];
  selectedAircraft: string | null;
  onSelectAircraft: (id: string | null) => void;
  setM: (m: Map|null) => void
}

export default function AircraftMap({
  aircraft,
  onSelectAircraft,
  setM
}: AircraftMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  const planeIcon = new Icon({
    iconUrl: "../plane.svg",
    iconRetinaUrl: "../plane.svg",

    iconSize: [38, 95], // size of the icon
    shadowSize: [50, 64], // size of the shadow
    //iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
    //shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor: [-3, -20], // point from which the popup should open relative to the iconAnchor
  });

  // Finland bounds
  const bounds = {
    minLat: 59.5,
    maxLat: 70.5,
    minLon: 19.5,
    maxLon: 31.5,
  };

  const latLonToXY = (lat: number, lon: number) => {
    const x = ((lon - bounds.minLon) / (bounds.maxLon - bounds.minLon)) * 100;
    const y = ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * 100;
    return { x, y };
  };

  useEffect(() => {
    if (selectedAircraft && mapRef.current) {
      const selectedCraft = aircraft.find((a) => a.id === selectedAircraft);
      if (selectedCraft) {
        const { x, y } = latLonToXY(
          selectedCraft.latitude,
          selectedCraft.longitude,
        );
        const element = document.getElementById(`aircraft-${selectedAircraft}`);
        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "center",
          });
        }
      }
    }
  }, []);


  const [drawnwaypoints, setDrawnWaypoints] = useState<Waypoint[]>()
  const [selectedAircraft, setSelectedAircraft] = useState<string | null>()
  const [map, setMap] = useState<Map|null>(null);

  function WaypointMarkers() {

    const [settingwp, setSettingwp] = useAtom(settingwpAtom)
    const [waypoints, setWaypoints] = useAtom<Waypoint[]>(waypointAtom)
    const map = useMapEvents({

      click(e) {
        if(!settingwp) return;
        const np: Waypoint = {latitude: e.latlng.lat, longitude: e.latlng.lng}
        setWaypoints((x) => [...x, np])
      }
  
    });

    if(settingwp){
      return (
        <Fragment>
          {waypoints.map((marker, i) => <Marker key={i} position={new LatLng(marker.latitude, marker.longitude)} ></Marker>)}
        </Fragment>
      );
    }
    if(selectedAircraft){
      return(
        <Fragment>
          {drawnwaypoints?.map((marker, i) => <Marker key={i} position={new LatLng(marker.latitude, marker.longitude)} ></Marker>)}
        </Fragment>
      )
    }

  }

  function WaypointLines() {
    let positionsarr: LatLng[] = []
    const craft = aircraft.find((a) => a.id === selectedAircraft)
    if(!craft) return
    positionsarr.push(new LatLng(craft!.latitude, craft!.longitude))

    drawnwaypoints?.forEach(point => {
      positionsarr.push(new LatLng(point.latitude, point.longitude))
    });
      return(
        <Fragment>
          {positionsarr?.map((marker, i) => <Polyline key={i} pathOptions={{color: "red"}} positions={positionsarr} ></Polyline>)}
        </Fragment>
      )
  }

  function selectAircraft(id: string){
    if(selectedAircraft == id) return
    setSelectedAircraft(id)
    const craft = aircraft.find((a) => a.id === id)
    setDrawnWaypoints( craft?.waypoints )
  }

  function closePopup(){
    setSelectedAircraft(null)
    setDrawnWaypoints([])
  }

  useEffect(() => {
    setM(map)
  },[map])

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
        {aircraft.map((craft) => {
          const position = new LatLng(craft.latitude, craft.longitude);

          return (
            
            <Marker key={craft.id} position={position} icon={planeIcon} eventHandlers={{
                click: (e) => {
                  selectAircraft(craft.id)
                },
              }}>
              <Popup eventHandlers={{remove: (e) =>{
                closePopup()
              }}}>
                <div>
                  <div className="mb-1">
                    <strong className="text-slate-900">{craft.id}</strong>
                  </div>
                  <div className="text-sm space-y-1 text-slate-600">
                    <div>Speed: {craft.speed} km/h</div>
                    <div>Altitude: {craft.altitude.toLocaleString()} ft</div>
                    <div>Heading: {craft.heading}°</div>
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
        <WaypointMarkers/>
        <WaypointLines/>

      </MapContainer>

      {/* Aircraft markers 
      {aircraft.map((craft) => {
        const { x, y } = latLonToXY(craft.latitude, craft.longitude);
        const isSelected = selectedAircraft === craft.id;

        return (
          <div
            key={craft.id}
            id={`aircraft-${craft.id}`}
            className="absolute cursor-pointer transition-all duration-300 group"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              transform: 'translate(-50%, -50%)',
              zIndex: isSelected ? 50 : 10,
            }}
            onClick={() => onSelectAircraft(craft.id)}
          >
            {/* Aircraft icon }
            <div
              className={`relative transition-all ${
                isSelected ? 'scale-125' : 'scale-100 group-hover:scale-110'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
                  isSelected
                    ? 'bg-blue-500 ring-4 ring-blue-300'
                    : 'bg-sky-500 ring-2 ring-white'
                }`}
                style={{
                  transform: `rotate(${craft.heading}deg)`,
                }}
              >
                <Plane className="h-5 w-5 text-white" style={{ transform: `rotate(-${craft.heading}deg)` }} />
              </div>

              {/* Aircraft ID label }
              <div
                className={`absolute top-full mt-1 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-1 rounded shadow-md text-xs transition-opacity ${
                  isSelected
                    ? 'bg-blue-500 text-white opacity-100'
                    : 'bg-white text-slate-900 opacity-0 group-hover:opacity-100'
                }`}
              >
                {craft.id}
              </div>

              {/* Info popup on hover }
              <div className="absolute left-full ml-3 top-0 bg-white rounded-lg shadow-xl p-3 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 min-w-[200px]">
                <div className="mb-1">
                  <strong className="text-slate-900">{craft.id}</strong>
                </div>
                <div className="text-sm space-y-1 text-slate-600">
                  <div>Speed: {craft.speed} km/h</div>
                  <div>Altitude: {craft.altitude.toLocaleString()} ft</div>
                  <div>Heading: {craft.heading}°</div>
                  <div>Position: {craft.latitude.toFixed(4)}°, {craft.longitude.toFixed(4)}°</div>
                  {craft.additionalInfo && (
                    <div className="mt-2 pt-2 border-t border-slate-200 text-xs">
                      {craft.additionalInfo}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Movement trail effect }
            {isSelected && (
              <div className="absolute inset-0 -z-10">
                <div className="w-10 h-10 rounded-full bg-blue-400 animate-ping opacity-20"></div>
              </div>
            )}
          </div>
        );
      })}
*/}
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
