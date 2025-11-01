-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
);

-- Create RLS policies for product images bucket
CREATE POLICY "Users can view all product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Users can upload product images to own stores"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' 
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM stores WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update product images from own stores"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'product-images'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM stores WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete product images from own stores"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-images'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM stores WHERE user_id = auth.uid()
  )
);

-- Create coupons table
CREATE TABLE public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
  code text NOT NULL,
  discount_percent numeric NOT NULL CHECK (discount_percent > 0 AND discount_percent <= 100),
  is_active boolean NOT NULL DEFAULT true,
  expires_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(store_id, code)
);

-- Enable RLS on coupons
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- RLS policies for coupons
CREATE POLICY "Users can view coupons from own stores"
ON public.coupons FOR SELECT
USING (
  store_id IN (
    SELECT id FROM stores WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert coupons to own stores"
ON public.coupons FOR INSERT
WITH CHECK (
  store_id IN (
    SELECT id FROM stores WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update coupons from own stores"
ON public.coupons FOR UPDATE
USING (
  store_id IN (
    SELECT id FROM stores WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete coupons from own stores"
ON public.coupons FOR DELETE
USING (
  store_id IN (
    SELECT id FROM stores WHERE user_id = auth.uid()
  )
);

-- Add coupon fields to orders table
ALTER TABLE public.orders ADD COLUMN coupon_code text;
ALTER TABLE public.orders ADD COLUMN discount_amount numeric DEFAULT 0;

-- Create trigger for coupons updated_at
CREATE TRIGGER update_coupons_updated_at
BEFORE UPDATE ON public.coupons
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();