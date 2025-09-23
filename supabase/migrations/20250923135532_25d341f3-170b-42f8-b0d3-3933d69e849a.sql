-- Allow public (anon) read access needed for ThemeProfile to display framework and scores without auth
-- Framework categories
CREATE POLICY IF NOT EXISTS "Public can view framework categories"
ON public.framework_categories
FOR SELECT
TO anon, authenticated
USING (true);

-- Framework criteria
CREATE POLICY IF NOT EXISTS "Public can view framework criteria"
ON public.framework_criteria
FOR SELECT
TO anon, authenticated
USING (true);

-- Detailed scores (read-only for public)
CREATE POLICY IF NOT EXISTS "Public can view detailed scores"
ON public.detailed_scores
FOR SELECT
TO anon, authenticated
USING (true);

-- Research documents (read-only for public)
CREATE POLICY IF NOT EXISTS "Public can view research documents (public)"
ON public.research_documents
FOR SELECT
TO anon, authenticated
USING (true);

-- Research runs (read-only for public)
CREATE POLICY IF NOT EXISTS "Public can view research runs"
ON public.n8n_research_runs
FOR SELECT
TO anon, authenticated
USING (true);
