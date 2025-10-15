-- Replace Accurec with French retrofit company €28M Series B
-- Unflag Accurec
UPDATE processed_signals 
SET is_featured = false
WHERE id = 'c96cf1de-b2bb-4479-ba0f-ffa53c606264';

-- Flag the French retrofit company
UPDATE processed_signals 
SET is_featured = true
WHERE id = 'b480caed-a9fd-4bf1-9378-cb272f6f685c';

-- Update timestamps to control display order (newest first)
-- French retrofit company (FIRST - €28M Series B, DealStreet Asia)
UPDATE processed_signals 
SET processed_timestamp = NOW() + INTERVAL '10 minutes'
WHERE id = 'b480caed-a9fd-4bf1-9378-cb272f6f685c';

-- Milepost (SECOND - £47.42M growth equity)
UPDATE processed_signals 
SET processed_timestamp = NOW() + INTERVAL '8 minutes'
WHERE id = 'a7024c8e-09a6-4d09-ae3b-21facf9678f8';

-- Gridserve (THIRD - Solar portfolio acquisition)
UPDATE processed_signals 
SET processed_timestamp = NOW() + INTERVAL '6 minutes'
WHERE id = 'a3030b32-58a0-4309-8676-c13a847d24ea';

-- EU wind exports (FOURTH)
UPDATE processed_signals 
SET processed_timestamp = NOW() + INTERVAL '4 minutes'
WHERE id = 'abf51b01-d547-4e6a-aedf-d81cd820f3b4';

-- Germany CCfD (FIFTH)
UPDATE processed_signals 
SET processed_timestamp = NOW() + INTERVAL '2 minutes'
WHERE id = '9ba6071c-8ad4-4c64-9e70-b35672bbab41';