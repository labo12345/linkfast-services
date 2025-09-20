-- Add sample products for different categories
INSERT INTO public.products (
  name, 
  description, 
  price, 
  category_id, 
  seller_id, 
  stock_quantity, 
  images, 
  sku,
  is_active
) VALUES 
-- Electronics
(
  'Wireless Bluetooth Headphones',
  'High-quality wireless headphones with noise cancellation and 20-hour battery life',
  2500.00,
  'f4618419-1c47-438d-a7a5-df157b09ecf1',
  (SELECT id FROM sellers LIMIT 1),
  50,
  ARRAY['/placeholder.svg'],
  'WBH-001',
  true
),
(
  'Smartphone Case - Clear',
  'Transparent protective case for smartphones with drop protection',
  500.00,
  'f4618419-1c47-438d-a7a5-df157b09ecf1',
  (SELECT id FROM sellers LIMIT 1),
  100,
  ARRAY['/placeholder.svg'],
  'SPC-001',
  true
),
(
  'USB-C Charging Cable',
  'Fast charging USB-C cable with data transfer capability',
  800.00,
  'f4618419-1c47-438d-a7a5-df157b09ecf1',
  (SELECT id FROM sellers LIMIT 1),
  200,
  ARRAY['/placeholder.svg'],
  'USB-001',
  true
),
-- Fashion
(
  'Cotton Casual T-Shirt',
  'Comfortable 100% cotton t-shirt available in multiple colors',
  800.00,
  '1440ceee-5189-44f0-94e5-b2f94ab2b715',
  (SELECT id FROM sellers LIMIT 1),
  75,
  ARRAY['/placeholder.svg'],
  'CCT-001',
  true
),
(
  'Denim Jeans - Slim Fit',
  'Classic slim fit denim jeans with premium quality fabric',
  2200.00,
  '1440ceee-5189-44f0-94e5-b2f94ab2b715',
  (SELECT id FROM sellers LIMIT 1),
  40,
  ARRAY['/placeholder.svg'],
  'DJ-001',
  true
),
(
  'Leather Wallet',
  'Genuine leather wallet with multiple card slots and coin pocket',
  1500.00,
  '1440ceee-5189-44f0-94e5-b2f94ab2b715',
  (SELECT id FROM sellers LIMIT 1),
  60,
  ARRAY['/placeholder.svg'],
  'LW-001',
  true
),
-- Home & Garden
(
  'Indoor Plant Pot Set',
  'Set of 3 ceramic plant pots with drainage holes for indoor plants',
  1200.00,
  '6d30a0a6-e5a1-4db1-8ef5-5fa986615bc1',
  (SELECT id FROM sellers LIMIT 1),
  30,
  ARRAY['/placeholder.svg'],
  'IPP-001',
  true
),
(
  'LED Table Lamp',
  'Modern LED table lamp with adjustable brightness and USB charging port',
  3500.00,
  '6d30a0a6-e5a1-4db1-8ef5-5fa986615bc1',
  (SELECT id FROM sellers LIMIT 1),
  25,
  ARRAY['/placeholder.svg'],
  'LTL-001',
  true
),
-- Health & Beauty
(
  'Organic Face Cream',
  'Natural organic face cream with vitamin E and aloe vera for all skin types',
  1200.00,
  'c5a3dd3d-7a14-4855-a70d-50eb872a84c0',
  (SELECT id FROM sellers LIMIT 1),
  80,
  ARRAY['/placeholder.svg'],
  'OFC-001',
  true
),
(
  'Vitamin C Serum',
  'Anti-aging vitamin C serum for brighter and younger looking skin',
  1800.00,
  'c5a3dd3d-7a14-4855-a70d-50eb872a84c0',
  (SELECT id FROM sellers LIMIT 1),
  45,
  ARRAY['/placeholder.svg'],
  'VCS-001',
  true
);