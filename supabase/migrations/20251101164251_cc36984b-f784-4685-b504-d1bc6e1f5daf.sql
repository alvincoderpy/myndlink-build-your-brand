-- Fix 1: Stock Updates Create Race Conditions
-- Create atomic order function to prevent race conditions
CREATE OR REPLACE FUNCTION create_order_atomic(
  p_store_id uuid,
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text,
  p_customer_address text,
  p_payment_method text,
  p_notes text,
  p_coupon_code text,
  p_discount_amount numeric,
  p_cart_items jsonb
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_order_id uuid;
  item jsonb;
  current_stock int;
  item_price numeric;
  order_total numeric := 0;
BEGIN
  -- Calculate total from cart items
  FOR item IN SELECT * FROM jsonb_array_elements(p_cart_items)
  LOOP
    order_total := order_total + ((item->>'price')::numeric * (item->>'quantity')::int);
  END LOOP;
  
  -- Apply discount
  order_total := order_total - COALESCE(p_discount_amount, 0);
  
  -- Create order
  INSERT INTO orders (
    store_id,
    customer_name,
    customer_email,
    customer_phone,
    customer_address,
    payment_method,
    notes,
    coupon_code,
    discount_amount,
    total,
    status
  ) VALUES (
    p_store_id,
    p_customer_name,
    p_customer_email,
    p_customer_phone,
    p_customer_address,
    p_payment_method,
    p_notes,
    p_coupon_code,
    p_discount_amount,
    order_total,
    'pending'
  ) RETURNING id INTO new_order_id;
  
  -- Process each cart item atomically with row locking
  FOR item IN SELECT * FROM jsonb_array_elements(p_cart_items)
  LOOP
    -- Lock row and get current stock
    SELECT stock, price INTO current_stock, item_price
    FROM products
    WHERE id = (item->>'id')::uuid
    FOR UPDATE;
    
    -- Check if sufficient stock
    IF current_stock < (item->>'quantity')::int THEN
      RAISE EXCEPTION 'Insufficient stock for product %', item->>'name';
    END IF;
    
    -- Update stock atomically
    UPDATE products
    SET stock = stock - (item->>'quantity')::int
    WHERE id = (item->>'id')::uuid;
    
    -- Create order item
    INSERT INTO order_items (
      order_id,
      product_id,
      quantity,
      price
    ) VALUES (
      new_order_id,
      (item->>'id')::uuid,
      (item->>'quantity')::int,
      (item->>'price')::numeric
    );
  END LOOP;
  
  -- Return success with order ID
  RETURN jsonb_build_object(
    'success', true,
    'order_id', new_order_id,
    'order_number', new_order_id::text
  );
  
EXCEPTION
  WHEN OTHERS THEN
    -- Return error information
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Fix 2: Subdomain Creation Lacks Security Controls
-- Create reserved subdomains table
CREATE TABLE IF NOT EXISTS reserved_subdomains (
  subdomain text PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now()
);

-- Insert reserved subdomains
INSERT INTO reserved_subdomains (subdomain) VALUES
  ('www'), ('api'), ('admin'), ('mail'), ('ftp'), 
  ('smtp'), ('cdn'), ('app'), ('dashboard'), ('static'),
  ('assets'), ('images'), ('support'), ('help'), ('docs')
ON CONFLICT (subdomain) DO NOTHING;

-- Add subdomain validation constraints
ALTER TABLE stores 
  DROP CONSTRAINT IF EXISTS check_subdomain_length,
  DROP CONSTRAINT IF EXISTS check_subdomain_format,
  DROP CONSTRAINT IF EXISTS check_not_reserved;

ALTER TABLE stores 
  ADD CONSTRAINT check_subdomain_length 
    CHECK (length(subdomain) BETWEEN 3 AND 63),
  ADD CONSTRAINT check_subdomain_format
    CHECK (subdomain ~ '^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$');

-- Create subdomain validation trigger function
CREATE OR REPLACE FUNCTION validate_subdomain_trigger()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check format
  IF NEW.subdomain !~ '^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$' THEN
    RAISE EXCEPTION 'Invalid subdomain format: use only lowercase letters, numbers, and hyphens (no start/end hyphens)';
  END IF;
  
  -- Check for consecutive hyphens
  IF NEW.subdomain LIKE '%-%-%' THEN
    RAISE EXCEPTION 'Consecutive hyphens not allowed in subdomain';
  END IF;
  
  -- Check if reserved
  IF EXISTS (SELECT 1 FROM reserved_subdomains WHERE subdomain = NEW.subdomain) THEN
    RAISE EXCEPTION 'Subdomain "%" is reserved', NEW.subdomain;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_subdomain ON stores;
CREATE TRIGGER validate_subdomain
  BEFORE INSERT OR UPDATE OF subdomain ON stores
  FOR EACH ROW
  EXECUTE FUNCTION validate_subdomain_trigger();

-- Fix 3: Product Limits Enforced Client-Side Only
-- Create product limit enforcement trigger function
CREATE OR REPLACE FUNCTION check_product_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  product_count int;
  store_plan text;
  plan_limit int;
BEGIN
  -- Get store plan
  SELECT plan INTO store_plan
  FROM stores
  WHERE id = NEW.store_id;
  
  -- Determine limit based on plan
  plan_limit := CASE store_plan
    WHEN 'free' THEN 10
    WHEN 'grow' THEN 100
    WHEN 'business' THEN 1000
    WHEN 'enterprise' THEN 999999
    ELSE 10
  END;
  
  -- Count existing products for this store
  SELECT COUNT(*) INTO product_count
  FROM products
  WHERE store_id = NEW.store_id;
  
  -- Enforce limit (only for new inserts, not updates)
  IF TG_OP = 'INSERT' AND product_count >= plan_limit THEN
    RAISE EXCEPTION 'Product limit reached for % plan (maximum: % products)', store_plan, plan_limit;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_product_limit ON products;
CREATE TRIGGER enforce_product_limit
  BEFORE INSERT ON products
  FOR EACH ROW
  EXECUTE FUNCTION check_product_limit();