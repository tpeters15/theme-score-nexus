-- Add Carbon Brief Daily as a source (using 'rss' as source_type since 'html' is not allowed)
INSERT INTO public.sources (
  source_name,
  source_type,
  base_url,
  check_frequency,
  status,
  scraping_config
) VALUES (
  'Carbon Brief Daily',
  'rss',
  'https://www.carbonbrief.org/daily-brief',
  'daily',
  'active',
  '{"selectors": {"date": ".dateInput", "headlines": ".dailystory .storyheading", "content": ".dailystory .storycont", "sources": ".dailystory .storycredits", "urls": ".dailystory .storycredits a"}}'::jsonb
);