-- First, set orphaned theme_id values to NULL
UPDATE research_documents
SET theme_id = NULL
WHERE theme_id IS NOT NULL
AND theme_id NOT IN (SELECT id FROM taxonomy_themes);

-- Now update the foreign key constraint
ALTER TABLE research_documents
DROP CONSTRAINT IF EXISTS research_documents_theme_id_fkey;

ALTER TABLE research_documents
ADD CONSTRAINT research_documents_theme_id_fkey
FOREIGN KEY (theme_id)
REFERENCES taxonomy_themes(id)
ON DELETE SET NULL;