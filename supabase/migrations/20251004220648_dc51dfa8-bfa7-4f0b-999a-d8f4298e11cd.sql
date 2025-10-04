-- Step 1: Create unified sources table
CREATE TABLE IF NOT EXISTS sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_name text NOT NULL,
  source_type text NOT NULL CHECK (source_type IN ('rss', 'iea', 'api', 'scraper', 'manual')),
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error')),
  
  -- Connection config
  base_url text,
  feed_url text,
  api_endpoint text,
  
  -- Field mappings (for flexible sources)
  field_mappings jsonb DEFAULT '{}'::jsonb,
  scraping_config jsonb DEFAULT '{}'::jsonb,
  
  -- Monitoring
  check_frequency text DEFAULT 'daily' CHECK (check_frequency IN ('hourly', 'daily', 'weekly', 'manual')),
  last_checked_at timestamp with time zone,
  last_success_at timestamp with time zone,
  error_message text,
  
  -- Metadata
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid REFERENCES profiles(id)
);

-- Step 2: Create raw_signals table (immutable scraped data)
CREATE TABLE IF NOT EXISTS raw_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identifiers & deduplication
  signal_id text NOT NULL UNIQUE,
  fingerprint text UNIQUE,
  original_id text,
  
  -- Core content
  url text,
  title text NOT NULL,
  raw_content text,
  description text,
  
  -- Source info
  source_id uuid REFERENCES sources(id) ON DELETE SET NULL,
  source text NOT NULL,
  source_type text,
  author text,
  
  -- Dates
  publication_date date,
  scraped_date timestamp with time zone DEFAULT now(),
  
  -- Metadata
  file_path text,
  document_url text,
  created_at timestamp with time zone DEFAULT now()
);

-- Step 3: Create processed_signals table (derived/analyzed data)
CREATE TABLE IF NOT EXISTS processed_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  raw_signal_id uuid NOT NULL REFERENCES raw_signals(id) ON DELETE CASCADE,
  
  -- Classification
  signal_type_classified text,
  countries text[],
  content_snippet text,
  
  -- Processing metadata
  week_processed text,
  days_old_when_processed integer,
  content_length integer,
  credibility_score numeric(3,2),
  
  -- Deal-specific
  extracted_deal_size text,
  has_pitchbook_data boolean DEFAULT false,
  
  -- Memo generation
  memo_section text CHECK (memo_section IN ('deals', 'regulatory', 'market_and_news', 'excluded')),
  memo_analysis text,
  memo_published_at timestamp with time zone,
  
  -- Analysis metadata
  analysis_priority integer DEFAULT 0,
  processed_timestamp timestamp with time zone DEFAULT now(),
  processed_by uuid REFERENCES profiles(id),
  
  -- Ensure one processing record per raw signal
  UNIQUE(raw_signal_id)
);

-- Step 4: Migrate existing data from source_monitors to sources
INSERT INTO sources (
  id, source_name, source_type, status, base_url, 
  scraping_config, check_frequency, last_checked_at, created_at, updated_at
)
SELECT 
  id, source_name, 
  CASE 
    WHEN source_type = 'iea' THEN 'iea'::text
    ELSE 'scraper'::text
  END,
  status, base_url, scraping_config, check_frequency, 
  last_checked_at, created_at, updated_at
FROM source_monitors
ON CONFLICT (id) DO NOTHING;

-- Step 5: Migrate existing signals to raw_signals
INSERT INTO raw_signals (
  id, signal_id, url, title, raw_content, description,
  source, source_type, author, publication_date, 
  scraped_date, document_url, file_path, created_at
)
SELECT 
  id, signal_id, url, title, raw_content, description,
  source, type, author, publication_date,
  COALESCE(scraped_date, created_at), document_url, file_path, created_at
FROM signals
ON CONFLICT (signal_id) DO NOTHING;

