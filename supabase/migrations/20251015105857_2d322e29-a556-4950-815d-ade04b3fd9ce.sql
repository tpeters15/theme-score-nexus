-- Step 6: Upload research document for Sustainable Materials & Packaging theme

INSERT INTO research_documents (
  theme_id,
  title,
  description,
  document_type,
  file_path,
  created_by,
  mime_type
) VALUES (
  'd6e00aaa-c4d2-461d-b7cb-df596ad444af',
  'Sustainable Materials & Packaging - Full PE Thematic Research Report',
  'Comprehensive 50-page research report covering market sizing (£42.0bn TAM, £4.2bn capital-efficient subset), regulatory landscape (PPWR, SUP Directive, EPR schemes), investability assessment (50 platform targets, 8% Top 3 share), business model archetypes (Digital SaaS, Traceability Software, Bio-Materials, Consulting), and detailed framework scoring. Investment recommendation: WATCH, Score 3.1/5.0. Includes red-team analysis highlighting regulatory dependency risk, weak moats, and unvalidated buyer willingness-to-pay. October 2025.',
  'market_report',
  'Sustainable_Materials_Packaging_Full_Report.pdf',
  auth.uid(),
  'application/pdf'
);