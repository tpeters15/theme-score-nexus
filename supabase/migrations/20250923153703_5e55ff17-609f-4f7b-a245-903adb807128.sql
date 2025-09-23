-- Insert detailed scores for the Industrial Energy Efficiency & Optimisation theme
-- First, get the theme and criteria IDs we need

INSERT INTO detailed_scores (theme_id, criteria_id, score, confidence, notes, update_source)
SELECT 
  t.id as theme_id,
  fc.id as criteria_id,
  CASE fc.code
    WHEN 'A1' THEN 5  -- Market size and growth: High
    WHEN 'A2' THEN 3  -- Competitive dynamics: Medium
    WHEN 'B1' THEN 5  -- Business model alignment: High
    WHEN 'B2' THEN 3  -- IAP strategic fit: Medium
    WHEN 'C1' THEN 3  -- Market fragmentation: Medium
    ELSE 3  -- Default to medium score
  END as score,
  CASE fc.code
    WHEN 'A1' THEN 'High'
    WHEN 'A2' THEN 'Medium'
    WHEN 'B1' THEN 'High'
    WHEN 'B2' THEN 'Medium'
    WHEN 'C1' THEN 'Medium'
    ELSE 'Medium'
  END as confidence,
  CASE fc.code
    WHEN 'A1' THEN 'Large addressable market with strong growth drivers from regulatory pressures and efficiency mandates'
    WHEN 'A2' THEN 'Fragmented market with both software and service providers competing'
    WHEN 'B1' THEN 'Strong alignment with decarbonisation investment thesis and proven ROI models'
    WHEN 'B2' THEN 'Good fit but requires technical expertise to evaluate opportunities'
    WHEN 'C1' THEN 'Market has many players but consolidation opportunities exist'
    ELSE 'Initial assessment pending detailed analysis'
  END as notes,
  'manual' as update_source
FROM themes t
CROSS JOIN framework_criteria fc
WHERE t.name = 'Industrial Energy Efficiency & Optimisation'
  AND fc.code IN ('A1', 'A2', 'B1', 'B2', 'C1');