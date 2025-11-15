import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Clock, Car } from 'lucide-react';

interface Driver {
  id: string;
  user_id: string;
  vehicle_type: string;
  vehicle_number: string;
  license_number: string;
  is_verified: boolean;
  created_at: string;
  profiles: {
    full_name: string;
    avatar_url?: string;
  };
}

export const DriverVerification = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDrivers = async () => {
    try {
      const { data: driversData, error: driversError } = await supabase
        .from('drivers')
        .select('*')
        .order('created_at', { ascending: false });

      if (driversError) throw driversError;

      // Fetch profiles for each driver
      const driversWithProfiles = await Promise.all(
        (driversData || []).map(async (driver) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', driver.user_id)
            .single();

          return {
            ...driver,
            profiles: profile || { full_name: 'Unknown', avatar_url: null }
          };
        })
      );

      setDrivers(driversWithProfiles as Driver[]);
    } catch (error) {
      console.error('Error fetching drivers:', error);
      toast.error('Failed to fetch drivers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('driver-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'drivers'
        },
        () => {
          fetchDrivers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleVerify = async (driverId: string, isVerified: boolean) => {
    try {
      const { error } = await supabase
        .from('drivers')
        .update({ is_verified: isVerified })
        .eq('id', driverId);

      if (error) throw error;

      toast.success(
        isVerified
          ? 'Driver approved successfully! Driver role assigned.'
          : 'Driver verification revoked. Driver role removed.'
      );
      fetchDrivers();
    } catch (error) {
      console.error('Error updating driver:', error);
      toast.error('Failed to update driver status');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading drivers...</div>;
  }

  const pendingDrivers = drivers.filter(d => !d.is_verified);
  const verifiedDrivers = drivers.filter(d => d.is_verified);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Pending Verifications ({pendingDrivers.length})
          </CardTitle>
          <CardDescription>
            Review and approve driver registrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingDrivers.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No pending driver verifications
            </p>
          ) : (
            <div className="space-y-4">
              {pendingDrivers.map((driver) => (
                <div
                  key={driver.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4 text-muted-foreground" />
                      <h4 className="font-medium">{driver.profiles.full_name}</h4>
                      <Badge variant="secondary">Pending</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p><strong>Vehicle:</strong> {driver.vehicle_type}</p>
                      <p><strong>Vehicle Number:</strong> {driver.vehicle_number}</p>
                      <p><strong>License:</strong> {driver.license_number}</p>
                      <p><strong>Applied:</strong> {new Date(driver.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleVerify(driver.id, true)}
                      className="gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Approve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Verified Drivers ({verifiedDrivers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {verifiedDrivers.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No verified drivers yet
            </p>
          ) : (
            <div className="space-y-4">
              {verifiedDrivers.map((driver) => (
                <div
                  key={driver.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4 text-muted-foreground" />
                      <h4 className="font-medium">{driver.profiles.full_name}</h4>
                      <Badge variant="default">Verified</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p><strong>Vehicle:</strong> {driver.vehicle_type}</p>
                      <p><strong>Vehicle Number:</strong> {driver.vehicle_number}</p>
                      <p><strong>License:</strong> {driver.license_number}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleVerify(driver.id, false)}
                    className="gap-2"
                  >
                    <XCircle className="h-4 w-4" />
                    Revoke
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
