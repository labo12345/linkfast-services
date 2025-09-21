import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  driverId: string;
}

interface PricingData {
  ride_type: string;
  base_fare: number;
  per_km_rate: number;
  minimum_fare: number;
  waiting_charge: number;
}

const rideTypes = [
  { value: 'taxi', label: 'Taxi (4 seats)', defaultBase: 200, defaultPerKm: 50 },
  { value: 'motorbike', label: 'Motorbike (1 passenger)', defaultBase: 150, defaultPerKm: 30 },
  { value: 'pickup', label: 'Pickup Truck (cargo)', defaultBase: 300, defaultPerKm: 70 }
];

export default function PricingModal({ isOpen, onClose, driverId }: PricingModalProps) {
  const { user } = useAuth();
  const [selectedRideType, setSelectedRideType] = useState('taxi');
  const [pricing, setPricing] = useState<Record<string, PricingData>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen && driverId) {
      fetchExistingPricing();
    }
  }, [isOpen, driverId]);

  const fetchExistingPricing = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('driver_pricing')
        .select('*')
        .eq('driver_id', driverId);

      if (error) throw error;

      const pricingMap: Record<string, PricingData> = {};
      
      // Initialize with defaults
      rideTypes.forEach(type => {
        pricingMap[type.value] = {
          ride_type: type.value,
          base_fare: type.defaultBase,
          per_km_rate: type.defaultPerKm,
          minimum_fare: type.defaultBase * 0.75,
          waiting_charge: 5
        };
      });

      // Override with existing data
      data?.forEach(item => {
        pricingMap[item.ride_type] = {
          ride_type: item.ride_type,
          base_fare: Number(item.base_fare),
          per_km_rate: Number(item.per_km_rate),
          minimum_fare: Number(item.minimum_fare),
          waiting_charge: Number(item.waiting_charge)
        };
      });

      setPricing(pricingMap);
    } catch (error) {
      console.error('Error fetching pricing:', error);
      toast({
        title: "Error",
        description: "Failed to load pricing data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePricing = (field: keyof PricingData, value: string) => {
    const numValue = Number(value) || 0;
    setPricing(prev => ({
      ...prev,
      [selectedRideType]: {
        ...prev[selectedRideType],
        [field]: numValue
      }
    }));
  };

  const savePricing = async () => {
    setSaving(true);
    try {
      const pricingArray = Object.values(pricing);
      
      for (const pricingData of pricingArray) {
        await supabase
          .from('driver_pricing')
          .upsert({
            driver_id: driverId,
            ride_type: pricingData.ride_type,
            base_fare: pricingData.base_fare,
            per_km_rate: pricingData.per_km_rate,
            minimum_fare: pricingData.minimum_fare,
            waiting_charge: pricingData.waiting_charge
          });
      }

      toast({
        title: "Pricing Updated",
        description: "Your pricing has been saved successfully"
      });
      
      onClose();
    } catch (error) {
      console.error('Error saving pricing:', error);
      toast({
        title: "Error",
        description: "Failed to save pricing",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const currentPricing = pricing[selectedRideType];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Set Your Pricing
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Ride Type Selector */}
          <div>
            <Label className="text-base font-semibold">Vehicle Type</Label>
            <Select value={selectedRideType} onValueChange={setSelectedRideType}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {rideTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading pricing data...</div>
          ) : currentPricing && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{rideTypes.find(t => t.value === selectedRideType)?.label}</span>
                  <Badge variant="outline">Per Trip Pricing</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="baseFare">Base Fare (KES)</Label>
                    <Input
                      id="baseFare"
                      type="number"
                      value={currentPricing.base_fare}
                      onChange={(e) => updatePricing('base_fare', e.target.value)}
                      placeholder="200"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Starting price for the ride
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="perKmRate">Per KM Rate (KES)</Label>
                    <Input
                      id="perKmRate"
                      type="number"
                      value={currentPricing.per_km_rate}
                      onChange={(e) => updatePricing('per_km_rate', e.target.value)}
                      placeholder="50"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Price per kilometer traveled
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="minimumFare">Minimum Fare (KES)</Label>
                    <Input
                      id="minimumFare"
                      type="number"
                      value={currentPricing.minimum_fare}
                      onChange={(e) => updatePricing('minimum_fare', e.target.value)}
                      placeholder="150"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Minimum charge regardless of distance
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="waitingCharge">Waiting Charge (KES/min)</Label>
                    <Input
                      id="waitingCharge"
                      type="number"
                      value={currentPricing.waiting_charge}
                      onChange={(e) => updatePricing('waiting_charge', e.target.value)}
                      placeholder="5"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Charge per minute when waiting
                    </p>
                  </div>
                </div>

                {/* Pricing Preview */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Fare Calculation Example:</h4>
                  <div className="space-y-1 text-sm">
                    <p>Base Fare: KES {currentPricing.base_fare}</p>
                    <p>5km trip: KES {currentPricing.base_fare + (5 * currentPricing.per_km_rate)}</p>
                    <p>10km trip: KES {currentPricing.base_fare + (10 * currentPricing.per_km_rate)}</p>
                    <p className="text-muted-foreground">+ Waiting time charges when applicable</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pricing Summary for all types */}
          <div className="grid grid-cols-3 gap-4">
            {rideTypes.map(type => {
              const typePrice = pricing[type.value];
              return (
                <Card 
                  key={type.value} 
                  className={`cursor-pointer transition-all ${
                    selectedRideType === type.value ? 'border-primary' : ''
                  }`}
                  onClick={() => setSelectedRideType(type.value)}
                >
                  <CardContent className="p-4 text-center">
                    <h4 className="font-semibold text-sm">{type.label}</h4>
                    {typePrice && (
                      <div className="space-y-1 mt-2">
                        <p className="text-lg font-bold text-primary">
                          KES {typePrice.base_fare}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          +{typePrice.per_km_rate}/km
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Save Button */}
          <Button 
            onClick={savePricing}
            disabled={saving || loading}
            className="w-full"
            size="lg"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Pricing'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}