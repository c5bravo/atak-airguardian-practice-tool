"use client";
import { Aircraft } from "@/app/page";
import { Plane } from "lucide-react";
import { useEffect, useRef } from "react";
import { MapContainer, Marker, TileLayer, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import { LatLng, LatLngExpression } from "leaflet";
import { Popup } from "react-leaflet";

export default function maptest() {
  const position = new LatLng(65, 26);

  return (
    <div>
      <p>homo</p>
      <MapContainer
        center={position}
        zoom={1}
        scrollWheelZoom={true}
        style={{ height: "400px", width: "600px" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>
            A pretty CSS3 popup. <br /> Easily customizable.
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
