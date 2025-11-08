-- Add branding and template fields to stores
ALTER TABLE stores 
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS favicon_url TEXT,
ADD COLUMN IF NOT EXISTS meta_description TEXT,
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb;

-- Create bucket for store assets (logos, hero images)
INSERT INTO storage.buckets (id, name, public)
VALUES ('store-assets', 'store-assets', true)
ON CONFLICT (id) DO NOTHING;

-- RLS Policy for upload
CREATE POLICY "Users can upload to own store assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'store-assets' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM stores WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own store assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'store-assets' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM stores WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own store assets"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'store-assets' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM stores WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Public can view store assets"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'store-assets');

-- Add product fields for categories and promotions
ALTER TABLE products
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_new BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS discount_percentage INTEGER DEFAULT 0 CHECK (discount_percentage >= 0 AND discount_percentage <= 100);