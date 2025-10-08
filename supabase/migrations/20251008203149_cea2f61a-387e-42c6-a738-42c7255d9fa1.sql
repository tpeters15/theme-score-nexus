-- Phase 1: Add keywords column to taxonomy_themes
ALTER TABLE taxonomy_themes ADD COLUMN IF NOT EXISTS keywords text[];

-- Phase 2: Create new tables for company classifications
CREATE TABLE IF NOT EXISTS company_theme_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  theme_id uuid NOT NULL REFERENCES taxonomy_themes(id) ON DELETE CASCADE,
  is_primary boolean NOT NULL DEFAULT true,
  confidence_score numeric,
  classification_method text CHECK (classification_method IN ('manual', 'ai_batch', 'ai_single', 'imported')),
  classified_at timestamp with time zone NOT NULL DEFAULT now(),
  classified_by uuid REFERENCES profiles(id),
  batch_id uuid REFERENCES classification_batches(id),
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(company_id, theme_id)
);

CREATE INDEX IF NOT EXISTS idx_company_theme_mappings_primary 
  ON company_theme_mappings(company_id, is_primary) 
  WHERE is_primary = true;

CREATE TABLE IF NOT EXISTS taxonomy_theme_example_companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_id uuid NOT NULL REFERENCES taxonomy_themes(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  is_positive_example boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(theme_id, company_id)
);

-- Phase 3: Enable RLS on new tables
ALTER TABLE company_theme_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE taxonomy_theme_example_companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for company theme mappings"
  ON company_theme_mappings FOR SELECT USING (true);

CREATE POLICY "Public read access for theme example companies"
  ON taxonomy_theme_example_companies FOR SELECT USING (true);

CREATE POLICY "Admins can manage company theme mappings"
  ON company_theme_mappings FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage theme example companies"
  ON taxonomy_theme_example_companies FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Analysts can create company theme mappings"
  ON company_theme_mappings FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'analyst'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Analysts can update company theme mappings"
  ON company_theme_mappings FOR UPDATE
  USING (has_role(auth.uid(), 'analyst'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Phase 4: Add update triggers
CREATE TRIGGER update_company_theme_mappings_updated_at
  BEFORE UPDATE ON company_theme_mappings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_taxonomy_theme_example_companies_updated_at
  BEFORE UPDATE ON taxonomy_theme_example_companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Phase 5: Remove example_companies column from taxonomy_themes
ALTER TABLE taxonomy_themes DROP COLUMN IF EXISTS example_companies;

-- Phase 6: Drop the old themes table
DROP TABLE IF EXISTS themes CASCADE;