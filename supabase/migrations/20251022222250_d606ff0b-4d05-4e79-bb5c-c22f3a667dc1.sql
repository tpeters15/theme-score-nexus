-- Drop n8n research runs table
DROP TABLE IF EXISTS public.n8n_research_runs;

-- Remove n8n_agent_run_id column from research_documents (optional cleanup)
ALTER TABLE public.research_documents DROP COLUMN IF EXISTS n8n_agent_run_id;