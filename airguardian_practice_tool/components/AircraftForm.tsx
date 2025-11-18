'use client'
import { useState } from 'react';
import { Aircraft } from '@/app/page';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { PlaneTakeoff } from 'lucide-react';

interface AircraftFormProps {
  onSubmit: (aircraft: Aircraft) => void;
}

export function AircraftForm({ onSubmit }: AircraftFormProps) {
  const [formData, setFormData] = useState({
    id: '',
    speed: '',
    altitude: '',
    latitude: '',
    longitude: '',
    heading: '',
    additionalInfo: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newAircraft: Aircraft = {
      id: formData.id,
      speed: Number(formData.speed),
      altitude: Number(formData.altitude),
      latitude: Number(formData.latitude),
      longitude: Number(formData.longitude),
      heading: Number(formData.heading),
      additionalInfo: formData.additionalInfo,
    };

    onSubmit(newAircraft);

    // Reset form
    setFormData({
      id: '',
      speed: '',
      altitude: '',
      latitude: '',
      longitude: '',
      heading: '',
      additionalInfo: '',
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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
        <Label htmlFor="heading">Heading (0-360°)</Label>
        <Input
          id="heading"
          name="heading"
          type="number"
          value={formData.heading}
          onChange={handleChange}
          placeholder="270"
          required
          min="0"
          max="360"
        />
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

      <Button type="submit" className="w-full">
        <PlaneTakeoff className="mr-2 h-4 w-4" />
        Add Aircraft
      </Button>
    </form>
  );
}
