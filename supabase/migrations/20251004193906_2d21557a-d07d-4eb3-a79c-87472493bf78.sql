-- Create classification_batches table
CREATE TABLE public.classification_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  batch_name TEXT NOT NULL,
  status TEXT DEFAULT 'Processing' NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  company_count INTEGER
);

-- Create companies table with unique website_domain
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  company_name TEXT,
  website_domain TEXT UNIQUE NOT NULL,
  description TEXT,
  dealcloud_id TEXT
);

-- Create classifications table
CREATE TABLE public.classifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  company_id UUID REFERENCES public.companies(id) NOT NULL,
  batch_id UUID REFERENCES public.classification_batches(id) NOT NULL,
  status TEXT DEFAULT 'Queued' NOT NULL,
  primary_theme TEXT,
  confidence_score NUMERIC,
  rationale TEXT
);

-- Enable RLS
ALTER TABLE public.classification_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for classification_batches
CREATE POLICY "Users can view their own batches"
  ON public.classification_batches
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own batches"
  ON public.classification_batches
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own batches"
  ON public.classification_batches
  FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for companies (shared resource, readable by all authenticated users)
CREATE POLICY "Authenticated users can view companies"
  ON public.companies
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create companies"
  ON public.companies
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies for classifications (users see classifications from their batches)
CREATE POLICY "Users can view classifications from their batches"
  ON public.classifications
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.classification_batches
      WHERE id = batch_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create classifications"
  ON public.classifications
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update classifications"
  ON public.classifications
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Create indexes for better query performance
CREATE INDEX idx_classification_batches_user_id ON public.classification_batches(user_id);
CREATE INDEX idx_classifications_batch_id ON public.classifications(batch_id);
CREATE INDEX idx_classifications_company_id ON public.classifications(company_id);
CREATE INDEX idx_companies_website_domain ON public.companies(website_domain);