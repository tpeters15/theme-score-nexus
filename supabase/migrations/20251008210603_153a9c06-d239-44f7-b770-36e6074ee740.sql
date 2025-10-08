-- Consolidate company-theme relationships into a single table
-- Add example company flags to company_theme_mappings

-- Step 1: Add new columns to company_theme_mappings
ALTER TABLE company_theme_mappings 
ADD COLUMN IF NOT EXISTS is_example boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS is_positive_example boolean NOT NULL DEFAULT true;

-- Step 2: Migrate any data from taxonomy_theme_example_companies if it exists
INSERT INTO company_theme_mappings (
  company_id, 
  theme_id, 
  is_example, 
  is_positive_example,
  classification_method,
  classified_at
)
SELECT 
  company_id,
  theme_id,
  true as is_example,
  is_positive_example,
  'taxonomy_definition' as classification_method,
  created_at as classified_at
FROM taxonomy_theme_example_companies
WHERE NOT EXISTS (
  -- Avoid duplicates if a company is already mapped to this theme
  SELECT 1 FROM company_theme_mappings ctm 
  WHERE ctm.company_id = taxonomy_theme_example_companies.company_id 
  AND ctm.theme_id = taxonomy_theme_example_companies.theme_id
);

-- Step 3: Drop the old table
DROP TABLE IF EXISTS taxonomy_theme_example_companies;

-- Add comment to document the new columns
COMMENT ON COLUMN company_theme_mappings.is_example IS 'Marks this company as a taxonomy reference example (true) vs operational classification (false)';
COMMENT ON COLUMN company_theme_mappings.is_positive_example IS 'For example companies: true = in-scope example, false = out-of-scope example';