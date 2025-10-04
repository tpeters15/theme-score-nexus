-- Update signals table to match actual workflow structure
ALTER TABLE signals
  -- Raw signal fields
  ADD COLUMN IF NOT EXISTS fingerprint text UNIQUE,
  ADD COLUMN IF NOT EXISTS scraped_date timestamp with time zone DEFAULT now(),
  ADD COLUMN IF NOT EXISTS original_content text,
  
  -- Processing fields
  ADD COLUMN IF NOT EXISTS workflow_stage text DEFAULT 'raw' 
    CHECK (workflow_stage IN ('raw', 'processed', 'memo_published')),
  ADD COLUMN IF NOT EXISTS content_snippet text,
  ADD COLUMN IF NOT EXISTS countries text[],
  ADD COLUMN IF NOT EXISTS signal_type_classified text,
  ADD COLUMN IF NOT EXISTS week_processed text,
  ADD COLUMN IF NOT EXISTS days_old_when_processed integer,
  ADD COLUMN IF NOT EXISTS extracted_deal_size text,
  ADD COLUMN IF NOT EXISTS content_length integer,
  ADD COLUMN IF NOT EXISTS has_pitchbook_data boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS processed_timestamp timestamp with time zone,
  
  -- Memo generation fields
  ADD COLUMN IF NOT EXISTS memo_section text 
    CHECK (memo_section IN ('deals', 'regulatory', 'market_and_news', 'excluded')),
  ADD COLUMN IF NOT EXISTS memo_analysis text,
  ADD COLUMN IF NOT EXISTS memo_published_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS credibility_score numeric(3,2);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_signals_fingerprint ON signals(fingerprint);
CREATE INDEX IF NOT EXISTS idx_signals_workflow_stage ON signals(workflow_stage);
CREATE INDEX IF NOT EXISTS idx_signals_week_processed ON signals(week_processed);
CREATE INDEX IF NOT EXISTS idx_signals_countries ON signals USING GIN(countries);
CREATE INDEX IF NOT EXISTS idx_signals_memo_section ON signals(memo_section);
CREATE INDEX IF NOT EXISTS idx_signals_scraped_date ON signals(scraped_date);

-- Create RSS sources configuration table
CREATE TABLE IF NOT EXISTS rss_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_name text NOT NULL,
  type text NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error')),
  feed_url text NOT NULL UNIQUE,
  title_field text,
  url_field text,
  date_field text,
  content_field text,
  author_field text,
  categories_field text,
  last_fetched_at timestamp with time zone,
  error_message text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on rss_sources
ALTER TABLE rss_sources ENABLE ROW LEVEL SECURITY;

-- RLS policies for rss_sources
CREATE POLICY "Public read access for RSS sources"
  ON rss_sources
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage RSS sources"
  ON rss_sources
  FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Create intelligence_memos table for weekly summaries
CREATE TABLE IF NOT EXISTS intelligence_memos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start_date date NOT NULL,
  week_end_date date NOT NULL,
  deals_section text,
  regulatory_section text,
  market_news_section text,
  summary text,
  signal_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  created_by uuid REFERENCES profiles(id),
  published_at timestamp with time zone,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Enable RLS on intelligence_memos
ALTER TABLE intelligence_memos ENABLE ROW LEVEL SECURITY;

-- RLS policies for intelligence_memos
CREATE POLICY "Public read access for intelligence memos"
  ON intelligence_memos
  FOR SELECT
  USING (true);

CREATE POLICY "Analysts and admins can create memos"
  ON intelligence_memos
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'analyst') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Analysts and admins can update memos"
  ON intelligence_memos
  FOR UPDATE
  USING (has_role(auth.uid(), 'analyst') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete memos"
  ON intelligence_memos
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- Create indexes for memos
CREATE INDEX IF NOT EXISTS idx_intelligence_memos_week ON intelligence_memos(week_start_date, week_end_date);
CREATE INDEX IF NOT EXISTS idx_intelligence_memos_status ON intelligence_memos(status);

-- Add helpful comments
COMMENT ON COLUMN signals.fingerprint IS 'Unique hash for deduplication of signals';
COMMENT ON COLUMN signals.workflow_stage IS 'Tracks signal through processing pipeline: raw -> processed -> memo_published';
COMMENT ON COLUMN signals.scraped_date IS 'When the signal was scraped/collected';
COMMENT ON COLUMN signals.days_old_when_processed IS 'Age of signal when it was processed';
COMMENT ON COLUMN signals.week_processed IS 'Week identifier when signal was processed (e.g., 2025-W14)';
COMMENT ON COLUMN signals.extracted_deal_size IS 'Deal size extracted from content (if applicable)';
COMMENT ON COLUMN signals.has_pitchbook_data IS 'Whether signal has associated PitchBook data';
COMMENT ON TABLE rss_sources IS 'Configuration for RSS feed sources';
COMMENT ON TABLE intelligence_memos IS 'Weekly intelligence memos compiled from processed signals';