-- =============================================
-- MenuCraft Production Seed Data
-- =============================================

-- Seed Demo Restaurant
INSERT INTO public.restaurants (
  id,
  owner_id,
  name,
  description,
  address,
  city,
  postal_code,
  phone,
  currency,
  is_published,
  slug
) VALUES (
  'd0a89f21-0000-4000-a000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'The Bistro Sphere',
  'Artisan French & Continental Dining in downtown Portland.',
  '1284 Culinary Blvd, Suite 100',
  'Portland',
  '97205',
  '+1 (555) 019-2834',
  'USD',
  TRUE,
  'the-bistro'
) ON CONFLICT (id) DO NOTHING;

-- Seed Categories
INSERT INTO public.categories (id, restaurant_id, name, sort_order, is_visible) VALUES
('c1010000-0000-4000-a000-000000000001', 'd0a89f21-0000-4000-a000-000000000001', 'Appetizers', 1, TRUE),
('c1020000-0000-4000-a000-000000000002', 'd0a89f21-0000-4000-a000-000000000001', 'Mains', 2, TRUE),
('c1030000-0000-4000-a000-000000000003', 'd0a89f21-0000-4000-a000-000000000001', 'Desserts', 3, TRUE)
ON CONFLICT (id) DO NOTHING;

-- Seed Items
INSERT INTO public.menu_items (id, restaurant_id, category_id, name, description, price, is_available, is_popular) VALUES
('i2010000-0000-4000-a000-000000000001', 'd0a89f21-0000-4000-a000-000000000001', 'c1010000-0000-4000-a000-000000000001', 'Classic French Onion Soup', 'Caramelized onions, beef broth, toasted baguette, melted gruyere.', 12.00, TRUE, FALSE),
('i2020000-0000-4000-a000-000000000002', 'd0a89f21-0000-4000-a000-000000000001', 'c1020000-0000-4000-a000-000000000002', 'Steak Frites', '8oz hanger steak, garlic herb butter, house-cut fries.', 32.00, TRUE, TRUE)
ON CONFLICT (id) DO NOTHING;
