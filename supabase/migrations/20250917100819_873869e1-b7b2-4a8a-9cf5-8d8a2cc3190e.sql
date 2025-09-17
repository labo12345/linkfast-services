-- Fix RLS policies for remaining tables

-- Sellers policies
CREATE POLICY "Sellers can view own profile" ON public.sellers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Sellers can update own profile" ON public.sellers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can create seller profile" ON public.sellers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Public can view verified sellers" ON public.sellers FOR SELECT USING (is_verified = true);

-- Drivers policies
CREATE POLICY "Drivers can view own profile" ON public.drivers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Drivers can update own profile" ON public.drivers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can create driver profile" ON public.drivers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Public can view verified online drivers" ON public.drivers FOR SELECT USING (is_verified = true AND is_online = true);

-- Order items policies (only viewable through orders relationship)
CREATE POLICY "Users can view order items for related orders" ON public.order_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND (
      orders.customer_id = auth.uid() OR 
      orders.driver_id = auth.uid() OR
      EXISTS (SELECT 1 FROM public.sellers WHERE sellers.user_id = auth.uid() AND sellers.id = orders.seller_id)
    )
  )
);

CREATE POLICY "Users can create order items for own orders" ON public.order_items FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND orders.customer_id = auth.uid()
  )
);

-- Chats policies 
CREATE POLICY "Users can view chats they're part of" ON public.chats FOR SELECT USING (
  auth.uid() = sender_id OR auth.uid() = receiver_id
);

CREATE POLICY "Users can send chats" ON public.chats FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Transactions policies
CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Fix function search paths
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  
  -- Create wallet for new user
  INSERT INTO public.wallets (user_id) VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;