-- Reset to all PitchBook deal announcements
-- Unflag current non-PitchBook signals
UPDATE processed_signals 
SET is_featured = false
WHERE id IN (
  'b480caed-a9fd-4bf1-9378-cb272f6f685c',  -- French retrofit
  'abf51b01-d547-4e6a-aedf-d81cd820f3b4',  -- EU wind exports
  '9ba6071c-8ad4-4c64-9e70-b35672bbab41'   -- Germany CCfD
);

-- Flag PitchBook deals
UPDATE processed_signals 
SET is_featured = true
WHERE id IN (
  '62f4ff77-debb-47ca-9233-5e5cc9151029',  -- LC Engineers £51.12M
  'a18f52b5-ccb3-4134-a7d5-c8f50415aa0d'   -- Energia Group £2.17B
);

-- Set display order timestamps
-- Energia Group (FIRST - £2.17B acquisition)
UPDATE processed_signals 
SET processed_timestamp = NOW() + INTERVAL '10 minutes'
WHERE id = 'a18f52b5-ccb3-4134-a7d5-c8f50415aa0d';

-- Milepost (SECOND - £47.42M growth equity)
UPDATE processed_signals 
SET processed_timestamp = NOW() + INTERVAL '8 minutes'
WHERE id = 'a7024c8e-09a6-4d09-ae3b-21facf9678f8';

-- LC Engineers (THIRD - £51.12M acquisition)
UPDATE processed_signals 
SET processed_timestamp = NOW() + INTERVAL '6 minutes'
WHERE id = '62f4ff77-debb-47ca-9233-5e5cc9151029';

-- Gridserve (FOURTH - Solar portfolio acquisition)
UPDATE processed_signals 
SET processed_timestamp = NOW() + INTERVAL '4 minutes'
WHERE id = 'a3030b32-58a0-4309-8676-c13a847d24ea';

-- Karo Healthcare (FIFTH - £2.25B acquisition)
UPDATE processed_signals 
SET is_featured = true,
processed_timestamp = NOW() + INTERVAL '2 minutes'
WHERE id = '3ca6269b-b20e-4c1d-9a8a-4d7473b01ee8';