"use client";
import { useState } from "react";
import { Waypoint } from "@/lib/db/schema";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { PlaneTakeoff, MapPin } from "lucide-react";
import { atom, useAtom } from "jotai";
import { InsertAircraft } from "@/lib/db/schema";

// Merged atoms for one button
export const placingPointsAtom = atom(false);
export const waypointAtom = atom<Waypoint[]>([]);
export const aircraftStartAtom = atom<{ lat: number; lng: number } | null>(
  null,
);

interface AircraftFormProps {
  onSubmit: (aircraft: InsertAircraft) => void;
}

export function AircraftForm({ onSubmit }: AircraftFormProps) {
  const [formData, setFormData] = useState({
    id: "",
    speed: "",
    altitude: "",
    heading: "",
    additionalInfo: "",
    waypoints: [],
  });

  const [waypoints, setWaypoints] = useAtom(waypointAtom);
  const [startPos] = useAtom(aircraftStartAtom);
  const [placingPoints, setPlacingPoints] = useAtom(placingPointsAtom);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!startPos) {
      console.warn("Missing start position.");
      return;
    }

    const newAircraft: InsertAircraft = {
      aircraftId: formData.id,
      speed: Number(formData.speed),
      altitude: Number(formData.altitude),
      latitude: startPos.lat,
      longitude: startPos.lng,
      heading: Number(formData.heading),
      additionalinfo: formData.additionalInfo,
      waypoints: waypoints,
      waypointindex: 0,
      sposLat: startPos.lat,
      sposLng: startPos.lng,
    };
    onSubmit(newAircraft);
    // reset form
    setFormData({
      id: "",
      speed: "",
      altitude: "",
      heading: "",
      additionalInfo: "",
      waypoints: [],
    });

    setWaypoints([]);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="id">Aircraft ID</Label>
        <Input
          className="mt-2"
          id="id"
          name="id"
          value={formData.id}
          onChange={handleChange}
          placeholder="e.g., FIN004"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="speed">Speed (km/h)</Label>
          <Input
            className="mt-2"
            id="speed"
            name="speed"
            type="number"
            value={formData.speed}
            onChange={handleChange}
            placeholder="1500"
            required
            min="0"
          />
        </div>

        <div>
          <Label htmlFor="altitude">Altitude (m)</Label>
          <Input
            className="mt-2"
            id="altitude"
            name="altitude"
            type="number"
            value={formData.altitude}
            onChange={handleChange}
            placeholder="35000"
            required
            min="0"
          />
        </div>
      </div>

      {/* START POSITION */}
      <div className="border p-3 rounded bg-white mt-2">
        <Label>Starting Position (click on map)</Label>
        {startPos ? (
          <p className="text-green-700 font-semibold">
            {startPos.lat.toFixed(5)}, {startPos.lng.toFixed(5)}
          </p>
        ) : (
          <p className="text-red-600 text-sm mt-1">No position selected</p>
        )}

        <Button
          type="button"
          onClick={() => setPlacingPoints((prev) => !prev)}
          className={`mt-2 w-full ${
            placingPoints
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-slate-200 text-slate-900 hover:bg-slate-300"
          }`}
        >
          <MapPin className="mr-2 h-4 w-4" />
          {placingPoints ? "Click on Map to Add WayPoints..." : "Add WayPoints"}
        </Button>
      </div>

      <div>
        <Label htmlFor="additionalInfo">Additional Information</Label>
        <Textarea
          className="mt-2"
          id="additionalInfo"
          name="additionalInfo"
          value={formData.additionalInfo}
          onChange={handleChange}
          placeholder="Flight details, destination, etc."
          rows={3}
        />
      </div>

      <div>
        {waypoints.map((point, i) => (
          <div
            key={i}
            className="border rounded-lg p-3 space-y-2 text-slate-700 mb-5"
          >
            <div className="flex justify-between">
              <span className="font-medium">Latitude</span>
              <span>{point.latitude.toFixed(5)}</span>
            </div>

            <div className="flex justify-between">
              <span className="font-medium">Longitude</span>
              <span>{point.longitude.toFixed(5)}</span>
            </div>

            <button
              onClick={() =>
                setWaypoints((wps) => wps.filter((_, idx) => idx !== i))
              }
              className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      <Button
        data-cy = "Add Aircraft"
        type="submit"
        className="w-full"
        disabled={!(waypoints.length > 0)}
      >
        <PlaneTakeoff className="mr-2 h-4 w-4" />
        Add Aircraft
      </Button>
    </form>
  );
}
