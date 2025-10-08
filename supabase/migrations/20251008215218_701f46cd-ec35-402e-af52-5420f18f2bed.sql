-- Add UPDATE policy for companies table to allow upsert operations
CREATE POLICY "Authenticated users can update companies"
ON companies
FOR UPDATE
TO authenticated
USING (auth.role() = 'authenticated'::text);