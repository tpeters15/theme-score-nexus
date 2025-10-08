-- Clean up old taxonomy v1.0 data
-- Deactivate old version 1 themes
UPDATE taxonomy_themes 
SET is_active = false 
WHERE version = 1;

-- Delete orphaned sectors (sectors with no active themes)
DELETE FROM taxonomy_sectors 
WHERE id NOT IN (
  SELECT DISTINCT sector_id 
  FROM taxonomy_themes 
  WHERE is_active = true
);

-- Delete orphaned pillars (pillars with no sectors)
DELETE FROM taxonomy_pillars 
WHERE id NOT IN (
  SELECT DISTINCT pillar_id 
  FROM taxonomy_sectors
);