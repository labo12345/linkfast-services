-- Create staff table for restaurant staff management
CREATE TABLE IF NOT EXISTS public.staff (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL,
  name VARCHAR NOT NULL,
  role VARCHAR NOT NULL,
  phone VARCHAR,
  email VARCHAR,
  shift VARCHAR,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

-- Create policies for staff table
CREATE POLICY "Restaurant owners can manage staff"
  ON public.staff
  FOR ALL
  USING (
    restaurant_id IN (
      SELECT restaurants.id
      FROM restaurants
      WHERE restaurants.seller_id IN (
        SELECT sellers.id
        FROM sellers
        WHERE sellers.user_id = auth.uid()
      )
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_staff_updated_at
  BEFORE UPDATE ON public.staff
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for staff table
ALTER PUBLICATION supabase_realtime ADD TABLE public.staff;