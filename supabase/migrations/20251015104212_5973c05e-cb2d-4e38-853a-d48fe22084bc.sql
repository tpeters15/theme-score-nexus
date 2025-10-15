
-- Link regulations to Water Efficiency theme with relevance scores and impact descriptions

INSERT INTO theme_regulations (
  theme_id,
  regulation_id,
  relevance_score,
  impact_description,
  criteria_impacts
) VALUES
-- EU Water Reuse Regulation
(
  'aa637432-d6c1-47c8-94b8-2bad7e55f5d0',
  'e6302e2d-283d-4bb2-9120-e5b4814a3d10',
  5,
  'Directly expands addressable market by establishing minimum standards for water reuse, creating demand for treatment technology, monitoring systems, and compliance services across agriculture and industrial sectors. Effective June 2023, this regulation drives investment in reclaimed water infrastructure and quality assurance platforms.',
  ARRAY['A1', 'A2', 'C1', 'D1']
),
-- EU Drinking Water Directive
(
  'aa637432-d6c1-47c8-94b8-2bad7e55f5d0',
  '168af0c3-84b7-424c-bc08-218c74791ae4',
  5,
  'Mandates leakage assessments by 2026 and establishes path to binding EU-level reduction targets by 2028, driving utility investment in leak detection, pressure management, and smart metering infrastructure—core water efficiency solutions. Creates non-discretionary demand for network monitoring and analytics platforms.',
  ARRAY['A1', 'A2', 'B1', 'C1', 'D1']
),
-- EU Water Framework Directive
(
  'aa637432-d6c1-47c8-94b8-2bad7e55f5d0',
  '8fb49cf8-0437-4894-9093-5184b6ad5fce',
  4,
  'Sets overarching framework for sustainable water management and good ecological status, creating policy foundation that supports efficiency investments and abstraction reduction across all sectors. While not prescriptive on specific efficiency measures, establishes the "polluter pays" and "water pricing" principles that underpin ROI-driven efficiency adoption.',
  ARRAY['A1', 'C1']
),
-- UK Building Regulations Part G
(
  'aa637432-d6c1-47c8-94b8-2bad7e55f5d0',
  'e9bed544-f03c-413c-9209-638a21d6c866',
  3,
  'Establishes mandatory water efficiency standards for new buildings (125 l/p/d maximum, 110 l/p/d optional tighter), driving demand for efficient fixtures, greywater systems, and smart metering in residential and commercial construction. Consultation ongoing for 2025-2027 updates may tighten requirements further, expanding retrofit market opportunity.',
  ARRAY['A1', 'C1', 'D1']
),
-- CSRD
(
  'aa637432-d6c1-47c8-94b8-2bad7e55f5d0',
  '9afd16c6-fd9a-46d8-b571-433e0ab73b59',
  3,
  'Requires large enterprises to disclose water use and risks under mandatory ESG reporting (phased 2024-2026), creating demand for water auditing services, monitoring platforms, and efficiency consulting to demonstrate compliance and performance improvement. Particularly relevant for industrial and agricultural water efficiency solutions serving multinational corporations.',
  ARRAY['A2', 'D1']
)
ON CONFLICT (theme_id, regulation_id) DO UPDATE SET
  relevance_score = EXCLUDED.relevance_score,
  impact_description = EXCLUDED.impact_description,
  criteria_impacts = EXCLUDED.criteria_impacts,
  updated_at = NOW();
