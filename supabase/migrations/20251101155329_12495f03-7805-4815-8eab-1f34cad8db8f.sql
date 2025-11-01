-- Fix: Public Stores Cannot Be Viewed
CREATE POLICY "Public can view published stores"
ON public.stores FOR SELECT
USING (is_published = true);

-- Fix: Store Products Hidden from Customers  
CREATE POLICY "Public can view active products"
ON public.products FOR SELECT
USING (is_active = true AND stock > 0);

-- Fix: Customers Cannot Place Orders
CREATE POLICY "Public can create orders"
ON public.orders FOR INSERT
WITH CHECK (
  store_id IN (SELECT id FROM public.stores WHERE is_published = true)
  AND total > 0
  AND customer_name IS NOT NULL 
  AND customer_phone IS NOT NULL
  AND customer_address IS NOT NULL
);

-- Fix: Order Items Cannot Be Created
CREATE POLICY "Public can create order items"
ON public.order_items FOR INSERT
WITH CHECK (
  order_id IN (
    SELECT id FROM public.orders 
    WHERE created_at > now() - interval '1 hour'
  )
  AND quantity > 0
  AND price > 0
);

-- Add database constraints for input validation
ALTER TABLE public.orders 
  ADD CONSTRAINT check_customer_name_length CHECK (length(customer_name) <= 100),
  ADD CONSTRAINT check_customer_name_not_empty CHECK (length(trim(customer_name)) >= 2),
  ADD CONSTRAINT check_customer_phone_format CHECK (customer_phone ~ '^[+]?[0-9]{9,15}$'),
  ADD CONSTRAINT check_customer_address_length CHECK (length(customer_address) BETWEEN 10 AND 500),
  ADD CONSTRAINT check_notes_length CHECK (notes IS NULL OR length(notes) <= 1000),
  ADD CONSTRAINT check_total_positive CHECK (total > 0);