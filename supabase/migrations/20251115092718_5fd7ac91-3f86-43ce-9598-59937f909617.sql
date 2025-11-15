-- Create drivers table for driver registration and verification
CREATE TABLE public.drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vehicle_type TEXT NOT NULL,
  vehicle_number TEXT NOT NULL,
  license_number TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  is_online BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

-- Drivers can view and update their own profile
CREATE POLICY "Drivers can view own profile"
  ON public.drivers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Drivers can update own profile"
  ON public.drivers FOR UPDATE
  USING (auth.uid() = user_id);

-- Anyone authenticated can insert (for registration)
CREATE POLICY "Authenticated users can register as driver"
  ON public.drivers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can view and update all drivers
CREATE POLICY "Admins can view all drivers"
  ON public.drivers FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all drivers"
  ON public.drivers FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_drivers_updated_at
  BEFORE UPDATE ON public.drivers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Function to assign driver role when verified
CREATE OR REPLACE FUNCTION public.assign_driver_role_on_verification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If driver is being verified (is_verified changed from false to true)
  IF NEW.is_verified = TRUE AND (OLD.is_verified IS NULL OR OLD.is_verified = FALSE) THEN
    -- Assign driver role if not already assigned
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.user_id, 'driver'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  -- If driver is being unverified (is_verified changed from true to false)
  IF NEW.is_verified = FALSE AND OLD.is_verified = TRUE THEN
    -- Remove driver role
    DELETE FROM public.user_roles
    WHERE user_id = NEW.user_id AND role = 'driver'::app_role;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger to automatically assign/remove driver role on verification status change
CREATE TRIGGER on_driver_verification_change
  AFTER UPDATE OF is_verified ON public.drivers
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_driver_role_on_verification();

-- Enable realtime for drivers table
ALTER PUBLICATION supabase_realtime ADD TABLE public.drivers;