-- Security Fix: Add comprehensive server-side validation to create_order_atomic function
-- This addresses security findings: rls_orders_public_insert and endpoint_atomic_order_abuse

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
  calculated_total numeric := 0;
  submitted_total numeric;
  recent_orders_count int;
BEGIN
  -- VALIDATION 1: Check customer name length (2-100 characters)
  IF trim(p_customer_name) IS NULL OR length(trim(p_customer_name)) < 2 THEN
    RAISE EXCEPTION 'Customer name must be at least 2 characters';
  END IF;
  
  IF length(trim(p_customer_name)) > 100 THEN
    RAISE EXCEPTION 'Customer name must not exceed 100 characters';
  END IF;
  
  -- VALIDATION 2: Check customer phone format (9-15 digits, may include +)
  IF trim(p_customer_phone) IS NULL OR length(regexp_replace(p_customer_phone, '[^0-9]', '', 'g')) < 9 THEN
    RAISE EXCEPTION 'Customer phone must contain at least 9 digits';
  END IF;
  
  IF length(regexp_replace(p_customer_phone, '[^0-9]', '', 'g')) > 15 THEN
    RAISE EXCEPTION 'Customer phone must not exceed 15 digits';
  END IF;
  
  -- VALIDATION 3: Check customer address length (10-500 characters)
  IF trim(p_customer_address) IS NULL OR length(trim(p_customer_address)) < 10 THEN
    RAISE EXCEPTION 'Customer address must be at least 10 characters';
  END IF;
  
  IF length(trim(p_customer_address)) > 500 THEN
    RAISE EXCEPTION 'Customer address must not exceed 500 characters';
  END IF;
  
  -- VALIDATION 4: Check email format if provided
  IF p_customer_email IS NOT NULL AND trim(p_customer_email) != '' THEN
    IF length(trim(p_customer_email)) > 255 THEN
      RAISE EXCEPTION 'Customer email must not exceed 255 characters';
    END IF;
    
    IF NOT (trim(p_customer_email) ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$') THEN
      RAISE EXCEPTION 'Customer email format is invalid';
    END IF;
  END IF;
  
  -- VALIDATION 5: Check cart items array is not empty
  IF p_cart_items IS NULL OR jsonb_array_length(p_cart_items) = 0 THEN
    RAISE EXCEPTION 'Cart items cannot be empty';
  END IF;
  
  IF jsonb_array_length(p_cart_items) > 100 THEN
    RAISE EXCEPTION 'Cart cannot contain more than 100 items';
  END IF;
  
  -- VALIDATION 6: Rate limiting - check recent orders from this store
  SELECT COUNT(*) INTO recent_orders_count
  FROM orders
  WHERE store_id = p_store_id
    AND created_at > now() - interval '1 hour';
  
  IF recent_orders_count > 50 THEN
    RAISE EXCEPTION 'Too many orders in the last hour. Please try again later.';
  END IF;
  
  -- VALIDATION 7: Verify store exists and is published
  IF NOT EXISTS (SELECT 1 FROM stores WHERE id = p_store_id AND is_published = true) THEN
    RAISE EXCEPTION 'Store not found or not published';
  END IF;
  
  -- Calculate total from cart items and validate each item
  FOR item IN SELECT * FROM jsonb_array_elements(p_cart_items)
  LOOP
    -- Validate item has required fields
    IF item->>'id' IS NULL OR item->>'quantity' IS NULL OR item->>'price' IS NULL THEN
      RAISE EXCEPTION 'Invalid cart item: missing required fields';
    END IF;
    
    -- Validate quantity is positive
    IF (item->>'quantity')::int <= 0 THEN
      RAISE EXCEPTION 'Cart item quantity must be positive';
    END IF;
    
    IF (item->>'quantity')::int > 1000 THEN
      RAISE EXCEPTION 'Cart item quantity cannot exceed 1000';
    END IF;
    
    -- Validate price is positive
    IF (item->>'price')::numeric <= 0 THEN
      RAISE EXCEPTION 'Cart item price must be positive';
    END IF;
    
    -- Verify product exists and price matches current database price
    SELECT price INTO item_price
    FROM products
    WHERE id = (item->>'id')::uuid AND is_active = true;
    
    IF item_price IS NULL THEN
      RAISE EXCEPTION 'Product % not found or not active', item->>'name';
    END IF;
    
    IF item_price != (item->>'price')::numeric THEN
      RAISE EXCEPTION 'Price mismatch for product %. Expected %, got %', 
        item->>'name', item_price, (item->>'price')::numeric;
    END IF;
    
    calculated_total := calculated_total + ((item->>'price')::numeric * (item->>'quantity')::int);
  END LOOP;
  
  -- VALIDATION 8: Verify discount amount is valid
  IF p_discount_amount IS NOT NULL THEN
    IF p_discount_amount < 0 THEN
      RAISE EXCEPTION 'Discount amount cannot be negative';
    END IF;
    
    IF p_discount_amount > calculated_total THEN
      RAISE EXCEPTION 'Discount amount cannot exceed order total';
    END IF;
  END IF;
  
  -- Apply discount
  calculated_total := calculated_total - COALESCE(p_discount_amount, 0);
  
  -- VALIDATION 9: Verify calculated total is positive
  IF calculated_total <= 0 THEN
    RAISE EXCEPTION 'Order total must be positive';
  END IF;
  
  -- Create order with calculated total
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
    trim(p_customer_name),
    CASE WHEN trim(p_customer_email) = '' THEN NULL ELSE trim(p_customer_email) END,
    trim(p_customer_phone),
    trim(p_customer_address),
    p_payment_method,
    p_notes,
    p_coupon_code,
    p_discount_amount,
    calculated_total,
    'pending'
  ) RETURNING id INTO new_order_id;
  
  -- Process each cart item atomically with row locking
  FOR item IN SELECT * FROM jsonb_array_elements(p_cart_items)
  LOOP
    -- Lock row and get current stock
    SELECT stock INTO current_stock
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
    -- Return error information without exposing sensitive details
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;