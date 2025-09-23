-- Drop existing restrictive policies for anon access
DROP POLICY IF EXISTS "All authenticated users can view framework" ON public.framework_categories;
DROP POLICY IF EXISTS "All authenticated users can view criteria" ON public.framework_criteria;
DROP POLICY IF EXISTS "All authenticated users can view scores" ON public.detailed_scores;
DROP POLICY IF EXISTS "All authenticated users can view research documents" ON public.research_documents;
DROP POLICY IF EXISTS "All authenticated users can view research runs" ON public.n8n_research_runs;

-- Create new policies allowing anon (public) read access for ThemeProfile display
CREATE POLICY "Public read access for framework categories"
ON public.framework_categories
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Public read access for framework criteria"
ON public.framework_criteria
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Public read access for detailed scores"
ON public.detailed_scores
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Public read access for research documents"
ON public.research_documents
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Public read access for research runs"
ON public.n8n_research_runs
FOR SELECT
TO anon, authenticated
USING (true);