-- Move A4 (Market Maturity) from category B to category A
UPDATE framework_criteria 
SET category_id = 'a5784c01-5e06-44bd-833b-7aec02b692e2'
WHERE code = 'A4';

-- Move C3 criteria if it exists (Macro Sensitivity should be in C, not D)
-- First find if there's a C3 criteria
UPDATE framework_criteria 
SET code = 'C3', 
    name = 'Macro Sensitivity',
    category_id = '60a664d3-fff7-40ab-ad29-f92e28a91e22'
WHERE code = 'D2';

-- Delete old D1 criteria (Market Timing & Adoption Risk - this overlaps with C2)
DELETE FROM detailed_scores WHERE criteria_id = '81a53b4d-5a36-458b-a50a-605f948e61d9';
DELETE FROM framework_criteria WHERE id = '81a53b4d-5a36-458b-a50a-605f948e61d9';

-- Delete categories D, E, F (after removing their criteria)
DELETE FROM detailed_scores WHERE criteria_id IN (
  SELECT id FROM framework_criteria WHERE category_id IN (
    SELECT id FROM framework_categories WHERE code IN ('E', 'F')
  )
);
DELETE FROM framework_criteria WHERE category_id IN (
  SELECT id FROM framework_categories WHERE code IN ('E', 'F')
);
DELETE FROM framework_categories WHERE code IN ('D', 'E', 'F');