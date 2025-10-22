-- Fix Critical Security Issues: Enable RLS on exposed tables

-- 1. Enable RLS on company_business_models table
ALTER TABLE public.company_business_models ENABLE ROW LEVEL SECURITY;

-- Create policies for company_business_models
CREATE POLICY "Analysts and admins can view business models"
ON public.company_business_models FOR SELECT
USING (has_role(auth.uid(), 'analyst'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Analysts and admins can create business models"
ON public.company_business_models FOR INSERT
WITH CHECK (has_role(auth.uid(), 'analyst'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Analysts and admins can update business models"
ON public.company_business_models FOR UPDATE
USING (has_role(auth.uid(), 'analyst'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete business models"
ON public.company_business_models FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- 2. Enable RLS on dealcloud_sync_log table
ALTER TABLE public.dealcloud_sync_log ENABLE ROW LEVEL SECURITY;

-- Create policies for dealcloud_sync_log (admin-only access)
CREATE POLICY "Only admins can view sync logs"
ON public.dealcloud_sync_log FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can create sync logs"
ON public.dealcloud_sync_log FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 3. Enable RLS on dealcloud_theme_mapping table
ALTER TABLE public.dealcloud_theme_mapping ENABLE ROW LEVEL SECURITY;

-- Create policies for dealcloud_theme_mapping
CREATE POLICY "Analysts and admins can view theme mappings"
ON public.dealcloud_theme_mapping FOR SELECT
USING (has_role(auth.uid(), 'analyst'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage theme mappings"
ON public.dealcloud_theme_mapping FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- 4. Recreate detailed_scores_with_context view with SECURITY INVOKER
-- This makes the view use the caller's permissions, inheriting RLS from underlying tables
DROP VIEW IF EXISTS public.detailed_scores_with_context;

CREATE VIEW public.detailed_scores_with_context
WITH (security_invoker = true)
AS
SELECT 
  ds.id,
  ds.theme_id,
  tt.name as theme_name,
  ts.id as sector_id,
  ds.criteria_id,
  fc.name as criteria_name,
  fc.code as criteria_code,
  fcat.name as category_name,
  fcat.code as category_code,
  ds.score,
  ds.ai_research_data,
  ds.updated_by,
  ds.updated_at,
  ds.update_source,
  ds.analyst_notes,
  ds.notes,
  ds.confidence
FROM detailed_scores ds
LEFT JOIN taxonomy_themes tt ON tt.id = ds.theme_id
LEFT JOIN taxonomy_sectors ts ON ts.id = tt.sector_id
LEFT JOIN framework_criteria fc ON fc.id = ds.criteria_id
LEFT JOIN framework_categories fcat ON fcat.id = fc.category_id;