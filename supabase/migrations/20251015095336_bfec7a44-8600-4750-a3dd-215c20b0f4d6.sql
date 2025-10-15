
-- Link regulations to Industrial & Commercial Energy Efficiency theme
-- Theme ID: f68542c4-647a-4ff0-b2f1-830d9ee7f99c

-- 1. EPBD 2024 (highest impact)
INSERT INTO theme_regulations (
  theme_id,
  regulation_id,
  relevance_score,
  impact_description,
  criteria_impacts
)
SELECT 
  'f68542c4-647a-4ff0-b2f1-830d9ee7f99c'::uuid,
  id,
  5,
  'Virtually mandates energy reduction measures in large offices, factories and warehouses, significantly expanding retrofit demand. Zero-emission building stock target by 2050 drives systematic upgrades to HVAC, insulation, lighting, controls and building management systems across all commercial/industrial properties.',
  ARRAY['A1', 'A2', 'B1', 'C1', 'D1']
FROM regulations
WHERE title = 'Energy Performance of Buildings Directive (EPBD) - Directive 2024/1275'
ON CONFLICT (theme_id, regulation_id) DO UPDATE SET
  relevance_score = EXCLUDED.relevance_score,
  impact_description = EXCLUDED.impact_description,
  criteria_impacts = EXCLUDED.criteria_impacts;

-- 2. EED 2023 (highest impact)
INSERT INTO theme_regulations (
  theme_id,
  regulation_id,
  relevance_score,
  impact_description,
  criteria_impacts
)
SELECT 
  'f68542c4-647a-4ff0-b2f1-830d9ee7f99c'::uuid,
  id,
  5,
  'Requires large energy consumers (≥250 employees) to conduct mandatory 4-year audits and implement cost-effective efficiency measures, creating strong structural demand for EMIS platforms, ISO 50001 management systems, industrial motor upgrades, compressed air optimization, and process efficiency improvements. 39% savings target by 2030 with binding 1.49% annual savings obligation ensures sustained investment.',
  ARRAY['A1', 'A2', 'C1', 'D1']
FROM regulations
WHERE title = 'Energy Efficiency Directive (EED) - Directive 2023/1791'
ON CONFLICT (theme_id, regulation_id) DO UPDATE SET
  relevance_score = EXCLUDED.relevance_score,
  impact_description = EXCLUDED.impact_description,
  criteria_impacts = EXCLUDED.criteria_impacts;

-- 3. Germany Energy Efficiency Act 2023 (high regional impact)
INSERT INTO theme_regulations (
  theme_id,
  regulation_id,
  relevance_score,
  impact_description,
  criteria_impacts
)
SELECT 
  'f68542c4-647a-4ff0-b2f1-830d9ee7f99c'::uuid,
  id,
  4,
  'Creates direct obligations for German businesses and public bodies with binding 27% reduction target by 2030 and 46% by 2045, driving wave of industrial upgrades in Europe''s largest economy. Federal/state building mandates (45 TWh annual savings by 2024) and data center efficiency standards create immediate compliance-driven demand for efficiency platforms, ESCOs, and industrial optimization services.',
  ARRAY['A1', 'C1', 'D1']
FROM regulations
WHERE title = 'Energy Efficiency Act (Energieeffizienzgesetz - EnEfG)'
ON CONFLICT (theme_id, regulation_id) DO UPDATE SET
  relevance_score = EXCLUDED.relevance_score,
  impact_description = EXCLUDED.impact_description,
  criteria_impacts = EXCLUDED.criteria_impacts;

-- 4. UK MEES (moderate impact)
INSERT INTO theme_regulations (
  theme_id,
  regulation_id,
  relevance_score,
  impact_description,
  criteria_impacts
)
SELECT 
  'f68542c4-647a-4ff0-b2f1-830d9ee7f99c'::uuid,
  id,
  3,
  'Drives commercial property retrofits by landlords to meet minimum EPC E threshold, creating demand for building envelope improvements, lighting upgrades, HVAC modernization and control systems. Impact moderate and limited to rented commercial stock, but provides regulatory floor preventing deterioration of building performance.',
  ARRAY['A1', 'C1']
FROM regulations
WHERE title = 'Minimum Energy Efficiency Standards (MEES) for Commercial Properties'
ON CONFLICT (theme_id, regulation_id) DO UPDATE SET
  relevance_score = EXCLUDED.relevance_score,
  impact_description = EXCLUDED.impact_description,
  criteria_impacts = EXCLUDED.criteria_impacts;

-- 5. UK ESOS (moderate impact)
INSERT INTO theme_regulations (
  theme_id,
  regulation_id,
  relevance_score,
  impact_description,
  criteria_impacts
)
SELECT 
  'f68542c4-647a-4ff0-b2f1-830d9ee7f99c'::uuid,
  id,
  3,
  'Forces large UK enterprises to audit and identify efficiency projects every 4 years, spurring downstream implementation of quick-payback measures including LED lighting, ICT optimization, motor efficiency improvements and process controls. While audit mandate doesn''t require investment, high compliance rates drive implementation of identified low-hanging fruit opportunities.',
  ARRAY['A2', 'C1']
FROM regulations
WHERE title = 'Energy Savings Opportunity Scheme (ESOS)'
ON CONFLICT (theme_id, regulation_id) DO UPDATE SET
  relevance_score = EXCLUDED.relevance_score,
  impact_description = EXCLUDED.impact_description,
  criteria_impacts = EXCLUDED.criteria_impacts;
