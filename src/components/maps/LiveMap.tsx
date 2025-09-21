import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Navigation, 
  Car, 
  Phone,
  Clock,
  RefreshCw
} from 'lucide-react';

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
  const mapRef = useRef<HTMLDivElement>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [tracking, setTracking] = useState(false);

  // Simulate live location updates
  useEffect(() => {
    if (!tracking) return;

    const interval = setInterval(() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setCurrentLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
          },
          (error) => {
            console.error('Error getting location:', error);
          }
        );
      }
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [tracking]);

  const startTracking = () => {
    setTracking(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
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
        {/* Map Placeholder */}
        <div 
          ref={mapRef}
          className="w-full h-64 bg-muted rounded-lg flex items-center justify-center relative overflow-hidden"
        >
          {/* Mock Map Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-green-100">
            {/* Mock Roads */}
            <div className="absolute top-1/3 left-0 right-0 h-2 bg-gray-300 opacity-60"></div>
            <div className="absolute bottom-1/3 left-0 right-0 h-2 bg-gray-300 opacity-60"></div>
            <div className="absolute top-0 bottom-0 left-1/3 w-2 bg-gray-300 opacity-60"></div>
            <div className="absolute top-0 bottom-0 right-1/3 w-2 bg-gray-300 opacity-60"></div>
          </div>
          
          {/* Location Markers */}
          {pickupLocation && (
            <div className="absolute top-1/4 left-1/4 z-10">
              <div className="bg-green-500 text-white p-2 rounded-full shadow-lg">
                <MapPin className="h-4 w-4" />
              </div>
              <div className="text-xs bg-white px-2 py-1 rounded shadow mt-1">
                Pickup
              </div>
            </div>
          )}
          
          {dropoffLocation && (
            <div className="absolute bottom-1/4 right-1/4 z-10">
              <div className="bg-red-500 text-white p-2 rounded-full shadow-lg">
                <Navigation className="h-4 w-4" />
              </div>
              <div className="text-xs bg-white px-2 py-1 rounded shadow mt-1">
                Dropoff
              </div>
            </div>
          )}
          
          {(driverLocation || currentLocation) && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="bg-blue-500 text-white p-2 rounded-full shadow-lg animate-pulse">
                <Car className="h-4 w-4" />
              </div>
              <div className="text-xs bg-white px-2 py-1 rounded shadow mt-1">
                {isDriver ? 'You' : 'Driver'}
              </div>
            </div>
          )}
        </div>

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
              <Button size="sm" variant="outline" className="h-8">
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
          <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <span className="font-semibold text-yellow-800">ETA: {estimatedArrival}</span>
            </div>
          </div>
        )}

        {/* Tracking Controls */}
        <div className="flex gap-2">
          <Button 
            onClick={startTracking}
            disabled={tracking}
            variant={tracking ? "secondary" : "default"}
            className="flex-1"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${tracking ? 'animate-spin' : ''}`} />
            {tracking ? 'Tracking Active' : 'Start Tracking'}
          </Button>
          
          {isDriver && rideStatus === 'ongoing' && (
            <Button variant="outline" className="flex-1">
              Update Location
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
      </CardContent>
    </Card>
  );
}