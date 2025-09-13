-- Create user roles system
CREATE TYPE public.app_role AS ENUM ('admin', 'analyst');

CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create framework categories table
CREATE TABLE public.framework_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE, -- A, B, C, D, E
    description TEXT,
    weight DECIMAL(5,2) NOT NULL, -- Central weight management
    display_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create framework criteria table
CREATE TABLE public.framework_criteria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.framework_categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT NOT NULL, -- A1, A2, B1, etc.
    description TEXT,
    objective TEXT,
    weight DECIMAL(5,2) NOT NULL,
    display_order INTEGER NOT NULL,
    scoring_rubric JSONB, -- Store the 1-3-5 scoring rubric
    ai_prompt TEXT, -- Store the AI prompt for research
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(category_id, code)
);

-- Create detailed scores table
CREATE TABLE public.detailed_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    theme_id UUID REFERENCES public.themes(id) ON DELETE CASCADE,
    criteria_id UUID REFERENCES public.framework_criteria(id) ON DELETE CASCADE,
    score INTEGER CHECK (score IN (1, 3, 5)),
    confidence TEXT CHECK (confidence IN ('High', 'Medium', 'Low')),
    notes TEXT,
    ai_research_data JSONB, -- Store AI research results
    analyst_notes TEXT,
    updated_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    update_source TEXT CHECK (update_source IN ('manual', 'ai_research', 'n8n_agent')) DEFAULT 'manual',
    UNIQUE(theme_id, criteria_id)
);

-- Create research documents storage
INSERT INTO storage.buckets (id, name, public) VALUES ('research-documents', 'research-documents', false);

-- Create research documents metadata table
CREATE TABLE public.research_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    theme_id UUID REFERENCES public.themes(id) ON DELETE CASCADE,
    criteria_id UUID REFERENCES public.framework_criteria(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    document_type TEXT, -- 'ai_research', 'market_report', 'analysis', etc.
    file_path TEXT, -- Path in storage bucket
    file_size BIGINT,
    mime_type TEXT,
    n8n_agent_run_id TEXT, -- Link to n8n execution
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create n8n research runs tracking
CREATE TABLE public.n8n_research_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    theme_id UUID REFERENCES public.themes(id) ON DELETE CASCADE,
    criteria_ids UUID[], -- Array of criteria being researched
    status TEXT CHECK (status IN ('pending', 'running', 'completed', 'failed')) DEFAULT 'pending',
    webhook_url TEXT,
    n8n_execution_id TEXT,
    started_by UUID REFERENCES auth.users(id),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    results_summary JSONB
);

-- Enable RLS on all tables
ALTER TABLE public.framework_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.framework_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.detailed_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.n8n_research_runs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user roles
CREATE POLICY "Admins and analysts can view user roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (true); -- Both can see all roles

