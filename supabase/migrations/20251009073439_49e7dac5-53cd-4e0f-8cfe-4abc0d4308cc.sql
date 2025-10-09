-- Reconnect orphaned detailed_scores and research_documents to current themes

-- Map old theme IDs to new theme IDs:
-- c424535e-096d-4167-9d17-f7bda652feaf (Water Treatment & Reuse Services) → 13bea98d-49c1-41d0-9891-00eaab6aa887 (Water Treatment & Reuse)
-- b4684290-52b7-431a-b3ce-05fad5e39479 (Smart Water Infrastructure & Analytics) → c78996a1-6f0b-40fe-b182-b20359576909 (Smart Water Infrastructure & Analytics)
-- c86b4e99-d6cc-4b8c-9a4c-8864d64e4d6d (Industrial Energy Efficiency) → f68542c4-647a-4ff0-b2f1-830d9ee7f99c (Industrial & Commercial Energy Efficiency)

-- Update detailed_scores to reconnect to current themes
UPDATE detailed_scores 
SET theme_id = '13bea98d-49c1-41d0-9891-00eaab6aa887'
WHERE theme_id = 'c424535e-096d-4167-9d17-f7bda652feaf';

UPDATE detailed_scores 
SET theme_id = 'c78996a1-6f0b-40fe-b182-b20359576909'
WHERE theme_id = 'b4684290-52b7-431a-b3ce-05fad5e39479';

UPDATE detailed_scores 
SET theme_id = 'f68542c4-647a-4ff0-b2f1-830d9ee7f99c'
WHERE theme_id = 'c86b4e99-d6cc-4b8c-9a4c-8864d64e4d6d';

-- Update research_documents to reconnect to current themes
UPDATE research_documents 
SET theme_id = '13bea98d-49c1-41d0-9891-00eaab6aa887'
WHERE theme_id = 'c424535e-096d-4167-9d17-f7bda652feaf';

UPDATE research_documents 
SET theme_id = 'c78996a1-6f0b-40fe-b182-b20359576909'
WHERE theme_id = 'b4684290-52b7-431a-b3ce-05fad5e39479';

UPDATE research_documents 
SET theme_id = 'f68542c4-647a-4ff0-b2f1-830d9ee7f99c'
WHERE theme_id = 'c86b4e99-d6cc-4b8c-9a4c-8864d64e4d6d';