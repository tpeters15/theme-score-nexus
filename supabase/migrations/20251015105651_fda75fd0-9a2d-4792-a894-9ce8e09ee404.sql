-- Step 2: Link regulations to Sustainable Materials & Packaging theme

INSERT INTO theme_regulations (
  theme_id,
  regulation_id,
  relevance_score,
  impact_description,
  criteria_impacts
) VALUES
(
  'd6e00aaa-c4d2-461d-b7cb-df596ad444af',
  '725aa511-b9bd-40b4-b3da-04734bd17f8e',
  5,
  'Core policy driver creating binding demand across all packaging segments. PPWR mandates 65-70% recycling by 2030, 90% beverage container collection by 2029, and minimum recycled content (10-70% by material). Directly expands TAM for sustainable materials, SaaS compliance tools, design-for-recycling services, and reuse systems. Primary catalyst for 60% compliance-driven demand cited in investment thesis.',
  ARRAY['A1', 'A2', 'A3', 'B1', 'C1', 'C2']
),
(
  'd6e00aaa-c4d2-461d-b7cb-df596ad444af',
  'cbbd272d-0bcd-4818-850e-16ee9b58a03b',
  5,
  'Eliminates single-use plastic markets (polystyrene plates, cups, containers) forcing substitution to bio-materials, fiber, and reusables. Bottle cap attachment rules and 90% plastic bottle collection target by 2029 drive innovation in packaging design and reverse logistics. Accelerates shift away from commodity plastics toward sustainable alternatives with higher margins.',
  ARRAY['A1', 'A2', 'C1', 'C2']
),
(
  'd6e00aaa-c4d2-461d-b7cb-df596ad444af',
  '7d1e4365-da22-4de2-8aca-00bd7ed27f45',
  4,
  'Largest EU market implementation of EPR creates precedent for enforcement rigor and fee modulation economics. 63% recycling target by 2023 with material-specific thresholds drives demand for recycled inputs and sorting technology. Central Registry requirement provides data infrastructure for compliance SaaS platforms. Germany represents 30-40% of identified platform targets.',
  ARRAY['A2', 'B1', 'C1', 'C2']
),
(
  'd6e00aaa-c4d2-461d-b7cb-df596ad444af',
  '3dd14dd6-0eb3-47ca-891e-d85e97cdc39d',
  4,
  'Full-cost EPR model (2025 onwards) shifts packaging economics by internalizing end-of-life costs into producer fees. 75% recycling target by 2030 and 30% reusable packaging mandate create dual demand for recycling infrastructure and reuse-as-a-service models. Mandatory recyclability labelling requirements favor digital traceability platforms. UK market represents 20-30 identified targets.',
  ARRAY['A1', 'A2', 'C1', 'C2']
),
(
  'd6e00aaa-c4d2-461d-b7cb-df596ad444af',
  '2ac6853f-75b3-4c7b-8a40-e121fc89d8b7',
  3,
  'Economic lever creating £200/tonne cost differential favoring recycled plastic (≥30% content) over virgin. While UK-specific, establishes precedent for tax-based demand creation that could spread EU-wide. Drives substitution toward bio-materials where recycled content sourcing is constrained. Moderate impact as applies only to plastic packaging subset.',
  ARRAY['A1', 'C1', 'C2']
);