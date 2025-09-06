-- Enable RLS only on the themes table (the only table that exists)
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;

-- Allow public read access to themes (internal tool)
CREATE POLICY "Allow public access to themes" ON themes
  FOR ALL USING (true);