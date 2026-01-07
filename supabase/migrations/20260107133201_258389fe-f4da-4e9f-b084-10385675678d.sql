-- Remove the anon policy that exposes user_id on stores table
-- The public_stores view should be used instead for public access
DROP POLICY IF EXISTS "Anon can view published stores" ON public.stores;

-- Create a security definer function to get public store data safely
-- This function returns only safe fields and doesn't expose user_id
CREATE OR REPLACE FUNCTION public.get_public_store(p_subdomain text)
RETURNS TABLE (
  id uuid,
  name text,
  subdomain text,
  custom_domain text,
  template text,
  template_config jsonb,
  logo_url text,
  favicon_url text,
  meta_description text,
  social_links jsonb,
  is_published boolean,
  created_at timestamptz,
  updated_at timestamptz,
  plan text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    s.id,
    s.name,
    s.subdomain,
    s.custom_domain,
    s.template,
    s.template_config,
    s.logo_url,
    s.favicon_url,
    s.meta_description,
    s.social_links,
    s.is_published,
    s.created_at,
    s.updated_at,
    s.plan
  FROM public.stores s
  WHERE s.subdomain = p_subdomain 
    AND s.is_published = true
  LIMIT 1;
$$;