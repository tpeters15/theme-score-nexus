-- Add publication_date field to signals table for tracking actual publication dates
ALTER TABLE public.signals 
ADD COLUMN IF NOT EXISTS publication_date DATE;

-- Add index for better query performance when filtering by date
CREATE INDEX IF NOT EXISTS idx_signals_publication_date ON public.signals(publication_date DESC);

-- Add index for filtering by processing status and date together
CREATE INDEX IF NOT EXISTS idx_signals_status_pub_date ON public.signals(processing_status, publication_date DESC);