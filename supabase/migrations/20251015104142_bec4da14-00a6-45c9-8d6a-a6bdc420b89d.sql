
-- Create 5 key regulations for Water Efficiency theme

-- 1. EU Water Reuse Regulation
INSERT INTO regulations (
  title,
  description,
  jurisdiction,
  regulation_type,
  status,
  effective_date,
  impact_level,
  regulatory_body,
  source_url,
  key_provisions
) VALUES (
  'Regulation (EU) 2020/741 on minimum requirements for water reuse',
  'Establishes minimum requirements for water quality and monitoring for the safe reuse of treated urban wastewater for agricultural irrigation, addressing water scarcity across Europe.',
  'EU',
  'regulation',
  'active',
  '2023-06-26',
  'high',
  'European Commission',
  'https://eur-lex.europa.eu/eli/reg/2020/741/oj',
  ARRAY[
    'Minimum quality requirements for reclaimed water in agricultural irrigation',
    'Risk management obligations for water reuse projects',
    'Monitoring and testing requirements for water quality',
    'Transparency requirements and public information',
    'Member State implementation by June 2023'
  ]
),
-- 2. EU Drinking Water Directive (recast)
(
  'Directive (EU) 2020/2184 on the quality of water intended for human consumption',
  'Recast of the Drinking Water Directive requiring Member States to assess water losses (leakage) in distribution systems and establish action plans and binding targets by 2028.',
  'EU',
  'directive',
  'active',
  '2021-01-12',
  'high',
  'European Commission',
  'https://eur-lex.europa.eu/eli/dir/2020/2184/oj',
  ARRAY[
    'Mandatory leakage assessment for all water supply systems by 2026',
    'Path to EU-level leakage reduction thresholds and targets by 2028',
    'Risk-based approach to water safety (Water Safety Plans)',
    'Updated quality standards for drinking water',
    'Improved public access to information on water quality'
  ]
),
-- 3. EU Water Framework Directive
(
  'Directive 2000/60/EC establishing a framework for Community action in the field of water policy',
  'Establishes a framework for the protection of inland surface waters, transitional waters, coastal waters and groundwater, aiming to achieve good ecological and chemical status.',
  'EU',
  'directive',
  'active',
  '2000-12-22',
  'medium',
  'European Commission',
  'https://eur-lex.europa.eu/eli/dir/2000/60/oj',
  ARRAY[
    'Good ecological status requirement for all water bodies',
    'River basin management plans updated every 6 years',
    'Sustainable water use and abstraction limits',
    'Prevention of deterioration of water status',
    'Pollution reduction and elimination of priority hazardous substances'
  ]
),
-- 4. UK Building Regulations Part G (Water Efficiency)
(
  'Building Regulations 2010 - Part G: Sanitation, hot water safety and water efficiency',
  'Sets mandatory water efficiency standards for new dwellings and buildings in England, requiring maximum water consumption of 125 litres per person per day (110 l/p/d optional tighter standard). Consultation ongoing for 2025-2027 updates.',
  'UK',
  'building_standard',
  'active',
  '2015-04-01',
  'medium',
  'Ministry of Housing, Communities & Local Government',
  'https://www.gov.uk/government/publications/water-efficiency-in-new-buildings',
  ARRAY[
    'Maximum 125 litres per person per day for new dwellings (mandatory)',
    'Optional tighter standard of 110 litres per person per day',
    'Water efficiency calculations required for Building Control approval',
    'Fixture efficiency requirements (taps, showers, WCs, washing machines)',
    'Consultation for further tightening expected 2025-2027'
  ]
),
-- 5. Corporate Sustainability Reporting Directive (CSRD)
(
  'Directive (EU) 2022/2464 on corporate sustainability reporting (CSRD)',
  'Requires large companies and listed SMEs to disclose sustainability information including water use, water withdrawal, water discharge, and water-related risks and impacts as part of mandatory ESG reporting.',
  'EU',
  'directive',
  'active',
  '2024-01-05',
  'medium',
  'European Commission',
  'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32022L2464',
  ARRAY[
    'Mandatory water use and discharge disclosure for large companies (10,000+ employees from 2024)',
    'Double materiality assessment including water-related risks and impacts',
    'Phased implementation: large listed companies 2024, large companies 2025, listed SMEs 2026',
    'Third-party assurance required for sustainability reporting',
    'Alignment with ESRS (European Sustainability Reporting Standards) including water metrics'
  ]
);
