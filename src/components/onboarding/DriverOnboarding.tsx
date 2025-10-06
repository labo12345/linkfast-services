import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Car, Upload, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export default function DriverOnboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    vehicle_type: '',
    vehicle_number: '',
    license_number: '',
    vehicle_documents: [] as string[]
  });

  const handleSubmit = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('drivers')
        .insert([
          {
            user_id: user.id,
            ...formData,
            is_verified: false,
            is_online: false
          }
        ]);

      if (error) throw error;

      toast({
        title: "Application submitted!",
        description: "Your driver application is under review. You'll be notified once verified.",
      });

      navigate('/driver-dashboard');
    } catch (error) {
      console.error('Driver registration error:', error);
      toast({
        title: "Error",
        description: "Failed to submit application",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-6 w-6" />
            Become a Driver
          </CardTitle>
          <p className="text-muted-foreground">
            Complete your profile to start earning
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step Indicator */}
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step >= s ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}
                >
                  {step > s ? <Check className="h-5 w-5" /> : s}
                </div>
                {s < 3 && (
                  <div
                    className={`h-1 w-20 ${
                      step > s ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Vehicle Details */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label>Vehicle Type</Label>
                <Select
                  value={formData.vehicle_type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, vehicle_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="taxi">Taxi (4 seater)</SelectItem>
                    <SelectItem value="motorbike">Motorbike</SelectItem>
                    <SelectItem value="pickup">Pickup Truck</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Vehicle Registration Number</Label>
                <Input
                  placeholder="e.g., KBX 123A"
                  value={formData.vehicle_number}
                  onChange={(e) =>
                    setFormData({ ...formData, vehicle_number: e.target.value })
                  }
                />
              </div>

              <Button
                onClick={() => setStep(2)}
                disabled={!formData.vehicle_type || !formData.vehicle_number}
                className="w-full"
              >
                Next
              </Button>
            </div>
          )}

          {/* Step 2: License */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <Label>Driver's License Number</Label>
                <Input
                  placeholder="Enter your license number"
                  value={formData.license_number}
                  onChange={(e) =>
                    setFormData({ ...formData, license_number: e.target.value })
                  }
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={!formData.license_number}
                  className="flex-1"
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Documents */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-2">
                  Upload vehicle documents
                </p>
                <p className="text-xs text-muted-foreground">
                  Insurance, logbook, NTSA inspection
                </p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? 'Submitting...' : 'Submit Application'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}