-- ============================================
-- Universal Scraper System Migration
-- ============================================

-- Source configurations table
CREATE TABLE IF NOT EXISTS public.scraper_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  source_type TEXT NOT NULL CHECK (source_type IN ('rss', 'html_simple', 'html_ai', 'api')),
  url TEXT NOT NULL,
  schedule_cron TEXT DEFAULT '0 */6 * * *', -- Every 6 hours by default
  is_active BOOLEAN DEFAULT true,

  -- Scraping configuration
  config JSONB DEFAULT '{}'::jsonb, -- Flexible config per source type

  -- AI extraction (for html_ai type)
  extraction_prompt TEXT,
  expected_schema JSONB, -- JSON schema for validation

  -- Parsing rules (for html_simple type)
  selectors JSONB, -- CSS selectors: {"title": ".headline", "body": ".content"}

  -- Deduplication settings
  dedup_field TEXT DEFAULT 'url', -- Which field to use for dedup
  dedup_window_hours INTEGER DEFAULT 720, -- 30 days

  -- Metadata
  last_scraped_at TIMESTAMPTZ,
  last_success_at TIMESTAMPTZ,
  last_error TEXT,
  total_signals_collected INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Scraping runs table (for monitoring)
CREATE TABLE IF NOT EXISTS public.scraper_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES public.scraper_sources(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('running', 'completed', 'failed', 'partial')),

  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,

  signals_found INTEGER DEFAULT 0,
  signals_new INTEGER DEFAULT 0,
  signals_duplicate INTEGER DEFAULT 0,

  error_message TEXT,
  execution_time_seconds NUMERIC,

  -- Store raw data for debugging
  raw_data JSONB,

  created_at TIMESTAMPTZ DEFAULT now()
);

-- Scraped content cache (optional, for debugging)
CREATE TABLE IF NOT EXISTS public.scraper_content_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES public.scraper_sources(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  content_hash TEXT NOT NULL, -- MD5 of content
  raw_html TEXT,
  raw_markdown TEXT,
  scraped_at TIMESTAMPTZ DEFAULT now(),

  -- Auto-cleanup old cache after 7 days
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '7 days')
);

-- Indexes
CREATE INDEX idx_scraper_sources_active ON public.scraper_sources(is_active) WHERE is_active = true;
CREATE INDEX idx_scraper_sources_next_run ON public.scraper_sources(last_scraped_at);
CREATE INDEX idx_scraper_runs_source ON public.scraper_runs(source_id, created_at DESC);
CREATE INDEX idx_scraper_cache_expires ON public.scraper_content_cache(expires_at);

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_scraper_sources_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_scraper_sources_updated_at
BEFORE UPDATE ON public.scraper_sources
FOR EACH ROW EXECUTE FUNCTION update_scraper_sources_timestamp();

-- RLS Policies
ALTER TABLE public.scraper_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scraper_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scraper_content_cache ENABLE ROW LEVEL SECURITY;

-- Public read for sources (for frontend display)
CREATE POLICY "Public read scraper sources" ON public.scraper_sources FOR SELECT USING (true);

