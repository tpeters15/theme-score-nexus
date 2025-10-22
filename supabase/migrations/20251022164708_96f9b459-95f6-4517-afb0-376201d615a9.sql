-- Add missing updated_at column to taxonomy_business_models table
ALTER TABLE taxonomy_business_models 
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Add trigger for auto-updating updated_at
CREATE TRIGGER update_taxonomy_business_models_updated_at
  BEFORE UPDATE ON taxonomy_business_models
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();