-- Create table to map signals to themes
CREATE TABLE IF NOT EXISTS theme_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_id UUID NOT NULL REFERENCES taxonomy_themes(id) ON DELETE CASCADE,
  processed_signal_id UUID NOT NULL REFERENCES processed_signals(id) ON DELETE CASCADE,
  relevance_score NUMERIC,
  ai_analysis TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(theme_id, processed_signal_id)
);

-- Enable RLS
ALTER TABLE theme_signals ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Analysts and admins can view theme signals"
  ON theme_signals FOR SELECT
  USING (has_role(auth.uid(), 'analyst'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Analysts and admins can create theme signals"
  ON theme_signals FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'analyst'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Analysts and admins can update theme signals"
  ON theme_signals FOR UPDATE
  USING (has_role(auth.uid(), 'analyst'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete theme signals"
  ON theme_signals FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for faster lookups
CREATE INDEX idx_theme_signals_theme_id ON theme_signals(theme_id);
CREATE INDEX idx_theme_signals_relevance ON theme_signals(theme_id, relevance_score DESC);