
-- Insert research document for Water Efficiency theme (without conflict handling)

INSERT INTO research_documents (
  theme_id,
  title,
  description,
  document_type,
  file_path,
  mime_type,
  file_size,
  created_at,
  updated_at
) VALUES (
  'aa637432-d6c1-47c8-94b8-2bad7e55f5d0',
  'Water Efficiency - Full PE Thematic Research Report',
  'Comprehensive 50-page research report covering market sizing (€5.6bn TAM), regulatory landscape (EU Water Reuse Regulation, Drinking Water Directive), investability assessment (100 platform targets, 15% Top 3 share), business model archetypes (utility network efficiency, precision irrigation, industrial reuse, building efficiency), and detailed framework scoring. Investment recommendation: PURSUE_WITH_CAUTION, Score 3.8/5.0. October 2025.',
  'market_report',
  'Water_Efficiency_Full_Report.pdf',
  'application/pdf',
  2847360,
  NOW(),
  NOW()
);
