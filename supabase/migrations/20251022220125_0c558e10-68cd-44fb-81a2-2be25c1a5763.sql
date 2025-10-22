-- Enable Row Level Security on taxonomy_business_models table
ALTER TABLE public.taxonomy_business_models ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view business models
CREATE POLICY "Authenticated users can view business models"
ON public.taxonomy_business_models
FOR SELECT
TO authenticated
USING (true);

-- Only admins can insert business models
CREATE POLICY "Admins can insert business models"
ON public.taxonomy_business_models
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update business models
CREATE POLICY "Admins can update business models"
ON public.taxonomy_business_models
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete business models
CREATE POLICY "Admins can delete business models"
ON public.taxonomy_business_models
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));