-- Clear all featured signals
UPDATE processed_signals 
SET is_featured = false 
WHERE is_featured = true;

-- Feature the new optimal mix for PE demo
UPDATE processed_signals 
SET is_featured = true 
WHERE id IN (
  '62f4ff77-debb-47ca-9233-5e5cc9151029',  -- LC Engineers £51.12M acquisition
  'a3030b32-58a0-4309-8676-c13a847d24ea',  -- Gridserve solar portfolio - Riverstone
  'a7024c8e-09a6-4d09-ae3b-21facf9678f8',  -- Milepost EV Charging £47.42M
  'abf51b01-d547-4e6a-aedf-d81cd820f3b4',  -- EU €90B wind exports (market)
  '9ba6071c-8ad4-4c64-9e70-b35672bbab41'   -- Germany €5B CCfD scheme (policy)
);