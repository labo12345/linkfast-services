-- Add missing columns to drivers
ALTER TABLE public.drivers ADD COLUMN current_latitude DOUBLE PRECISION;
ALTER TABLE public.drivers ADD COLUMN current_longitude DOUBLE PRECISION;

-- Add missing columns to restaurants
ALTER TABLE public.restaurants ADD COLUMN cuisine_type TEXT;
ALTER TABLE public.restaurants ADD COLUMN logo_url TEXT;
ALTER TABLE public.restaurants ADD COLUMN cover_image TEXT;
ALTER TABLE public.restaurants ADD COLUMN min_order_amount DECIMAL(10,2) DEFAULT 0;

-- Add missing columns to menu_items
ALTER TABLE public.menu_items ADD COLUMN preparation_time INTEGER;
ALTER TABLE public.menu_items ADD COLUMN category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL;

-- Add missing columns to properties
ALTER TABLE public.properties ADD COLUMN size TEXT;
ALTER TABLE public.properties ADD COLUMN images TEXT[];
ALTER TABLE public.properties ADD COLUMN contact_phone TEXT;
ALTER TABLE public.properties ADD COLUMN contact_email TEXT;
ALTER TABLE public.properties ADD COLUMN amenities TEXT[];

-- Add missing columns to products
ALTER TABLE public.products ADD COLUMN images TEXT[];

-- Create staff table for restaurant staff
CREATE TABLE public.staff (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on staff table
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

-- RLS Policies for staff
CREATE POLICY "Restaurant owners can view their staff" ON public.staff FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.restaurants WHERE id = staff.restaurant_id AND user_id = auth.uid())
);
CREATE POLICY "Restaurant owners can manage staff" ON public.staff FOR ALL USING (
  EXISTS (SELECT 1 FROM public.restaurants WHERE id = staff.restaurant_id AND user_id = auth.uid())
);
CREATE POLICY "Admins can manage all staff" ON public.staff FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON public.staff FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();