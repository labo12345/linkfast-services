-- Add sample restaurants
INSERT INTO restaurants (name, description, cuisine_type, logo_url, delivery_fee, min_order_amount, rating, is_active) VALUES
('Burger Palace', 'Best burgers in town with fresh ingredients', 'Fast Food', '/src/assets/food-burger.webp', 50, 200, 4.5, true),
('Pizza Corner', 'Authentic Italian pizzas with traditional recipes', 'Italian', '/src/assets/food-pizza.webp', 75, 300, 4.7, true),
('Spice Kitchen', 'Traditional Kenyan cuisine with modern twist', 'Kenyan', '/placeholder.svg', 60, 250, 4.3, true);

-- Add sample menu items
INSERT INTO menu_items (name, description, price, image_url, preparation_time, category_id, restaurant_id, is_available) VALUES
-- Burger Palace items
('Classic Beef Burger', 'Juicy beef patty with lettuce, tomato, and our special sauce', 450, '/src/assets/food-burger.webp', 15, (SELECT id FROM categories WHERE name = 'Electronics' LIMIT 1), (SELECT id FROM restaurants WHERE name = 'Burger Palace' LIMIT 1), true),
('Chicken Deluxe', 'Grilled chicken breast with avocado and bacon', 520, '/src/assets/food-burger.webp', 18, (SELECT id FROM categories WHERE name = 'Electronics' LIMIT 1), (SELECT id FROM restaurants WHERE name = 'Burger Palace' LIMIT 1), true),
('Veggie Burger', 'Plant-based patty with fresh vegetables', 380, '/src/assets/food-burger.webp', 12, (SELECT id FROM categories WHERE name = 'Electronics' LIMIT 1), (SELECT id FROM restaurants WHERE name = 'Burger Palace' LIMIT 1), true),

-- Pizza Corner items  
('Margherita Pizza', 'Classic pizza with tomato, mozzarella, and fresh basil', 650, '/src/assets/food-pizza.webp', 25, (SELECT id FROM categories WHERE name = 'Fashion' LIMIT 1), (SELECT id FROM restaurants WHERE name = 'Pizza Corner' LIMIT 1), true),
('Pepperoni Special', 'Loaded with pepperoni and extra cheese', 750, '/src/assets/food-pizza.webp', 28, (SELECT id FROM categories WHERE name = 'Fashion' LIMIT 1), (SELECT id FROM restaurants WHERE name = 'Pizza Corner' LIMIT 1), true),
('Hawaiian Delight', 'Ham, pineapple, and cheese combination', 720, '/src/assets/food-pizza.webp', 26, (SELECT id FROM categories WHERE name = 'Fashion' LIMIT 1), (SELECT id FROM restaurants WHERE name = 'Pizza Corner' LIMIT 1), true);

-- Add sample properties
INSERT INTO properties (title, description, price, bedrooms, bathrooms, size, property_type, images, contact_phone, contact_email, latitude, longitude, seller_id, is_active) VALUES
('Modern Family House', 'Beautiful 3-bedroom house with garden and parking', 2500000, 3, 2, '1200 sqft', 'house', ARRAY['/src/assets/property-house.webp'], '0701234567', 'seller1@example.com', -0.6108, 37.2397, auth.uid(), true),
('Downtown Apartment', 'Luxury 2-bedroom apartment in city center', 1800000, 2, 2, '900 sqft', 'apartment', ARRAY['/src/assets/property-apartment.webp'], '0702345678', 'seller2@example.com', -0.6133, 37.2356, auth.uid(), true),
('Spacious Villa', '4-bedroom villa with swimming pool and large compound', 4200000, 4, 3, '2000 sqft', 'villa', ARRAY['/src/assets/property-house.webp'], '0703456789', 'seller3@example.com', -0.6150, 37.2400, auth.uid(), true);

-- Update category images
UPDATE categories SET image_url = '/src/assets/category-electronics.webp' WHERE name = 'Electronics';
UPDATE categories SET image_url = '/src/assets/category-fashion.webp' WHERE name = 'Fashion';  
UPDATE categories SET image_url = '/src/assets/category-home.webp' WHERE name = 'Home & Garden';