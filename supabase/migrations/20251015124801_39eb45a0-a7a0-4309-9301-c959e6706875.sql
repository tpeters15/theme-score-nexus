-- Create a view that makes detailed scores easier to view and understand in Supabase
CREATE OR REPLACE VIEW detailed_scores_with_context AS
SELECT 
  ds.id,
  ds.theme_id,
  t.name as theme_name,
  t.sector_id,
  ds.criteria_id,
  fc.code as criteria_code,
  fc.name as criteria_name,
  fcat.code as category_code,
  fcat.name as category_name,
  ds.score,
  ds.confidence,
  ds.notes,
  ds.analyst_notes,
  ds.ai_research_data,
  ds.update_source,
  ds.updated_by,
  ds.updated_at
FROM detailed_scores ds
LEFT JOIN taxonomy_themes t ON ds.theme_id = t.id
LEFT JOIN framework_criteria fc ON ds.criteria_id = fc.id
LEFT JOIN framework_categories fcat ON fc.category_id = fcat.id
ORDER BY t.name, fcat.display_order, fc.display_order;

-- Grant select permission to authenticated users
GRANT SELECT ON detailed_scores_with_context TO authenticated;