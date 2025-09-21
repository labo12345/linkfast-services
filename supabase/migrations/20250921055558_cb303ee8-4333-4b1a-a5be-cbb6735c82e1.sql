-- Add driver pricing table and enhance drivers table
CREATE TABLE IF NOT EXISTS public.driver_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES public.drivers(id) ON DELETE CASCADE,
  ride_type TEXT NOT NULL DEFAULT 'taxi',
  base_fare DECIMAL(10,2) NOT NULL DEFAULT 200.00,
  per_km_rate DECIMAL(10,2) NOT NULL DEFAULT 50.00,
  minimum_fare DECIMAL(10,2) NOT NULL DEFAULT 150.00,
  waiting_charge DECIMAL(10,2) NOT NULL DEFAULT 5.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(driver_id, ride_type)
);

-- Enable RLS
ALTER TABLE public.driver_pricing ENABLE ROW LEVEL SECURITY;

-- Create policies for driver pricing
CREATE POLICY "Drivers can manage own pricing" ON public.driver_pricing
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.drivers 
    WHERE drivers.id = driver_pricing.driver_id 
    AND drivers.user_id = auth.uid()
  )
);

CREATE POLICY "Public can view driver pricing" ON public.driver_pricing
FOR SELECT USING (true);

-- Add current location fields to drivers if not exist (they already exist)
-- ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS current_latitude DECIMAL;
-- ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS current_longitude DECIMAL;

-- Create trigger for updated_at on driver_pricing
CREATE TRIGGER update_driver_pricing_updated_at
BEFORE UPDATE ON public.driver_pricing
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_driver_pricing_driver_id ON public.driver_pricing(driver_id);
CREATE INDEX IF NOT EXISTS idx_drivers_online_verified ON public.drivers(is_online, is_verified) WHERE is_online = true AND is_verified = true;