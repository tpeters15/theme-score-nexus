-- Enable RLS on all tables
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE score_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_documents ENABLE ROW LEVEL SECURITY;

-- For now, allow public read access since this is an internal tool
-- In the future when auth is added, these policies can be restricted

-- Allow reading themes for everyone
CREATE POLICY "Allow public read access to themes" ON themes
  FOR SELECT USING (true);

-- Allow reading attributes for everyone  
CREATE POLICY "Allow public read access to attributes" ON attributes
  FOR SELECT USING (true);

-- Allow all operations on scores for everyone (for now)
CREATE POLICY "Allow public access to scores" ON scores
  FOR ALL USING (true);

-- Allow all operations on score_history for everyone (for now)
CREATE POLICY "Allow public access to score_history" ON score_history
  FOR ALL USING (true);

-- Allow all operations on evidence_documents for everyone (for now)
CREATE POLICY "Allow public access to evidence_documents" ON evidence_documents
  FOR ALL USING (true);