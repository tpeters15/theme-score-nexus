-- Add updated_at column to classification_batches
ALTER TABLE classification_batches 
ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create trigger to auto-update updated_at on classification_batches
CREATE TRIGGER update_classification_batches_updated_at
  BEFORE UPDATE ON classification_batches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create performance indexes
CREATE INDEX idx_classification_batches_status 
  ON classification_batches(status);

CREATE INDEX idx_classifications_batch_status 
  ON classifications(batch_id, status);

-- Add comments for documentation
COMMENT ON COLUMN classification_batches.updated_at IS 'Automatically updated timestamp when batch record changes';
COMMENT ON INDEX idx_classification_batches_status IS 'Performance index for filtering batches by status';
COMMENT ON INDEX idx_classifications_batch_status IS 'Composite index for querying classifications by batch and status';