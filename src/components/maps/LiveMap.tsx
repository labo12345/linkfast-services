import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Navigation, 
  Car, 
  Phone,
  RefreshCw,
  StopCircle
} from 'lucide-react';

// Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1IjoibGFiYW4xMiIsImEiOiJjbWdsYXZkenowYjB0MmtzNzhkYmwweng2In0.lAoZ_VxMgppphaPAG9YHSQ';

interface LiveMapProps {
  rideId?: string;
  pickupLocation?: { lat: number; lng: number; address: string };
  dropoffLocation?: { lat: number; lng: number; address: string };
  driverLocation?: { lat: number; lng: number };
  isDriver?: boolean;
  rideStatus?: string;
  estimatedArrival?: string;
  driverInfo?: {
    name: string;
    phone: string;
    vehicle: string;
    plateNumber: string;
  };
}

export default function LiveMap({
  rideId,
  pickupLocation,
  dropoffLocation,
  driverLocation,
  isDriver = false,
  rideStatus = 'requested',
  estimatedArrival,
  driverInfo
}: LiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<mapboxgl.Map | null>(null);
  const pickupMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const dropoffMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const driverMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const routeSourceRef = useRef<boolean>(false);
  
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [tracking, setTracking] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const center: [number, number] = pickupLocation 
      ? [pickupLocation.lng, pickupLocation.lat]
      : [36.8219, -1.2921];

    mapInstanceRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: center,
      zoom: 13
    });

    mapInstanceRef.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const userLocation = { lat: position.coords.latitude, lng: position.coords.longitude };
        setCurrentLocation(userLocation);
        
        if (isDriver && mapInstanceRef.current) {
          mapInstanceRef.current.flyTo({ 
            center: [userLocation.lng, userLocation.lat], 
            zoom: 15 
          });
        }
      });
    }

    return () => {
      pickupMarkerRef.current?.remove();
      dropoffMarkerRef.current?.remove();
      driverMarkerRef.current?.remove();
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
      mapInstanceRef.current?.remove();
    };
  }, []);

  // Setup markers
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (pickupLocation) {
      pickupMarkerRef.current?.remove();
      pickupMarkerRef.current = new mapboxgl.Marker({ color: '#22c55e' })
        .setLngLat([pickupLocation.lng, pickupLocation.lat])
        .setPopup(new mapboxgl.Popup().setHTML(`<h3>Pickup</h3><p>${pickupLocation.address}</p>`))
        .addTo(mapInstanceRef.current);
    }

    if (dropoffLocation) {
      dropoffMarkerRef.current?.remove();
      dropoffMarkerRef.current = new mapboxgl.Marker({ color: '#ef4444' })
        .setLngLat([dropoffLocation.lng, dropoffLocation.lat])
        .setPopup(new mapboxgl.Popup().setHTML(`<h3>Dropoff</h3><p>${dropoffLocation.address}</p>`))
        .addTo(mapInstanceRef.current);
    }

    if (pickupLocation && dropoffLocation) {
      const bounds = new mapboxgl.LngLatBounds()
        .extend([pickupLocation.lng, pickupLocation.lat])
        .extend([dropoffLocation.lng, dropoffLocation.lat]);
      
      if (currentLocation || driverLocation) {
        const driverPos = driverLocation || currentLocation;
        if (driverPos) {
          bounds.extend([driverPos.lng, driverPos.lat]);
        }
      }
      
      mapInstanceRef.current.fitBounds(bounds, { padding: 100 });
    }
  }, [pickupLocation, dropoffLocation]);

  // Update driver location marker
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const location = driverLocation || currentLocation;
    if (!location) return;

    driverMarkerRef.current?.remove();
    
    const el = document.createElement('div');
    el.className = 'driver-marker';
    el.innerHTML = `<div style="background: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 10px rgba(0,0,0,0.3);"></div>`;
    
    driverMarkerRef.current = new mapboxgl.Marker({ element: el })
      .setLngLat([location.lng, location.lat])
      .setPopup(new mapboxgl.Popup().setHTML(`<h3>${isDriver ? 'You' : 'Driver'}</h3>`))
      .addTo(mapInstanceRef.current);
  }, [currentLocation, driverLocation, isDriver]);

  // Draw route
  useEffect(() => {
    if (!mapInstanceRef.current || !pickupLocation || !dropoffLocation) return;

    const map = mapInstanceRef.current;

    const drawRoute = async () => {
      if (routeSourceRef.current) return;
      
      try {
        const response = await fetch(
          `https://api.mapbox.com/directions/v5/mapbox/driving/${pickupLocation.lng},${pickupLocation.lat};${dropoffLocation.lng},${dropoffLocation.lat}?geometries=geojson&access_token=${mapboxgl.accessToken}`
        );
        const data = await response.json();

        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0].geometry;

          if (map.getSource('route')) {
            map.removeLayer('route');
            map.removeSource('route');
          }

          map.addSource('route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: route
            }
          });

          map.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': '#3b82f6',
              'line-width': 5,
              'line-opacity': 0.75
            }
          });

          routeSourceRef.current = true;
        }
      } catch (error) {
        console.error('Error fetching route:', error);
      }
    };

    map.on('load', drawRoute);
    if (map.isStyleLoaded()) {
      drawRoute();
    }
  }, [pickupLocation, dropoffLocation]);

  const startTracking = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setTracking(true);
    
    const id = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setCurrentLocation(newLocation);
        
        if (mapInstanceRef.current && isDriver) {
          mapInstanceRef.current.flyTo({
            center: [newLocation.lng, newLocation.lat],
            zoom: 16,
            essential: true
          });
        }
      },
      (error) => {
        console.error('Error tracking location:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
    
    setWatchId(id);
  };

  const stopTracking = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setTracking(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'requested': return 'bg-yellow-500';
      case 'accepted': return 'bg-blue-500';
      case 'ongoing': return 'bg-green-500';
      case 'completed': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Live Tracking
          </div>
          <Badge className={getStatusColor(rideStatus)}>
            {rideStatus.charAt(0).toUpperCase() + rideStatus.slice(1)}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Real Mapbox Map */}
        <div 
          ref={mapContainerRef}
          className="w-full h-64 rounded-lg"
        />

        {/* Location Details */}
        <div className="space-y-3">
          {pickupLocation && (
            <div className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
              <MapPin className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-semibold text-green-800">Pickup Location</p>
                <p className="text-sm text-green-700">{pickupLocation.address}</p>
              </div>
            </div>
          )}
          
          {dropoffLocation && (
            <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg">
              <Navigation className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-semibold text-red-800">Dropoff Location</p>
                <p className="text-sm text-red-700">{dropoffLocation.address}</p>
              </div>
            </div>
          )}
        </div>

        {/* Driver Info (for customers) */}
        {!isDriver && driverInfo && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-blue-800">Your Driver</h4>
              <Button size="sm" variant="outline" className="h-8" onClick={() => window.open(`tel:${driverInfo.phone}`)}>
                <Phone className="h-4 w-4 mr-1" />
                Call
              </Button>
            </div>
            <div className="space-y-1 text-sm">
              <p className="font-medium">{driverInfo.name}</p>
              <p className="text-blue-700">{driverInfo.vehicle} • {driverInfo.plateNumber}</p>
              <p className="text-blue-600">{driverInfo.phone}</p>
            </div>
          </div>
        )}

        {/* Estimated Arrival */}
        {estimatedArrival && (
          <div className="text-center p-3 bg-accent/50 rounded-lg">
            <p className="text-sm font-medium">Estimated Arrival</p>
            <p className="text-lg font-bold text-primary">{estimatedArrival}</p>
          </div>
        )}

        {/* Tracking Controls */}
        <div className="flex gap-2">
          {!tracking ? (
            <Button 
              onClick={startTracking}
              className="flex-1"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Start Live Tracking
            </Button>
          ) : (
            <Button 
              onClick={stopTracking}
              variant="destructive"
              className="flex-1"
            >
              <StopCircle className="h-4 w-4 mr-2" />
              Stop Tracking
            </Button>
          )}
        </div>

        {/* Status Messages */}
        {rideStatus === 'requested' && (
          <p className="text-sm text-muted-foreground text-center">
            Looking for nearby drivers...
          </p>
        )}
        
        {rideStatus === 'accepted' && !isDriver && (
          <p className="text-sm text-blue-600 text-center">
            Driver is on the way to pick you up
          </p>
        )}
        
        {rideStatus === 'ongoing' && (
          <p className="text-sm text-green-600 text-center">
            {isDriver ? 'En route to destination' : 'On your way to destination'}
          </p>
        )}
        
        {rideStatus === 'completed' && (
          <p className="text-sm text-green-600 font-medium text-center">
            ✅ Ride completed successfully!
          </p>
        )}
      </CardContent>
    </Card>
  );
}
