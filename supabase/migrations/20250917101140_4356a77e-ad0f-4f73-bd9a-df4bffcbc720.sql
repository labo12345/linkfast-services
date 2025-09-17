-- Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public) VALUES 
('products', 'products', true),
('restaurants', 'restaurants', true),
('properties', 'properties', true),
('drivers', 'drivers', false),
('avatars', 'avatars', true);

-- Storage policies for products bucket
CREATE POLICY "Product images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'products');
CREATE POLICY "Sellers can upload product images" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'products' AND 
  EXISTS (SELECT 1 FROM public.sellers WHERE sellers.user_id = auth.uid())
);
CREATE POLICY "Sellers can update their product images" ON storage.objects FOR UPDATE USING (
  bucket_id = 'products' AND 
  EXISTS (SELECT 1 FROM public.sellers WHERE sellers.user_id = auth.uid())
);
CREATE POLICY "Sellers can delete their product images" ON storage.objects FOR DELETE USING (
  bucket_id = 'products' AND 
  EXISTS (SELECT 1 FROM public.sellers WHERE sellers.user_id = auth.uid())
);

-- Storage policies for restaurants bucket
CREATE POLICY "Restaurant images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'restaurants');
CREATE POLICY "Restaurant owners can upload images" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'restaurants' AND 
  EXISTS (SELECT 1 FROM public.sellers WHERE sellers.user_id = auth.uid())
);

-- Storage policies for properties bucket
CREATE POLICY "Property images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'properties');
CREATE POLICY "Property owners can upload images" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'properties' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage policies for drivers bucket (private)
CREATE POLICY "Drivers can view their own documents" ON storage.objects FOR SELECT USING (
  bucket_id = 'drivers' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Drivers can upload their own documents" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'drivers' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage policies for avatars bucket
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload their own avatar" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Users can update their own avatar" ON storage.objects FOR UPDATE USING (
  bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Seed categories
INSERT INTO public.categories (name, description, image_url) VALUES
('Electronics', 'Phones, computers, and electronic gadgets', '/placeholder.svg'),
('Fashion', 'Clothing, shoes, and accessories', '/placeholder.svg'),
('Home & Garden', 'Furniture, decor, and garden supplies', '/placeholder.svg'),
('Health & Beauty', 'Cosmetics, health supplements, and wellness products', '/placeholder.svg'),
('Sports & Fitness', 'Exercise equipment, sportswear, and outdoor gear', '/placeholder.svg'),
('Books & Media', 'Books, movies, music, and educational materials', '/placeholder.svg'),
('Food & Beverages', 'Packaged food, drinks, and snacks', '/placeholder.svg'),
('Automotive', 'Car parts, accessories, and maintenance products', '/placeholder.svg');

-- Seed demo data - First create a demo seller
DO $$
DECLARE
    demo_user_id UUID;
    demo_seller_id UUID;
    electronics_cat_id UUID;
    fashion_cat_id UUID;
BEGIN
    -- Insert demo user into auth.users (this would normally be done by Supabase Auth)
    -- For demo purposes, we'll create some sample data that references existing categories
    
    -- Get category IDs
    SELECT id INTO electronics_cat_id FROM public.categories WHERE name = 'Electronics' LIMIT 1;
    SELECT id INTO fashion_cat_id FROM public.categories WHERE name = 'Fashion' LIMIT 1;
    
    -- Note: In production, sellers and products would be created by authenticated users
    -- This is just sample data for demonstration
END $$;