-- Create source_monitors table to track IEA pages
CREATE TABLE IF NOT EXISTS public.source_monitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_name TEXT NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'iea',
  base_url TEXT NOT NULL,
  scraping_config JSONB DEFAULT '{}',
  check_frequency TEXT NOT NULL DEFAULT 'daily',
  last_checked_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create content_snapshots table to detect changes
CREATE TABLE IF NOT EXISTS public.content_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_monitor_id UUID REFERENCES public.source_monitors(id) ON DELETE CASCADE,
  content_hash TEXT NOT NULL,
  discovered_urls JSONB DEFAULT '[]',
  checked_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enhance signals table with processing fields
ALTER TABLE public.signals 
ADD COLUMN IF NOT EXISTS processing_status TEXT DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS document_url TEXT,
ADD COLUMN IF NOT EXISTS raw_content TEXT,
ADD COLUMN IF NOT EXISTS file_path TEXT,
ADD COLUMN IF NOT EXISTS analysis_priority INTEGER DEFAULT 0;

-- Create enum-like constraint for processing_status
ALTER TABLE public.signals DROP CONSTRAINT IF EXISTS signals_processing_status_check;
ALTER TABLE public.signals ADD CONSTRAINT signals_processing_status_check 
CHECK (processing_status IN ('manual', 'discovered', 'downloading', 'analyzing', 'ready_for_review', 'reviewed', 'applied'));

-- Enable RLS on new tables
ALTER TABLE public.source_monitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_snapshots ENABLE ROW LEVEL SECURITY;

-- RLS policies for source_monitors
CREATE POLICY "Public read access for source monitors"
ON public.source_monitors FOR SELECT
TO public
USING (true);

CREATE POLICY "Admins can manage source monitors"
ON public.source_monitors FOR ALL
TO public
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for content_snapshots
CREATE POLICY "Public read access for content snapshots"
ON public.content_snapshots FOR SELECT
TO public
USING (true);

CREATE POLICY "Admins can manage content snapshots"
ON public.content_snapshots FOR ALL
TO public
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_source_monitors_status ON public.source_monitors(status);
CREATE INDEX IF NOT EXISTS idx_content_snapshots_monitor ON public.content_snapshots(source_monitor_id);
CREATE INDEX IF NOT EXISTS idx_signals_processing_status ON public.signals(processing_status);

-- Add trigger for updated_at on source_monitors
CREATE TRIGGER update_source_monitors_updated_at
BEFORE UPDATE ON public.source_monitors
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial IEA source monitors
INSERT INTO public.source_monitors (source_name, base_url, scraping_config, check_frequency)
VALUES 
  ('IEA Reports', 'https://www.iea.org/analysis?type=report', 
   '{"selectors": {"title": ".article-title", "date": ".article-date", "url": "a[href*=\"/reports/\"]"}}', 
   'daily'),
  ('IEA News', 'https://www.iea.org/news', 
   '{"selectors": {"title": ".article-title", "date": ".article-date", "url": "a[href*=\"/news/\"]"}}', 
   'daily')
ON CONFLICT DO NOTHING;