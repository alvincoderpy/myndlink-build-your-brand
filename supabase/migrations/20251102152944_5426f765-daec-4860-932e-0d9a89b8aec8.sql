-- Fix function search_path for validate_subdomain_trigger
-- This prevents potential security issues from search_path manipulation
CREATE OR REPLACE FUNCTION public.validate_subdomain_trigger()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;