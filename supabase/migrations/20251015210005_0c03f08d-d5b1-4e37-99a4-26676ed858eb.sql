-- Update market_maturity check constraint to match actual terminology
-- First, drop the old constraint
ALTER TABLE taxonomy_themes DROP CONSTRAINT IF EXISTS taxonomy_themes_market_maturity_check;

-- Update any existing data to match new terminology
UPDATE taxonomy_themes 
SET market_maturity = CASE 
  WHEN market_maturity = 'Emerging' THEN 'Early'
  WHEN market_maturity = 'Growth' THEN 'Transitioning'
  WHEN market_maturity = 'Mature' THEN 'Mature'
  WHEN market_maturity = 'Declining' THEN 'Mature'
  ELSE market_maturity
END
WHERE market_maturity IS NOT NULL;

-- Add new constraint with correct values
ALTER TABLE taxonomy_themes 
ADD CONSTRAINT taxonomy_themes_market_maturity_check 
CHECK (market_maturity = ANY (ARRAY['Early'::text, 'Transitioning'::text, 'Mature'::text]));