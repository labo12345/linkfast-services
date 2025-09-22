import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Car, 
  MapPin, 
  Clock, 
  DollarSign,
  Power,
  PowerOff,
  Navigation,
  Upload,
  CreditCard,
  Star,
  Phone,
  Settings
} from 'lucide-react';
import PricingModal from '@/components/driver/PricingModal';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export default function DriverDashboard() {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(false);
  const [driverProfile, setDriverProfile] = useState({
    id: '',
    vehicle_type: '',
    vehicle_number: '',
    license_number: '',
    is_verified: false
  });
  const [earnings, setEarnings] = useState({
    today: 0,
    week: 0,
    month: 0
  });
  const [activeRides, setActiveRides] = useState([]);
  const [pricingModalOpen, setPricingModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchDriverProfile();
      fetchEarnings();
      fetchActiveRides();
    }
  }, [user]);

  const fetchDriverProfile = async () => {
    try {
      const { data } = await supabase
        .from('drivers')
        .select('*')
        .eq('user_id', user?.id)
        .single();
      
      if (data) {
        setIsOnline(data.is_online);
        setDriverProfile({
          id: data.id,
          vehicle_type: data.vehicle_type || '',
          vehicle_number: data.vehicle_number || '',
          license_number: data.license_number || '',
          is_verified: data.is_verified
        });
      }
    } catch (error) {
      console.error('Error fetching driver profile:', error);
    }
  };

  const fetchEarnings = async () => {
    // Mock earnings data - replace with actual Supabase query
    setEarnings({
      today: 2500,
      week: 12000,
      month: 45000
    });
  };

  const fetchActiveRides = async () => {
    try {
      const { data, error } = await supabase
        .from('rides')
        .select('*')
        .eq('driver_id', user?.id)
        .in('status', ['accepted', 'ongoing']);
      
      if (data) {
        setActiveRides(data);
      }
    } catch (error) {
      console.error('Error fetching active rides:', error);
    }
  };

  const toggleOnlineStatus = async () => {
    try {
      const { data: driverData } = await supabase
        .from('drivers')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (driverData) {
        const { error } = await supabase
          .from('drivers')
          .update({ is_online: !isOnline })
          .eq('id', driverData.id);

        if (!error) {
          setIsOnline(!isOnline);
          toast({
            title: isOnline ? "Going offline" : "Going online",
            description: isOnline ? "You are now offline" : "You are now online and available for rides"
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to update status",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('Error toggling online status:', error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive"
      });
    }
  };

  const updateDriverProfile = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('drivers')
        .upsert({
          user_id: user?.id,
          ...driverProfile
        });

      if (!error) {
        toast({
          title: "Profile updated",
          description: "Your driver profile has been updated successfully"
        });
      }
    } catch (error) {
      console.error('Error updating driver profile:', error);
    }
    setLoading(false);
  };

  if (!user) return null;

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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Driver Dashboard</h1>
              <p className="text-muted-foreground">
                Manage your rides and earnings
              </p>
            </div>
            
            <Button
              onClick={toggleOnlineStatus}
              disabled={loading || !driverProfile.is_verified}
              className={`${
                isOnline 
                  ? 'bg-destructive hover:bg-destructive/90' 
                  : 'bg-primary hover:bg-primary/90'
              }`}
            >
              {isOnline ? <PowerOff className="h-4 w-4 mr-2" /> : <Power className="h-4 w-4 mr-2" />}
              {isOnline ? 'Go Offline' : 'Go Online'}
            </Button>
          </div>
        </motion.div>

        {/* Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className={`border-2 ${isOnline ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-4 h-4 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      {isOnline ? 'Online - Ready for rides' : 'Offline'}
                    </h3>
                    <p className="text-muted-foreground">
                      {driverProfile.is_verified 
                        ? (isOnline ? 'You can receive ride requests' : 'Toggle online to start earning')
                        : 'Complete your profile verification to start driving'
                      }
                    </p>
                  </div>
                </div>
                {driverProfile.is_verified && (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    Verified Driver
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Earnings Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Earnings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Today</span>
                    <span className="font-semibold">KES {earnings.today.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">This Week</span>
                    <span className="font-semibold">KES {earnings.week.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">This Month</span>
                    <span className="font-semibold text-primary">KES {earnings.month.toLocaleString()}</span>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Withdraw Earnings
                </Button>
              </CardContent>
            </Card>

            {/* Vehicle Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  Vehicle Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="vehicleType">Vehicle Type</Label>
                    <Input
                      id="vehicleType"
                      value={driverProfile.vehicle_type}
                      onChange={(e) => setDriverProfile({...driverProfile, vehicle_type: e.target.value})}
                      placeholder="e.g., Toyota Corolla"
                    />
                  </div>
                  <div>
                    <Label htmlFor="vehicleNumber">Vehicle Number</Label>
                    <Input
                      id="vehicleNumber"
                      value={driverProfile.vehicle_number}
                      onChange={(e) => setDriverProfile({...driverProfile, vehicle_number: e.target.value})}
                      placeholder="e.g., KCA 123A"
                    />
                  </div>
                  <div>
                    <Label htmlFor="licenseNumber">License Number</Label>
                    <Input
                      id="licenseNumber"
                      value={driverProfile.license_number}
                      onChange={(e) => setDriverProfile({...driverProfile, license_number: e.target.value})}
                      placeholder="Your driving license number"
                    />
                  </div>
                </div>
                
                <Button onClick={updateDriverProfile} disabled={loading} className="w-full">
                  {loading ? 'Updating...' : 'Update Profile'}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => setPricingModalOpen(true)}
                  className="w-full mt-2"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Set Pricing
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Active Rides Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="h-5 w-5" />
                  Active Rides ({activeRides.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeRides.length > 0 ? (
                  <div className="space-y-4">
                    {activeRides.map((ride: any) => (
                      <div key={ride.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-primary" />
                              <span className="font-medium">Pickup: {ride.pickup_address}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Navigation className="h-4 w-4 text-gold" />
                              <span className="font-medium">Dropoff: {ride.dropoff_address}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                {new Date(ride.created_at).toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                          <Badge>{ride.status}</Badge>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button size="sm" className="flex-1">
                            <Phone className="h-4 w-4 mr-2" />
                            Call Customer
                          </Button>
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Car className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-semibold mb-2">No active rides</h3>
                    <p className="text-muted-foreground">
                      {isOnline ? 'Waiting for ride requests...' : 'Go online to start receiving ride requests'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
        
        {/* Pricing Modal */}
        <PricingModal 
          isOpen={pricingModalOpen}
          onClose={() => setPricingModalOpen(false)}
          driverId={driverProfile.id || ''}
        />
      </div>
    </div>
  );
}