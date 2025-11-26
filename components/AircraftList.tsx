"use client";
import { Button } from "./ui/button";
import { Trash2, Plane } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { SelectAircraft } from "@/lib/db/schema";

interface AircraftListProps {
  aircraft: SelectAircraft[];
  selectedAircraft: number | null;
  onSelectAircraft: (id: number) => void;
  onDeleteAircraft: (id: number) => void;
}

export function AircraftList({
  aircraft,
  selectedAircraft,
  onSelectAircraft,
  onDeleteAircraft,
}: AircraftListProps) {
  if (aircraft.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        <Plane className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>No aircraft tracked</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-2">
        {aircraft.map((craft) => (
          <div
            key={craft.id}
            className={`p-3 rounded-lg border cursor-pointer transition-colors ${
              selectedAircraft === craft.id
                ? "bg-blue-50 border-blue-300"
                : "bg-slate-50 border-slate-200 hover:bg-slate-100"
            }`}
            onClick={() => onSelectAircraft(craft.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Plane className="h-4 w-4 text-slate-600" />
                  <span className="text-slate-900">{craft.aircraftId}</span>
                </div>
                <div className="text-sm text-slate-600 space-y-0.5">
                  <div>
                    {craft.speed} km/h • {craft.altitude.toLocaleString()} m
                  </div>
                  <div className="text-xs">
                    {craft.latitude.toFixed(4)}°, {craft.longitude.toFixed(4)}°
                  </div>
                  {craft.additionalinfo && (
                    <div className="text-xs text-slate-500 mt-1 line-clamp-1">
                      {craft.additionalinfo}
                    </div>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="ml-2 h-8 w-8 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteAircraft(craft.id);
                }}
              >
                <Trash2 className="h-4 w-4 text-red-600" />
                <span className="sr-only">Delete</span>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
