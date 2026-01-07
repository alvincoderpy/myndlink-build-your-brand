-- Fix the view to use SECURITY INVOKER instead of SECURITY DEFINER
DROP VIEW IF EXISTS public.public_stores;

CREATE VIEW public.public_stores
WITH (security_invoker = true)
AS
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

-- Re-grant SELECT on the view
GRANT SELECT ON public.public_stores TO anon;
GRANT SELECT ON public.public_stores TO authenticated;

-- We need to allow anon users to read from stores table for the view to work
-- But we already removed the public policy, so we need to add a policy for anon
-- that only allows reading specific columns (through the view)
-- Actually, since security_invoker is true, the view runs as the querying user
-- For anon users to access the view, they need SELECT on the underlying table
-- So we need a policy that allows anon to select from stores where is_published = true

CREATE POLICY "Anon can view published stores"
ON public.stores
FOR SELECT
TO anon
USING (is_published = true);