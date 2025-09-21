-- Create regulations table
CREATE TABLE public.regulations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  jurisdiction TEXT NOT NULL, -- e.g., "EU", "US", "Global"
  regulation_type TEXT NOT NULL, -- e.g., "Directive", "Regulation", "Bill", "Executive Order"
  status TEXT NOT NULL DEFAULT 'active', -- active, proposed, draft, repealed
  impact_level TEXT NOT NULL DEFAULT 'medium', -- high, medium, low
  compliance_deadline DATE,
  effective_date DATE,
  source_url TEXT,
  analysis_url TEXT,
  key_provisions TEXT[],
  regulatory_body TEXT, -- e.g., "European Commission", "SEC", "EPA"
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create theme_regulations junction table for many-to-many relationship
CREATE TABLE public.theme_regulations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  theme_id UUID NOT NULL,
  regulation_id UUID NOT NULL,
  relevance_score INTEGER CHECK (relevance_score >= 1 AND relevance_score <= 5), -- 1-5 relevance
  impact_description TEXT,
  criteria_impacts TEXT[], -- array of criteria codes this regulation impacts
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(theme_id, regulation_id)
);

-- Enable RLS
ALTER TABLE public.regulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.theme_regulations ENABLE ROW LEVEL SECURITY;

-- Create policies for regulations
CREATE POLICY "All authenticated users can view regulations" 
ON public.regulations 
FOR SELECT 
USING (true);

CREATE POLICY "Analysts and admins can manage regulations" 
ON public.regulations 
FOR ALL 
USING (has_role(auth.uid(), 'analyst'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Create policies for theme_regulations
CREATE POLICY "All authenticated users can view theme regulations" 
ON public.theme_regulations 
FOR SELECT 
USING (true);

CREATE POLICY "Analysts and admins can manage theme regulations" 
ON public.theme_regulations 
FOR ALL 
USING (has_role(auth.uid(), 'analyst'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_regulations_updated_at
BEFORE UPDATE ON public.regulations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_theme_regulations_updated_at
BEFORE UPDATE ON public.theme_regulations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample regulatory data for the current theme
INSERT INTO public.regulations (title, description, jurisdiction, regulation_type, status, impact_level, compliance_deadline, effective_date, source_url, analysis_url, regulatory_body, key_provisions) VALUES
('EU AI Act', 'Comprehensive regulation on artificial intelligence systems with risk-based approach', 'EU', 'Regulation', 'active', 'high', '2025-08-02', '2024-08-01', 'https://eur-lex.europa.eu/eli/reg/2024/1689/oj', 'https://example.com/ai-act-analysis', 'European Commission', ARRAY['Risk categorization of AI systems', 'Prohibited AI practices', 'High-risk AI system requirements', 'Transparency obligations']),
('California Privacy Rights Act', 'Enhanced consumer privacy protections and data rights', 'US-CA', 'Act', 'active', 'high', '2023-01-01', '2023-01-01', 'https://oag.ca.gov/privacy/ccpa', 'https://example.com/cpra-analysis', 'California Attorney General', ARRAY['Consumer data rights', 'Sensitive personal information protections', 'Data minimization requirements', 'Third-party risk assessments']),
('Digital Services Act', 'Rules for digital services and online platforms in the EU', 'EU', 'Regulation', 'active', 'medium', '2024-02-17', '2024-02-17', 'https://eur-lex.europa.eu/eli/reg/2022/2065/oj', 'https://example.com/dsa-analysis', 'European Commission', ARRAY['Platform transparency requirements', 'Content moderation obligations', 'Risk assessment for large platforms', 'Illegal content removal']);

-- Link regulations to the current theme (using the theme ID from the URL)
INSERT INTO public.theme_regulations (theme_id, regulation_id, relevance_score, impact_description, criteria_impacts)
SELECT 
  '53128438-318c-4212-ad40-f69bcd42e4c6'::uuid,
  r.id,
  CASE 
    WHEN r.title LIKE '%AI%' THEN 5
    WHEN r.title LIKE '%Privacy%' THEN 4
    ELSE 3
  END,
  CASE 
    WHEN r.title LIKE '%AI%' THEN 'Direct impact on AI technology development and deployment'
    WHEN r.title LIKE '%Privacy%' THEN 'Affects data handling and privacy compliance requirements'
    ELSE 'General regulatory compliance considerations'
  END,
  ARRAY['governance', 'technology', 'market']
FROM public.regulations r;