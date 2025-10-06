import React, { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation } from 'lucide-react';

interface MapboxMapProps {
  pickupCoords?: [number, number];
  dropoffCoords?: [number, number];
  onPickupSelect?: (coords: [number, number], address: string) => void;
  onDropoffSelect?: (coords: [number, number], address: string) => void;
  center?: [number, number];
  zoom?: number;
}

export default function MapboxMap({
  pickupCoords,
  dropoffCoords,
  onPickupSelect,
  onDropoffSelect,
  center = [37.2808, -0.3031],
  zoom = 13
}: MapboxMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropoffAddress, setDropoffAddress] = useState('');

  // Simple mock map for now - in production this would use real Mapbox
  const handlePickupSearch = () => {
    // Mock geocoding
    const coords: [number, number] = [37.2808 + Math.random() * 0.01, -0.3031 + Math.random() * 0.01];
    onPickupSelect?.(coords, pickupAddress);
  };

  const handleDropoffSearch = () => {
    const coords: [number, number] = [37.2908 + Math.random() * 0.01, -0.3131 + Math.random() * 0.01];
    onDropoffSelect?.(coords, dropoffAddress);
  };

  return (
    <Card className="p-4 space-y-4">
      <div 
        ref={mapContainer}
        className="w-full h-96 bg-muted rounded-lg relative overflow-hidden"
      >
        {/* Mock Map Display */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="h-16 w-16 mx-auto text-primary mb-2" />
            <p className="text-muted-foreground">Map View</p>
            <p className="text-sm text-muted-foreground">
              Kerugoya, Kirinyaga County
            </p>
          </div>
        </div>

        {/* Pickup Marker */}
        {pickupCoords && (
          <div className="absolute top-1/3 left-1/3 transform -translate-x-1/2 -translate-y-1/2">
            <div className="bg-primary text-primary-foreground p-2 rounded-full">
              <MapPin className="h-6 w-6" />
            </div>
          </div>
        )}

        {/* Dropoff Marker */}
        {dropoffCoords && (
          <div className="absolute top-2/3 right-1/3 transform -translate-x-1/2 -translate-y-1/2">
            <div className="bg-gold text-gold-foreground p-2 rounded-full">
              <Navigation className="h-6 w-6" />
            </div>
          </div>
        )}
      </div>

      {/* Location Search */}
      <div className="grid gap-3">
        <div className="flex gap-2">
          <Input
            placeholder="Enter pickup location"
            value={pickupAddress}
            onChange={(e) => setPickupAddress(e.target.value)}
          />
          <Button onClick={handlePickupSearch}>
            <MapPin className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Enter dropoff location"
            value={dropoffAddress}
            onChange={(e) => setDropoffAddress(e.target.value)}
          />
          <Button onClick={handleDropoffSearch}>
            <Navigation className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}