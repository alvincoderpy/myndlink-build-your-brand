-- Remove permissive public INSERT policies on orders and order_items.
-- All public order creation must go through the SECURITY DEFINER function
-- public.create_order_atomic, which validates stock, coupons, prices, and items atomically.

DROP POLICY IF EXISTS "Public can create orders" ON public.orders;
DROP POLICY IF EXISTS "Public can create order items" ON public.order_items;