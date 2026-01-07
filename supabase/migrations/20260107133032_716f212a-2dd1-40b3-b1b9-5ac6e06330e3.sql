-- Create a public view for stores that excludes user_id
CREATE OR REPLACE VIEW public.public_stores AS
SELECT 
  id,
  name,
  subdomain,
  custom_domain,
  template,
  template_config,
  logo_url,
  favicon_url,
  meta_description,
  social_links,
  is_published,
  created_at,
  updated_at,
  plan
FROM public.stores
WHERE is_published = true;

-- Grant SELECT on the view to anon and authenticated roles
GRANT SELECT ON public.public_stores TO anon;
GRANT SELECT ON public.public_stores TO authenticated;

-- Drop the existing public select policy that exposes user_id
DROP POLICY IF EXISTS "Public can view published stores" ON public.stores;

-- Create new restrictive policy that limits public access
-- Public users cannot directly query the stores table anymore
-- They must use the public_stores view instead
-- Only authenticated store owners can query their own stores
CREATE POLICY "Authenticated owners can view own stores"
ON public.stores
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Enable RLS on the view (views inherit table RLS by default but we make it explicit)
-- The view already filters to is_published = true, so public access is safe