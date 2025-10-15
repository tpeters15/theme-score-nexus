-- Update research_documents table to reflect the complete PDF
UPDATE research_documents
SET 
  file_size = 2097152,  -- Approximate size in bytes
  updated_at = now()
WHERE theme_id = '2fa96ad6-d24d-4a75-b89a-6e1899a00693'
  AND title = 'Green Workforce & Skills - Full Investment Research Report';