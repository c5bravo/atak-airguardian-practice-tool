"use client";
import { useState } from "react";
import { Aircraft } from "@/app/page";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { PlaneTakeoff, Pin } from "lucide-react";
import { Waypoint } from "@/app/page";
import { atom, useAtom } from "jotai";

export const settingwpAtom = atom(false);
export const waypointAtom = atom<Waypoint[]>([]);

interface AircraftFormProps {
  onSubmit: (aircraft: Aircraft) => void;
}

export function AircraftForm({ onSubmit }: AircraftFormProps) {
  const [formData, setFormData] = useState({
    id: "",
    speed: "",
    altitude: "",
    latitude: "",
    longitude: "",
    heading: "",
    additionalInfo: "",
    waypoints: []
  });

  const [waypoints, setWaypoints] = useAtom<Waypoint[]>(waypointAtom);
  const [settingwp, setSettingwp] = useAtom(settingwpAtom);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSettingwp(false);

    const newAircraft: Aircraft = {
      id: formData.id,
      speed: Number(formData.speed),
      altitude: Number(formData.altitude),
      latitude: Number(formData.latitude),
      longitude: Number(formData.longitude),
      heading: Number(formData.heading),
      additionalInfo: formData.additionalInfo,
      waypoints: waypoints,
      waypointindex: 0,
      sposLat: formData.latitude as unknown as number,
      sposLng: formData.longitude as unknown as number
    };

    onSubmit(newAircraft);

    setFormData({
      id: "",
      speed: "",
      altitude: "",
      latitude: "",
      longitude: "",
      heading: "",
      additionalInfo: "",
      waypoints: []
    });

    setWaypoints([]);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const startaddWaypoint = (e: React.FormEvent) => {
    e.preventDefault();
    setSettingwp(prev => !prev);   // <-- ONLY REQUIRED CHANGE
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="id">Aircraft ID</Label>
        <Input
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
            id="speed"
            name="speed"
            type="number"
            value={formData.speed}
            onChange={handleChange}
            placeholder="450"
            required
            min="0"
          />
        </div>

        <div>
          <Label htmlFor="altitude">Altitude (ft)</Label>
          <Input
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

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="latitude">Latitude</Label>
          <Input
            id="latitude"
            name="latitude"
            type="number"
            step="0.0001"
            value={formData.latitude}
            onChange={handleChange}
            placeholder="60.1699"
            required
            min="59.5"
            max="70.5"
          />
        </div>

        <div>
          <Label htmlFor="longitude">Longitude</Label>
          <Input
            id="longitude"
            name="longitude"
            type="number"
            step="0.0001"
            value={formData.longitude}
            onChange={handleChange}
            placeholder="24.9384"
            required
            min="19.5"
            max="31.5"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="additionalInfo">Additional Information</Label>
        <Textarea
          id="additionalInfo"
          name="additionalInfo"
          value={formData.additionalInfo}
          onChange={handleChange}
          placeholder="Flight details, destination, etc."
          rows={3}
        />
      </div>

      <div>
        <Label className="mb-5" htmlFor="Waypoints">Add Waypoints</Label>

        {waypoints.map((point, i) => {
          return (
            <div
              key={i}
              className="flex items-center justify-between border rounded-lg p-3 mb-3 bg-slate-100"
            >
              <div className="space-y-1 text-slate-700">
                <div className="flex justify-between gap-4">
                  <span className="font-medium">Latitude:</span>
                  <span>{point.latitude.toFixed(5)}</span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="font-medium">Longitude:</span>
                  <span>{point.longitude.toFixed(5)}</span>
                </div>
              </div>

              <button
                onClick={() =>
                  setWaypoints((wps) => wps.filter((_, idx) => idx !== i))
                }
                className="ml-4 px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded"
              >
                Delete
              </button>
            </div>
          );
        })}

        {/* waypoints button active/inactive */}
        <Button
          onClick={startaddWaypoint}
          className={
            `w-50% ` +
            (settingwp
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-slate-200 text-slate-900 hover:bg-slate-300")
          }
        >
          <Pin className="mr-2 h-4 w-4" />
          {settingwp ? "Adding Waypoints..." : "Add Waypoints"}
        </Button>
      </div>

      <Button type="submit" className="w-full">
        <PlaneTakeoff className="mr-2 h-4 w-4" />
        Add Aircraft
      </Button>
    </form>
  );
}
