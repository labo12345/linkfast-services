import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MapPin, 
  Car, 
  Clock, 
  User,
  Phone,
  Navigation,
  CreditCard
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Driver {
  id: string;
  vehicle_type: string;
  vehicle_number: string;
  current_latitude: number;
  current_longitude: number;
  users: {
    full_name: string;
    phone: string;
  };
}

export default function Taxi() {
  const { user } = useAuth();
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [rideType, setRideType] = useState('taxi');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [availableDrivers, setAvailableDrivers] = useState<Driver[]>([]);
  const [estimatedFare, setEstimatedFare] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAvailableDrivers();
  }, []);

  const fetchAvailableDrivers = async () => {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select(`
          id,
          vehicle_type,
          vehicle_number,
          current_latitude,
          current_longitude,
          users!drivers_user_id_fkey(full_name, phone)
        `)
        .eq('is_online', true)
        .eq('is_verified', true)
        .limit(10);

      if (error) throw error;
      setAvailableDrivers(data || []);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  };

  const calculateEstimatedFare = () => {
    // Basic fare calculation - in real app this would use actual distance
    const baseFare = rideType === 'taxi' ? 200 : rideType === 'motorbike' ? 150 : 100;
    const estimatedDistance = Math.floor(Math.random() * 10) + 1; // Random for demo
    const fare = baseFare + (estimatedDistance * 50);
    setEstimatedFare(fare);
  };

  useEffect(() => {
    if (pickupAddress && dropoffAddress) {
      calculateEstimatedFare();
    }
  }, [pickupAddress, dropoffAddress, rideType]);

  const handleBookRide = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to book a ride",
        variant: "destructive",
      });
      return;
    }

    if (!pickupAddress || !dropoffAddress) {
      toast({
        title: "Missing information",
        description: "Please provide both pickup and dropoff addresses",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('rides')
        .insert([
          {
            customer_id: user.id,
            pickup_address: pickupAddress,
            dropoff_address: dropoffAddress,
            pickup_latitude: -0.3031, // Default Kerugoya coordinates
            pickup_longitude: 37.2808,
            dropoff_latitude: -0.3131, // Approximate dropoff
            dropoff_longitude: 37.2908,
            fare: estimatedFare,
            special_instructions: specialInstructions,
            payment_method: paymentMethod as any,
            status: 'requested'
          }
        ]);

      if (error) throw error;

      toast({
        title: "Ride booked successfully!",
        description: "Looking for available drivers nearby...",
      });

      // Reset form
      setPickupAddress('');
      setDropoffAddress('');
      setSpecialInstructions('');
    } catch (error) {
      console.error('Error booking ride:', error);
      toast({
        title: "Booking failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Book a Ride</h1>
          <p className="text-muted-foreground">
            Quick and reliable transportation across Kerugoya and beyond
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle>Ride Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Pickup Location */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Pickup Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary h-4 w-4" />
                    <Input
                      placeholder="Enter pickup address"
                      value={pickupAddress}
                      onChange={(e) => setPickupAddress(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Dropoff Location */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Dropoff Location</label>
                  <div className="relative">
                    <Navigation className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gold h-4 w-4" />
                    <Input
                      placeholder="Enter destination address"
                      value={dropoffAddress}
                      onChange={(e) => setDropoffAddress(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Ride Type */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Vehicle Type</label>
                  <Select value={rideType} onValueChange={setRideType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="taxi">Taxi (4 seats)</SelectItem>
                      <SelectItem value="motorbike">Motorbike (1 passenger)</SelectItem>
                      <SelectItem value="pickup">Pickup Truck (cargo)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Payment Method</label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="mpesa">M-Pesa</SelectItem>
                      <SelectItem value="wallet">Wallet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Special Instructions */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Special Instructions (Optional)</label>
                  <Textarea
                    placeholder="Any special requests or landmarks?"
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Estimated Fare */}
                {estimatedFare > 0 && (
                  <div className="bg-primary/10 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Estimated Fare:</span>
                      <span className="text-xl font-bold text-primary">
                        KES {estimatedFare}
                      </span>
                    </div>
                  </div>
                )}

                <Button 
                  onClick={handleBookRide} 
                  disabled={loading || !pickupAddress || !dropoffAddress}
                  className="w-full"
                >
                  {loading ? 'Booking...' : 'Book Ride'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Available Drivers */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  Available Drivers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {availableDrivers.slice(0, 5).map((driver) => (
                  <div key={driver.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{driver.users?.full_name || 'Driver'}</p>
                      <p className="text-sm text-muted-foreground">
                        {driver.vehicle_type} • {driver.vehicle_number}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <p className="text-xs text-muted-foreground">Online</p>
                    </div>
                  </div>
                ))}

                {availableDrivers.length === 0 && (
                  <div className="text-center py-4">
                    <Car className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No drivers online
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Phone className="h-4 w-4 mr-2" />
                  Call: 0111679286
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Phone className="h-4 w-4 mr-2" />
                  Call: 0717562660
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}