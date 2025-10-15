-- Add market intelligence columns to taxonomy_themes
ALTER TABLE taxonomy_themes
ADD COLUMN tam_value numeric,
ADD COLUMN tam_currency text DEFAULT 'GBP',
ADD COLUMN cagr_percentage numeric,
ADD COLUMN cagr_period_start integer,
ADD COLUMN cagr_period_end integer,
ADD COLUMN market_maturity text CHECK (market_maturity IN ('Emerging', 'Growth', 'Mature', 'Declining'));