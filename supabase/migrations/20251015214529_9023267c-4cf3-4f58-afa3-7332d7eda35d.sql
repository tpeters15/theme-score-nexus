-- Update timestamps to control display order (newest first)
UPDATE processed_signals 
SET processed_timestamp = NOW() + INTERVAL '5 minutes'
WHERE id = 'c96cf1de-b2bb-4479-ba0f-ffa53c606264';  -- Accurec (first)

UPDATE processed_signals 
SET processed_timestamp = NOW() + INTERVAL '4 minutes'
WHERE id = 'a7024c8e-09a6-4d09-ae3b-21facf9678f8';  -- Milepost (second)

UPDATE processed_signals 
SET processed_timestamp = NOW() + INTERVAL '3 minutes'
WHERE id = 'a3030b32-58a0-4309-8676-c13a847d24ea';  -- Gridserve (third)

UPDATE processed_signals 
SET processed_timestamp = NOW() + INTERVAL '2 minutes'
WHERE id = 'abf51b01-d547-4e6a-aedf-d81cd820f3b4';  -- EU exports (fourth)

UPDATE processed_signals 
SET processed_timestamp = NOW() + INTERVAL '1 minute'
WHERE id = '9ba6071c-8ad4-4c64-9e70-b35672bbab41';  -- Germany CCfD (fifth)