import React, { useRef, useState, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Search, Navigation } from 'lucide-react';

// Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1IjoibGFiYW4xMiIsImEiOiJjbWdsYXZkenowYjB0MmtzNzhkYmwweng2In0.lAoZ_VxMgppphaPAG9YHSQ';

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
  center = [36.8219, -1.2921],
  zoom = 13
}: MapboxMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<mapboxgl.Map | null>(null);
  const pickupMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const dropoffMarkerRef = useRef<mapboxgl.Marker | null>(null);
  
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    mapInstanceRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: center,
      zoom: zoom
    });

    // Add navigation controls
    mapInstanceRef.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const userLocation: [number, number] = [position.coords.longitude, position.coords.latitude];
        setCurrentLocation(userLocation);
        mapInstanceRef.current?.flyTo({ center: userLocation, zoom: 14 });
      });
    }

    return () => {
      pickupMarkerRef.current?.remove();
      dropoffMarkerRef.current?.remove();
      mapInstanceRef.current?.remove();
    };
  }, []);

  // Update pickup marker
  useEffect(() => {
    if (!mapInstanceRef.current || !pickupCoords) return;

    pickupMarkerRef.current?.remove();
    pickupMarkerRef.current = new mapboxgl.Marker({ color: '#22c55e' })
      .setLngLat(pickupCoords)
      .setPopup(new mapboxgl.Popup().setHTML('<h3>Pickup Location</h3>'))
      .addTo(mapInstanceRef.current);

    mapInstanceRef.current.flyTo({ center: pickupCoords, zoom: 14 });
  }, [pickupCoords]);

  // Update dropoff marker
  useEffect(() => {
    if (!mapInstanceRef.current || !dropoffCoords) return;

    dropoffMarkerRef.current?.remove();
    dropoffMarkerRef.current = new mapboxgl.Marker({ color: '#ef4444' })
      .setLngLat(dropoffCoords)
      .setPopup(new mapboxgl.Popup().setHTML('<h3>Dropoff Location</h3>'))
      .addTo(mapInstanceRef.current);

    // If both markers exist, fit bounds
    if (pickupCoords) {
      const bounds = new mapboxgl.LngLatBounds()
        .extend(pickupCoords)
        .extend(dropoffCoords);
      mapInstanceRef.current.fitBounds(bounds, { padding: 100 });
    } else {
      mapInstanceRef.current.flyTo({ center: dropoffCoords, zoom: 14 });
    }
  }, [dropoffCoords, pickupCoords]);

  const geocodeAddress = async (address: string): Promise<[number, number] | null> => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${mapboxgl.accessToken}&limit=1&proximity=${center[0]},${center[1]}`
      );
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        return data.features[0].center;
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  };

  const reverseGeocode = async (coords: [number, number]): Promise<string> => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${coords[0]},${coords[1]}.json?access_token=${mapboxgl.accessToken}`
      );
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        return data.features[0].place_name;
      }
      return `${coords[1].toFixed(6)}, ${coords[0].toFixed(6)}`;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return `${coords[1].toFixed(6)}, ${coords[0].toFixed(6)}`;
    }
  };

  const handlePickupSearch = async () => {
    if (!pickupAddress.trim() || !onPickupSelect) return;
    
    const coords = await geocodeAddress(pickupAddress);
    if (coords) {
      onPickupSelect(coords, pickupAddress);
    }
  };

  const handleDropoffSearch = async () => {
    if (!dropoffAddress.trim() || !onDropoffSelect) return;
    
    const coords = await geocodeAddress(dropoffAddress);
    if (coords) {
      onDropoffSelect(coords, dropoffAddress);
    }
  };

  const useCurrentLocation = async (type: 'pickup' | 'dropoff') => {
    if (!currentLocation) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const coords: [number, number] = [position.coords.longitude, position.coords.latitude];
          const address = await reverseGeocode(coords);
          
          if (type === 'pickup' && onPickupSelect) {
            setPickupAddress(address);
            onPickupSelect(coords, address);
          } else if (type === 'dropoff' && onDropoffSelect) {
            setDropoffAddress(address);
            onDropoffSelect(coords, address);
          }
        });
      }
      return;
    }

    const address = await reverseGeocode(currentLocation);
    
    if (type === 'pickup' && onPickupSelect) {
      setPickupAddress(address);
      onPickupSelect(currentLocation, address);
    } else if (type === 'dropoff' && onDropoffSelect) {
      setDropoffAddress(address);
      onDropoffSelect(currentLocation, address);
    }
  };

  return (
    <div className="relative">
      <Card className="overflow-hidden p-0">
        {/* Real Mapbox Map */}
        <div 
          ref={mapContainerRef}
          className="relative w-full h-96"
        />
        
        {/* Search Controls Overlay */}
        <div className="absolute top-4 left-4 right-4 bg-card/95 backdrop-blur-sm p-4 rounded-lg shadow-lg border z-10">
          <div className="space-y-3">
            {/* Pickup Search */}
            <div>
              <label className="text-sm font-medium mb-1 flex items-center">
                <MapPin className="h-4 w-4 mr-1 text-green-500" />
                Pickup Location
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter pickup address..."
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handlePickupSearch()}
                  className="flex-1"
                />
                <Button size="sm" onClick={handlePickupSearch}>
                  <Search className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => useCurrentLocation('pickup')}>
                  <Navigation className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Dropoff Search */}
            <div>
              <label className="text-sm font-medium mb-1 flex items-center">
                <MapPin className="h-4 w-4 mr-1 text-red-500" />
                Dropoff Location
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter dropoff address..."
                  value={dropoffAddress}
                  onChange={(e) => setDropoffAddress(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleDropoffSearch()}
                  className="flex-1"
                />
                <Button size="sm" onClick={handleDropoffSearch}>
                  <Search className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => useCurrentLocation('dropoff')}>
                  <Navigation className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
