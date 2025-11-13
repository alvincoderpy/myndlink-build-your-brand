-- Add display_order and is_mock columns to products table
ALTER TABLE products 
ADD COLUMN display_order INTEGER,
ADD COLUMN is_mock BOOLEAN DEFAULT false;

-- Set initial order based on created_at
UPDATE products 
SET display_order = (
  SELECT COUNT(*) 
  FROM products p2 
  WHERE p2.store_id = products.store_id 
  AND p2.created_at <= products.created_at
);

-- Create index for faster ordering
CREATE INDEX idx_products_display_order ON products(store_id, display_order);