-- Step 6: Create processed records for signals that have been analyzed
INSERT INTO processed_signals (
  raw_signal_id, signal_type_classified, countries, content_snippet,
  week_processed, days_old_when_processed, content_length, credibility_score,
  extracted_deal_size, has_pitchbook_data, memo_section, memo_analysis,
  memo_published_at, analysis_priority, processed_timestamp
)
SELECT 
  rs.id, s.signal_type_classified, s.countries, s.content_snippet,
  s.week_processed, s.days_old_when_processed, s.content_length, s.credibility_score,
  s.extracted_deal_size, s.has_pitchbook_data, s.memo_section, s.memo_analysis,
  s.memo_published_at, s.analysis_priority, 
  COALESCE(s.processed_timestamp, s.updated_at)
FROM signals s
JOIN raw_signals rs ON rs.signal_id = s.signal_id
WHERE s.workflow_stage IN ('processed', 'memo_published')
ON CONFLICT (raw_signal_id) DO NOTHING;

-- Step 7: Enable RLS on new tables
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE raw_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE processed_signals ENABLE ROW LEVEL SECURITY;

-- Step 8: RLS Policies for sources
CREATE POLICY "Public read access for sources"
  ON sources FOR SELECT USING (true);

CREATE POLICY "Admins can manage sources"
  ON sources FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Step 9: RLS Policies for raw_signals
CREATE POLICY "Public read access for raw signals"
  ON raw_signals FOR SELECT USING (true);

CREATE POLICY "Analysts and admins can create raw signals"
  ON raw_signals FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'analyst') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update raw signals"
  ON raw_signals FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete raw signals"
  ON raw_signals FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- Step 10: RLS Policies for processed_signals
CREATE POLICY "Public read access for processed signals"
  ON processed_signals FOR SELECT USING (true);

CREATE POLICY "Analysts and admins can process signals"
  ON processed_signals FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'analyst') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Analysts and admins can update processed signals"
  ON processed_signals FOR UPDATE
  USING (has_role(auth.uid(), 'analyst') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete processed signals"
  ON processed_signals FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- Step 11: Create indexes for performance
CREATE INDEX idx_raw_signals_fingerprint ON raw_signals(fingerprint);
CREATE INDEX idx_raw_signals_source_id ON raw_signals(source_id);
CREATE INDEX idx_raw_signals_scraped_date ON raw_signals(scraped_date);
CREATE INDEX idx_raw_signals_publication_date ON raw_signals(publication_date);

CREATE INDEX idx_processed_signals_raw_signal ON processed_signals(raw_signal_id);
CREATE INDEX idx_processed_signals_week ON processed_signals(week_processed);
CREATE INDEX idx_processed_signals_memo_section ON processed_signals(memo_section);
CREATE INDEX idx_processed_signals_countries ON processed_signals USING GIN(countries);

CREATE INDEX idx_sources_type_status ON sources(source_type, status);
CREATE INDEX idx_sources_last_checked ON sources(last_checked_at);

-- Step 12: Drop old tables
DROP TABLE IF EXISTS rss_sources CASCADE;
DROP TABLE IF EXISTS source_monitors CASCADE;
DROP TABLE IF EXISTS content_snapshots CASCADE;

-- Note: Keep signals table for now as backup, can drop manually later after verification
-- DROP TABLE IF EXISTS signals CASCADE;

-- Step 13: Add helpful comments
COMMENT ON TABLE sources IS 'Unified source configuration for all signal collection methods';
COMMENT ON TABLE raw_signals IS 'Immutable raw signals as scraped/collected';
COMMENT ON TABLE processed_signals IS 'Processed and analyzed signal data';

COMMENT ON COLUMN raw_signals.fingerprint IS 'Content hash for deduplication';
COMMENT ON COLUMN processed_signals.week_processed IS 'Week identifier (e.g., 2025-W14)';
COMMENT ON COLUMN processed_signals.credibility_score IS 'Source credibility (0.0-1.0)';