CREATE POLICY "Admins can manage user roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for framework (read-only for analysts, full access for admins)
CREATE POLICY "All authenticated users can view framework"
ON public.framework_categories
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage framework categories"
ON public.framework_categories
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "All authenticated users can view criteria"
ON public.framework_criteria
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage framework criteria"
ON public.framework_criteria
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for scores (analysts can edit, admins can do everything)
CREATE POLICY "All authenticated users can view scores"
ON public.detailed_scores
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Analysts and admins can manage scores"
ON public.detailed_scores
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'analyst') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Analysts and admins can update scores"
ON public.detailed_scores
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'analyst') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete scores"
ON public.detailed_scores
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for research documents
CREATE POLICY "All authenticated users can view research documents"
ON public.research_documents
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Analysts and admins can create documents"
ON public.research_documents
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'analyst') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Analysts and admins can update their documents"
ON public.research_documents
FOR UPDATE
TO authenticated
USING (created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete documents"
ON public.research_documents
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for n8n runs
CREATE POLICY "All authenticated users can view research runs"
ON public.n8n_research_runs
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Analysts and admins can create research runs"
ON public.n8n_research_runs
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'analyst') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update their own runs, admins can update all"
ON public.n8n_research_runs
FOR UPDATE
TO authenticated
USING (started_by = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Storage policies for research documents
CREATE POLICY "Users can view research documents"
ON storage.objects
FOR SELECT
USING (bucket_id = 'research-documents' AND auth.role() = 'authenticated');

CREATE POLICY "Analysts and admins can upload research documents"
ON storage.objects
FOR INSERT
WITH CHECK (
    bucket_id = 'research-documents' 
    AND auth.role() = 'authenticated'
    AND (public.has_role(auth.uid(), 'analyst') OR public.has_role(auth.uid(), 'admin'))
);

CREATE POLICY "Users can update their own documents, admins can update all"
ON storage.objects
FOR UPDATE
USING (
    bucket_id = 'research-documents'
    AND (owner = auth.uid() OR public.has_role(auth.uid(), 'admin'))
);

-- Insert default framework data
INSERT INTO public.framework_categories (name, code, description, weight, display_order) VALUES
('Market Attractiveness', 'A', 'Is the market large and growing fast enough to support our growth case and generate outsized returns?', 25.00, 1),
('Investability', 'B', 'Does the market provide credible investment targets and a clear path to exit?', 25.00, 2),
('Risk Profile', 'C', 'Is the growth thesis robust and resilient to external shocks?', 25.00, 3),
('Impact Potential', 'D', 'Will this theme generate meaningful environmental and social impact?', 15.00, 4),
('Fund Right to Win', 'E', 'What gives us a competitive edge to generate outsized returns in this space?', 10.00, 5);

-- Insert detailed criteria (Market Attractiveness)
INSERT INTO public.framework_criteria (category_id, name, code, description, objective, weight, display_order, scoring_rubric, ai_prompt) 
SELECT 
    fc.id,
    'Total Addressable Market (TAM)',
    'A1',
    'Market size assessment for specific thesis in Europe',
    'To ensure the overall market size for our specific thesis in Europe is large enough to support long-term growth.',
    33.33,
    1,
    '{"1": {"label": "Niche", "description": "Total TAM < €1 billion"}, "3": {"label": "Viable", "description": "Total TAM €1-5 billion"}, "5": {"label": "Expansive", "description": "Total TAM > €5 billion"}}',
    'Based on reputable sources, what is the estimated Total Addressable Market (TAM) for the specific theme in our target geographies (Europe)? The calculation must be filtered for B2B and/or asset-light focus. Cite all sources and methodologies used.'
FROM public.framework_categories fc WHERE fc.code = 'A';

INSERT INTO public.framework_criteria (category_id, name, code, description, objective, weight, display_order, scoring_rubric, ai_prompt) 
SELECT 
    fc.id,
    'Platform Revenue Potential (SOM)',
    'A2', 
    'Realistic revenue potential for a single platform company within 5-year horizon',
    'To quantify the realistic revenue potential for a single platform company within the fund''s 5-year investment horizon.',
    33.33,
    2,
    '{"1": {"label": "Constrained", "description": "< €200 million"}, "3": {"label": "Sufficient", "description": "€200-500 million"}, "5": {"label": "High Potential", "description": "> €500 million"}}',
    'Propose a bottom-up calculation formula (e.g., Number of Target Customers × Adoption Rate × Average Contract Value) and provide reasonable public estimates for the variables across Europe.'
FROM public.framework_categories fc WHERE fc.code = 'A';

INSERT INTO public.framework_criteria (category_id, name, code, description, objective, weight, display_order, scoring_rubric, ai_prompt) 
SELECT 
    fc.id,
    'Market Growth Rate (CAGR)',
    'A3',
    'Assessment of underlying growth dynamic and tailwinds for next 5 years',
    'To assess the underlying growth dynamic and tailwinds of the theme for the next 5 years.',
    33.34,
    3,
    '{"1": {"label": "Stagnant", "description": "Projected CAGR < 5%"}, "3": {"label": "Solid", "description": "Projected CAGR 5-10%"}, "5": {"label": "Rapid", "description": "Projected CAGR > 10%"}}',
    'What is the projected 5-year CAGR for this theme from multiple reputable sources? What are the primary qualitative drivers behind this growth and main risks that could slow it down?'
FROM public.framework_categories fc WHERE fc.code = 'A';

-- Add update triggers for timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_framework_categories_updated_at
    BEFORE UPDATE ON public.framework_categories
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_framework_criteria_updated_at
    BEFORE UPDATE ON public.framework_criteria
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_detailed_scores_updated_at
    BEFORE UPDATE ON public.detailed_scores
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_research_documents_updated_at
    BEFORE UPDATE ON public.research_documents
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();