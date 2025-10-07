-- Update A2 Platform Revenue Potential (SOM) scoring rubric to Option A1
UPDATE framework_criteria
SET 
  scoring_rubric = '{
    "1": {
      "label": "Constrained",
      "description": "< €100M 5-year revenue potential"
    },
    "3": {
      "label": "Sufficient",
      "description": "€100-300M 5-year revenue potential"
    },
    "5": {
      "label": "High Potential",
      "description": "> €300M 5-year revenue potential"
    }
  }'::jsonb,
  updated_at = now()
WHERE code = 'A2';