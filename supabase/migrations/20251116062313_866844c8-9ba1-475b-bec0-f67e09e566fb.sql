-- Add missing columns to restaurants
ALTER TABLE public.restaurants ADD COLUMN rating DECIMAL(3,2) DEFAULT 0;
ALTER TABLE public.restaurants ADD COLUMN delivery_fee DECIMAL(10,2) DEFAULT 0;

-- Add missing column to driver_pricing
ALTER TABLE public.driver_pricing ADD COLUMN waiting_charge DECIMAL(10,2) DEFAULT 0;

-- Add missing column to transactions
ALTER TABLE public.transactions ADD COLUMN external_reference TEXT;

-- Create sellers table
CREATE TABLE public.sellers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shop_name TEXT NOT NULL,
  shop_description TEXT,
  business_license TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create products table (for marketplace)
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  stock_quantity INTEGER DEFAULT 0,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create errand_orders table
CREATE TABLE public.errand_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  errand_id UUID NOT NULL REFERENCES public.errands(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  accepted_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.errand_orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sellers
CREATE POLICY "Sellers are viewable by everyone" ON public.sellers FOR SELECT USING (true);
CREATE POLICY "Users can create seller profile" ON public.sellers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Sellers can update own profile" ON public.sellers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage sellers" ON public.sellers FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for categories
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for products
CREATE POLICY "Products are viewable by everyone" ON public.products FOR SELECT USING (true);
CREATE POLICY "Sellers can create products" ON public.products FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.sellers WHERE id = products.seller_id AND user_id = auth.uid())
);
CREATE POLICY "Sellers can update own products" ON public.products FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.sellers WHERE id = products.seller_id AND user_id = auth.uid())
);
CREATE POLICY "Sellers can delete own products" ON public.products FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.sellers WHERE id = products.seller_id AND user_id = auth.uid())
);
CREATE POLICY "Admins can manage products" ON public.products FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for errand_orders
CREATE POLICY "Users can view own errand orders" ON public.errand_orders FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.errands WHERE id = errand_orders.errand_id AND customer_id = auth.uid())
);
CREATE POLICY "Drivers can view assigned errand orders" ON public.errand_orders FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.drivers WHERE user_id = auth.uid() AND id = errand_orders.driver_id)
);
CREATE POLICY "Drivers can create errand orders" ON public.errand_orders FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.drivers WHERE user_id = auth.uid())
);
CREATE POLICY "Drivers can update assigned errand orders" ON public.errand_orders FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.drivers WHERE user_id = auth.uid() AND id = errand_orders.driver_id)
);
CREATE POLICY "Admins can manage errand orders" ON public.errand_orders FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Add triggers for updated_at
CREATE TRIGGER update_sellers_updated_at BEFORE UPDATE ON public.sellers FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_errand_orders_updated_at BEFORE UPDATE ON public.errand_orders FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Trigger to assign seller role on verification
CREATE OR REPLACE FUNCTION public.assign_seller_role_on_verification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.is_verified = TRUE AND (OLD.is_verified IS NULL OR OLD.is_verified = FALSE) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.user_id, 'seller'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  IF NEW.is_verified = FALSE AND OLD.is_verified = TRUE THEN
    DELETE FROM public.user_roles
    WHERE user_id = NEW.user_id AND role = 'seller'::app_role;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER assign_seller_role_trigger
AFTER UPDATE ON public.sellers
FOR EACH ROW
EXECUTE FUNCTION public.assign_seller_role_on_verification();