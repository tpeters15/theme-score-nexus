-- Drop existing taxonomy tables if they exist
DROP TABLE IF EXISTS public.taxonomy_theme_business_models CASCADE;
DROP TABLE IF EXISTS public.taxonomy_themes CASCADE;
DROP TABLE IF EXISTS public.taxonomy_business_models CASCADE;
DROP TABLE IF EXISTS public.taxonomy_sectors CASCADE;
DROP TABLE IF EXISTS public.taxonomy_pillars CASCADE;
DROP FUNCTION IF EXISTS public.get_taxonomy_json() CASCADE;

-- Create taxonomy pillars table
CREATE TABLE public.taxonomy_pillars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  display_order integer NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create taxonomy sectors table
CREATE TABLE public.taxonomy_sectors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pillar_id uuid REFERENCES public.taxonomy_pillars(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  display_order integer NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(pillar_id, name)
);

-- Create taxonomy business models table
CREATE TABLE public.taxonomy_business_models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create taxonomy themes table (enhanced version of existing themes)
CREATE TABLE public.taxonomy_themes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sector_id uuid REFERENCES public.taxonomy_sectors(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  impact text,
  in_scope text[] DEFAULT '{}',
  out_of_scope text[] DEFAULT '{}',
  example_companies text[] DEFAULT '{}',
  common_edge_cases text,
  key_identifiers text[] DEFAULT '{}',
  version integer NOT NULL DEFAULT 1,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(sector_id, name, version)
);

-- Junction table for themes and business models (many-to-many)
CREATE TABLE public.taxonomy_theme_business_models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_id uuid REFERENCES public.taxonomy_themes(id) ON DELETE CASCADE NOT NULL,
  business_model_id uuid REFERENCES public.taxonomy_business_models(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(theme_id, business_model_id)
);

-- Enable RLS
ALTER TABLE public.taxonomy_pillars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.taxonomy_sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.taxonomy_business_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.taxonomy_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.taxonomy_theme_business_models ENABLE ROW LEVEL SECURITY;

-- Public read access for all taxonomy tables
CREATE POLICY "Public read access for taxonomy pillars"
  ON public.taxonomy_pillars FOR SELECT USING (true);

CREATE POLICY "Public read access for taxonomy sectors"
  ON public.taxonomy_sectors FOR SELECT USING (true);

CREATE POLICY "Public read access for taxonomy business models"
  ON public.taxonomy_business_models FOR SELECT USING (true);

CREATE POLICY "Public read access for taxonomy themes"
  ON public.taxonomy_themes FOR SELECT USING (true);

CREATE POLICY "Public read access for taxonomy theme business models"
  ON public.taxonomy_theme_business_models FOR SELECT USING (true);

-- Admin-only write access
CREATE POLICY "Admins can manage taxonomy pillars"
  ON public.taxonomy_pillars FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage taxonomy sectors"
  ON public.taxonomy_sectors FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage taxonomy business models"
  ON public.taxonomy_business_models FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage taxonomy themes"
  ON public.taxonomy_themes FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage taxonomy theme business models"
  ON public.taxonomy_theme_business_models FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_taxonomy_pillars_updated_at
  BEFORE UPDATE ON public.taxonomy_pillars
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_taxonomy_sectors_updated_at
  BEFORE UPDATE ON public.taxonomy_sectors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_taxonomy_business_models_updated_at
  BEFORE UPDATE ON public.taxonomy_business_models
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_taxonomy_themes_updated_at
  BEFORE UPDATE ON public.taxonomy_themes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to get full taxonomy as JSON for n8n
CREATE OR REPLACE FUNCTION public.get_taxonomy_json()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
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
                    'example_companies', t.example_companies,
                    'common_edge_cases', t.common_edge_cases,
                    'key_identifiers', t.key_identifiers,
                    'business_models', (
                      SELECT jsonb_agg(bm.name)
                      FROM taxonomy_theme_business_models tbm
                      JOIN taxonomy_business_models bm ON bm.id = tbm.business_model_id
                      WHERE tbm.theme_id = t.id
                    )
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
$$;

-- Create indexes for better query performance
CREATE INDEX idx_taxonomy_sectors_pillar_id ON public.taxonomy_sectors(pillar_id);
CREATE INDEX idx_taxonomy_themes_sector_id ON public.taxonomy_themes(sector_id);
CREATE INDEX idx_taxonomy_themes_is_active ON public.taxonomy_themes(is_active);
CREATE INDEX idx_taxonomy_theme_business_models_theme_id ON public.taxonomy_theme_business_models(theme_id);
CREATE INDEX idx_taxonomy_theme_business_models_business_model_id ON public.taxonomy_theme_business_models(business_model_id);