-- Analysts can manage sources
CREATE POLICY "Analysts manage scraper sources" ON public.scraper_sources
FOR ALL USING (has_role(auth.uid(), 'analyst'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Public read for runs (monitoring)
CREATE POLICY "Public read scraper runs" ON public.scraper_runs FOR SELECT USING (true);

-- Service role can insert runs
CREATE POLICY "Service insert scraper runs" ON public.scraper_runs FOR INSERT WITH CHECK (true);

-- Cache is service-only
CREATE POLICY "Service manage cache" ON public.scraper_content_cache FOR ALL USING (true);

-- ============================================
-- Seed Example Configurations
-- ============================================

INSERT INTO public.scraper_sources (name, source_type, url, schedule_cron, extraction_prompt, expected_schema, config) VALUES

-- RSS Feeds (Easy)
('Bloomberg Green RSS', 'rss', 'https://www.bloomberg.com/green/rss', '0 */2 * * *', NULL, NULL,
  '{"author_field": "author", "category_mapping": {"energy": "Energy", "policy": "Policy"}}'::jsonb
),

-- HTML with CSS Selectors (Medium)
('IEA News Page', 'html_simple', 'https://www.iea.org/news', '0 8 * * *', NULL, NULL,
  '{"list_selector": ".m-article-list__item", "item_selectors": {"title": ".m-article-list__title", "url": ".m-article-list__link@href", "date": ".m-article-list__date", "description": ".m-article-list__excerpt"}}'::jsonb
),

-- AI-Powered Extraction (Hard - Carbon Brief Daily)
('Carbon Brief Daily - News', 'html_ai', 'https://www.carbonbrief.org/daily-brief/', '0 9 * * *',
  'Extract news signals from the NEWS section only.

For each story, extract:
- title: Main headline (not the source publication)
- source: Original publication (e.g., "Financial Times", "Reuters")
- source_url: Link to the original article (not Carbon Brief)
- summary: 2-3 sentence summary of the story
- category: One of [policy, research, technology, market, climate_event]
- entities: {"people": [], "organizations": [], "locations": []}
- published_date: Best guess from context (format: YYYY-MM-DD)

IMPORTANT:
- Each story may have a main article link AND additional related links in a "MORE ON" section
- Extract the MAIN story as one signal
- Skip "MORE ON" links unless they are substantial new stories
- Ignore navigation elements, ads, and "Read Article" buttons

Return ONLY valid JSON array.',
  '{"type": "array", "items": {"type": "object", "required": ["title", "source", "source_url", "summary"], "properties": {"title": {"type": "string"}, "source": {"type": "string"}, "source_url": {"type": "string", "format": "uri"}, "summary": {"type": "string"}, "category": {"type": "string", "enum": ["policy", "research", "technology", "market", "climate_event"]}, "entities": {"type": "object"}, "published_date": {"type": "string", "format": "date"}}}}'::jsonb,
  '{"section_selector": ".news-section", "use_firecrawl": true, "firecrawl_options": {"onlyMainContent": true, "formats": ["markdown", "html"]}}'::jsonb
);

-- ============================================
-- Utility Functions
-- ============================================

-- Get sources that need scraping
CREATE OR REPLACE FUNCTION public.get_sources_to_scrape()
RETURNS TABLE (
  id UUID,
  name TEXT,
  source_type TEXT,
  url TEXT,
  config JSONB,
  extraction_prompt TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.name,
    s.source_type,
    s.url,
    s.config,
    s.extraction_prompt
  FROM public.scraper_sources s
  WHERE s.is_active = true
    AND (
      s.last_scraped_at IS NULL
      OR s.last_scraped_at < (now() - (s.schedule_cron || ' hours')::INTERVAL)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update scraper stats
CREATE OR REPLACE FUNCTION public.update_scraper_stats(
  p_source_id UUID,
  p_run_id UUID,
  p_status TEXT,
  p_signals_new INTEGER,
  p_signals_duplicate INTEGER,
  p_error_message TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  -- Update source
  UPDATE public.scraper_sources
  SET
    last_scraped_at = now(),
    last_success_at = CASE WHEN p_status = 'completed' THEN now() ELSE last_success_at END,
    last_error = p_error_message,
    total_signals_collected = total_signals_collected + p_signals_new
  WHERE id = p_source_id;

  -- Update run
  UPDATE public.scraper_runs
  SET
    status = p_status,
    completed_at = now(),
    signals_new = p_signals_new,
    signals_duplicate = p_signals_duplicate,
    error_message = p_error_message,
    execution_time_seconds = EXTRACT(EPOCH FROM (now() - started_at))
  WHERE id = p_run_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE public.scraper_sources IS 'Configuration for all scraping sources';
COMMENT ON TABLE public.scraper_runs IS 'Execution history and monitoring for scraper runs';
COMMENT ON TABLE public.scraper_content_cache IS 'Temporary cache of scraped content for debugging';
