-- First, unfeature all existing featured signals
UPDATE processed_signals 
SET is_featured = false 
WHERE is_featured = true;

-- Now feature the 5 optimal demo signals
UPDATE processed_signals 
SET is_featured = true 
WHERE id IN (
  '9ba6071c-8ad4-4c64-9e70-b35672bbab41',  -- Germany €5B CCfD scheme
  'b480caed-a9fd-4bf1-9378-cb272f6f685c',  -- French €28M retrofit software
  '8461f40d-cd20-4a35-8e57-3e6841d2d4ff',  -- Norway €1.5B ferry expansion
  '12108f88-747f-4fb0-b1e9-cd489018078c',  -- EU €99M water efficiency grant
  'abf51b01-d547-4e6a-aedf-d81cd820f3b4'   -- EU €90B wind exports
);