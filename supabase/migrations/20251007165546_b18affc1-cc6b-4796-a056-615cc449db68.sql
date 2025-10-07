-- Phase 1: Unified Classification Architecture Migration

-- Step 1: Add all new columns to classifications table
ALTER TABLE classifications
  ADD COLUMN IF NOT EXISTS pillar TEXT,
  ADD COLUMN IF NOT EXISTS sector TEXT,
  ADD COLUMN IF NOT EXISTS theme_id UUID REFERENCES taxonomy_themes(id),
  ADD COLUMN IF NOT EXISTS business_model TEXT,
  ADD COLUMN IF NOT EXISTS sourcescrub_description TEXT,
  ADD COLUMN IF NOT EXISTS perplexity_research TEXT,
  ADD COLUMN IF NOT EXISTS pitchbook_data TEXT,
  ADD COLUMN IF NOT EXISTS preqin_data TEXT,
  ADD COLUMN IF NOT EXISTS website_summary TEXT,
  ADD COLUMN IF NOT EXISTS context_metadata JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS taxonomy_version INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS model_used TEXT,
  ADD COLUMN IF NOT EXISTS n8n_execution_id TEXT,
  ADD COLUMN IF NOT EXISTS source_system TEXT,
  ADD COLUMN IF NOT EXISTS classification_type TEXT DEFAULT 'initial',
  ADD COLUMN IF NOT EXISTS dealcloud_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Step 2: Make batch_id nullable (for single classifications from DealCloud/Teams)
ALTER TABLE classifications
  ALTER COLUMN batch_id DROP NOT NULL;

-- Step 3: Add source_system constraint
ALTER TABLE classifications
  ADD CONSTRAINT check_source_system 
  CHECK (source_system IN ('dealcloud', 'dashboard', 'teams'));

-- Step 4: Add classification_type constraint
ALTER TABLE classifications
  ADD CONSTRAINT check_classification_type
  CHECK (classification_type IN ('initial', 'review', 'correction'));

-- Step 5: Backfill source_system for existing records
UPDATE classifications
SET source_system = 'dashboard'
WHERE source_system IS NULL;

-- Step 6: Make source_system required after backfill
ALTER TABLE classifications
  ALTER COLUMN source_system SET NOT NULL;

-- Step 7: Create trigger for updated_at
CREATE TRIGGER update_classifications_updated_at
  BEFORE UPDATE ON classifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Step 8: Add performance indexes
CREATE INDEX IF NOT EXISTS idx_classifications_source_system 
  ON classifications(source_system);

CREATE INDEX IF NOT EXISTS idx_classifications_dealcloud_id 
  ON classifications(dealcloud_id) WHERE dealcloud_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_classifications_theme_id 
  ON classifications(theme_id) WHERE theme_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_classifications_classification_type 
  ON classifications(classification_type);

CREATE INDEX IF NOT EXISTS idx_classifications_n8n_execution_id 
  ON classifications(n8n_execution_id) WHERE n8n_execution_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_classifications_context_metadata 
  ON classifications USING GIN(context_metadata);

-- Step 9: Add comments for documentation
COMMENT ON COLUMN classifications.pillar IS 'Taxonomy pillar (Decarbonisation, Energy Transition, Resource Sustainability)';
COMMENT ON COLUMN classifications.sector IS 'Taxonomy sector within the pillar';
COMMENT ON COLUMN classifications.theme_id IS 'Foreign key to taxonomy_themes table';
COMMENT ON COLUMN classifications.business_model IS 'Business model classification';
COMMENT ON COLUMN classifications.sourcescrub_description IS 'Company description from SourceScrub/DealCloud';
COMMENT ON COLUMN classifications.perplexity_research IS 'Research output from Perplexity AI';
COMMENT ON COLUMN classifications.pitchbook_data IS 'Data extracted from PitchBook';
COMMENT ON COLUMN classifications.preqin_data IS 'Data extracted from Preqin';
COMMENT ON COLUMN classifications.website_summary IS 'Summary extracted from company website';
COMMENT ON COLUMN classifications.context_metadata IS 'Flexible JSONB for citations, search config, freshness, etc.';
COMMENT ON COLUMN classifications.taxonomy_version IS 'Version of taxonomy used for classification';
COMMENT ON COLUMN classifications.model_used IS 'AI model used (e.g., gemini-2.5-flash)';
COMMENT ON COLUMN classifications.n8n_execution_id IS 'n8n workflow execution ID for traceability';
COMMENT ON COLUMN classifications.source_system IS 'Origin of classification: dealcloud, dashboard, or teams';
COMMENT ON COLUMN classifications.classification_type IS 'Type: initial, review, or correction';
COMMENT ON COLUMN classifications.dealcloud_id IS 'DealCloud company ID for write-back';
COMMENT ON COLUMN classifications.batch_id IS 'Optional: links to classification_batches for UI grouping';

-- Step 10: Add updated_at to companies table for consistency
ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();