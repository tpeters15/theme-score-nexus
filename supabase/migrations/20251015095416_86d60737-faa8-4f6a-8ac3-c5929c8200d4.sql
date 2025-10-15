
-- Update Industrial & Commercial Energy Efficiency theme with enriched metadata
UPDATE taxonomy_themes
SET 
  keywords = ARRAY[
    'EMIS', 'VPP', 'demand response', 'performance contracting', 'M&V', 'BACS',
    'HVAC optimization', 'motor efficiency', 'compressed air', 'waste heat recovery',
    'ISO 50001', 'EPC rating', 'CSRD', 'building automation', 'energy audits',
    'variable speed drives', 'heat pumps', 'submetering', 'IoT monitoring', 'ESCOs',
    'IPMVP', 'building retrofits', 'industrial process optimization', 'thermal efficiency',
    'predictive maintenance', 'smart sensors', 'real-time monitoring', 'energy analytics',
    'carbon accounting', 'green buildings', 'net zero'
  ],
  description = 'Companies developing technologies, providing software platforms, and delivering services to reduce energy consumption in commercial buildings and industrial facilities through energy management systems (EMIS), building automation and controls (BACS), industrial process optimization, demand response/VPP aggregation, and performance contracting (ESCOs). Includes SaaS platforms for monitoring and analytics, efficiency retrofit services, motor/compressed air optimization, waste heat recovery, and IoT submetering solutions. Market driven by 60% ROI-based adoption (8-12% typical savings, 2-4 year paybacks) and 40% regulatory compliance (EED/EPBD mandates, ISO 50001, MEES, CSRD reporting). Fragmented market (top-3 share ~30%) presents buy-and-build platform opportunity with 3.5x MOIC potential through rollup synergies and cross-sell. Key business models: SaaS Energy Management (70-90% GM, 25-40% growth), Efficiency Services/ESCOs (30-50% GM, 10-20% growth), Demand Response/VPP (70%+ GM, 30-50% growth), IoT Monitoring (40-60% GM, 15-30% growth).'
WHERE name = 'Industrial & Commercial Energy Efficiency';

-- Insert research document record
-- Note: The PDF file has been copied to public/research-documents/
INSERT INTO research_documents (
  theme_id,
  title,
  description,
  document_type,
  file_path,
  mime_type,
  file_size,
  created_by
)
SELECT 
  'f68542c4-647a-4ff0-b2f1-830d9ee7f99c'::uuid,
  'Industrial & Commercial Energy Efficiency - Full PE Thematic Research Report',
  'Comprehensive 50-page private equity thematic research report covering market sizing (£5.2bn TAM, £2.2bn capital-efficient), regulatory landscape (EED/EPBD/MEES/ESOS analysis), investability assessment (fragmentation, competitive dynamics, exit environment), detailed company census (gorillas, sleeping giants, platform targets), 5-year platform scenario modeling (3.5x MOIC, 28% IRR), business model archetypes (SaaS EMIS, ESCOs, VPP, IoT), red-team risk analysis, and complete framework scoring across 10 criteria. Investment recommendation: PURSUE_WITH_CAUTION (3.8/5.0 weighted score). October 2025.',
  'market_report',
  'research-documents/Industrial_Commercial_Energy_Efficiency_Full_Report.pdf',
  'application/pdf',
  NULL,
  auth.uid()
WHERE NOT EXISTS (
  SELECT 1 FROM research_documents 
  WHERE theme_id = 'f68542c4-647a-4ff0-b2f1-830d9ee7f99c'
  AND title = 'Industrial & Commercial Energy Efficiency - Full PE Thematic Research Report'
);
