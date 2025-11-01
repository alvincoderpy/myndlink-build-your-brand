-- Enable RLS on reserved_subdomains table to prevent unauthorized manipulation
ALTER TABLE public.reserved_subdomains ENABLE ROW LEVEL SECURITY;

-- Block all direct access - reserved subdomains should only be checked via triggers
CREATE POLICY "No direct access to reserved subdomains"
ON public.reserved_subdomains
FOR ALL
USING (false)
WITH CHECK (false);