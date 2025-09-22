-- Add image upload functionality for sellers, restaurants, and properties
-- Create triggers to automatically update updated_at timestamps

-- Update products table to handle images properly
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS featured_image TEXT;

-- Update restaurants table for image uploads
ALTER TABLE public.restaurants 
ADD COLUMN IF NOT EXISTS cover_image TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Update properties table for image management
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS featured_image TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create triggers for updating timestamps
CREATE TRIGGER update_restaurants_updated_at
    BEFORE UPDATE ON public.restaurants
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_properties_updated_at
    BEFORE UPDATE ON public.properties
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Update RLS policies for restaurants to allow sellers to manage their own restaurants
CREATE POLICY "Sellers can manage own restaurants" 
ON public.restaurants 
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.sellers 
  WHERE sellers.user_id = auth.uid() 
  AND sellers.id = restaurants.seller_id
));

-- Update RLS policies for menu_items to allow restaurant owners to manage them
CREATE POLICY "Restaurant owners can manage menu items" 
ON public.menu_items 
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.restaurants r
  JOIN public.sellers s ON s.id = r.seller_id
  WHERE r.id = menu_items.restaurant_id 
  AND s.user_id = auth.uid()
));

-- Create errand orders table for errand services
CREATE TABLE public.errand_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES auth.users(id) NOT NULL,
    service_type TEXT NOT NULL,
    pickup_address TEXT NOT NULL,
    delivery_address TEXT,
    errand_details TEXT NOT NULL,
    urgency TEXT DEFAULT 'normal' CHECK (urgency IN ('normal', 'urgent', 'express')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in_progress', 'completed', 'cancelled')),
    total_amount NUMERIC NOT NULL,
    payment_method TEXT DEFAULT 'cash' CHECK (payment_method IN ('cash', 'mpesa', 'wallet')),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
    assigned_to UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on errand_orders
ALTER TABLE public.errand_orders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for errand_orders
CREATE POLICY "Users can create errand orders" 
ON public.errand_orders 
FOR INSERT 
WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Users can view related errand orders" 
ON public.errand_orders 
FOR SELECT 
USING (auth.uid() = customer_id OR auth.uid() = assigned_to);

CREATE POLICY "Users can update related errand orders" 
ON public.errand_orders 
FOR UPDATE 
USING (auth.uid() = customer_id OR auth.uid() = assigned_to);

-- Create trigger for errand_orders timestamps
CREATE TRIGGER update_errand_orders_updated_at
    BEFORE UPDATE ON public.errand_orders
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();