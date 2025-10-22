-- Remove the incorrect taxonomy_theme_business_models junction table
-- Business models are independent tags, not theme-specific

DROP TABLE IF EXISTS public.taxonomy_theme_business_models CASCADE;

-- Update the get_taxonomy_json function to remove business models from themes
-- Business models should be fetched separately as they are independent

CREATE OR REPLACE FUNCTION public.get_taxonomy_json()
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'pillars', jsonb_agg(
      jsonb_build_object(
        'id', p.id,
        'name', p.name,
        'description', p.description,
        'sectors', (
          SELECT jsonb_agg(
            jsonb_build_object(
              'id', s.id,
              'name', s.name,
              'description', s.description,
              'themes', (
                SELECT jsonb_agg(
                  jsonb_build_object(
                    'id', t.id,
                    'name', t.name,
                    'description', t.description,
                    'impact', t.impact,
                    'in_scope', t.in_scope,
                    'out_of_scope', t.out_of_scope,
                    'common_edge_cases', t.common_edge_cases,
                    'key_identifiers', t.key_identifiers
                  ) ORDER BY t.name
                )
                FROM taxonomy_themes t
                WHERE t.sector_id = s.id AND t.is_active = true
              )
            ) ORDER BY s.display_order
          )
          FROM taxonomy_sectors s
          WHERE s.pillar_id = p.id
        )
      ) ORDER BY p.display_order
    )
  ) INTO result
  FROM taxonomy_pillars p;
  
  RETURN result;
END;
$function$;

-- Create a separate function to get all business models
-- These are independent classification tags

CREATE OR REPLACE FUNCTION public.get_business_models_json()
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', bm.id,
      'name', bm.name,
      'description', bm.description
    ) ORDER BY bm.name
  ) INTO result
  FROM taxonomy_business_models bm;
  
  RETURN COALESCE(result, '[]'::jsonb);
END;
$function$;