-- Make research-documents bucket public so files can be viewed
UPDATE storage.buckets 
SET public = true 
WHERE id = 'research-documents';

-- Update storage policies to allow public read access for research documents
DROP POLICY IF EXISTS "Users can view research documents" ON storage.objects;

-- Create a more permissive read policy for research documents
CREATE POLICY "Public read access for research documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'research-documents');

-- Keep the existing upload policy for authenticated analysts/admins
-- (This should already exist, but let's make sure it's correct)
DROP POLICY IF EXISTS "Analysts and admins can upload research documents" ON storage.objects;

CREATE POLICY "Analysts and admins can upload research documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'research-documents' 
  AND auth.role() = 'authenticated' 
  AND (has_role(auth.uid(), 'analyst'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
);

-- Add update/delete policies for admins
CREATE POLICY "Admins can update research documents" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'research-documents' 
  AND auth.role() = 'authenticated' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can delete research documents" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'research-documents' 
  AND auth.role() = 'authenticated' 
  AND has_role(auth.uid(), 'admin'::app_role)
);