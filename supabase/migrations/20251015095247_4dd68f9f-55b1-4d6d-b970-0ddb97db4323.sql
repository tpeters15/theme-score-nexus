
-- Insert 5 key regulations for Industrial & Commercial Energy Efficiency theme

-- 1. EU Energy Performance of Buildings Directive (EPBD recast) 2024
INSERT INTO regulations (
  title,
  description,
  jurisdiction,
  regulation_type,
  status,
  impact_level,
  effective_date,
  compliance_deadline,
  key_provisions,
  regulatory_body
) VALUES (
  'Energy Performance of Buildings Directive (EPBD) - Directive 2024/1275',
  'Recast EPBD raising building efficiency standards across the EU. Mandates near-zero emissions building stock by 2050, stricter minimum energy performance for new and existing buildings, integration of renewable heating/cooling, digitalisation (building passports), and lifecycle carbon limits on major renovations.',
  'EU',
  'directive',
  'active',
  'high',
  '2024-05-08',
  '2025-01-01',
  ARRAY[
    'Zero-emission building stock by 2050',
    'Stricter EPC and CO₂ benchmarking',
    'Mandatory renovation of existing buildings',
    'HVAC controls and automation requirements',
    'Building digitalisation and smart readiness',
    'Long-term refurbishment strategies',
    'Lifecycle carbon assessment for major renovations'
  ],
  'European Commission'
) ON CONFLICT DO NOTHING;

-- 2. EU Energy Efficiency Directive (EED recast) 2023
INSERT INTO regulations (
  title,
  description,
  jurisdiction,
  regulation_type,
  status,
  impact_level,
  effective_date,
  compliance_deadline,
  key_provisions,
  regulatory_body
) VALUES (
  'Energy Efficiency Directive (EED) - Directive 2023/1791',
  'Recast EED raising overall EU energy-savings target from 32.5% to 39% by 2030. Embeds "energy efficiency first" principle in all planning. Requires mandatory 4-year energy audits or ISO 50001 systems for large companies, stricter annual renovation rates for public buildings, and expanded consumption reporting.',
  'EU',
  'directive',
  'active',
  'high',
  '2023-09-20',
  '2025-10-11',
  ARRAY[
    '39% energy savings target by 2030',
    'Energy efficiency first principle',
    'Mandatory 4-year audits for large companies (≥250 employees)',
    'ISO 50001 energy management systems',
    'Annual renovation quotas for public buildings',
    'Enhanced utility consumption reporting',
    'Efficiency criteria in government procurement',
    'Annual 1.49% energy savings obligation'
  ],
  'European Commission'
) ON CONFLICT DO NOTHING;

-- 3. Germany Energy Efficiency Act 2023
INSERT INTO regulations (
  title,
  description,
  jurisdiction,
  regulation_type,
  status,
  impact_level,
  effective_date,
  key_provisions,
  regulatory_body
) VALUES (
  'Energy Efficiency Act (Energieeffizienzgesetz - EnEfG)',
  'German national law establishing binding targets beyond EU requirements. Stipulates 27% cut in final energy use by 2030 (≈500 TWh reduction) and 46% by 2045. Mandates energy-saving measures for federal and state buildings, minimum efficiency standards for data centers, and transposes EED provisions into German law.',
  'Germany',
  'national_law',
  'active',
  'high',
  '2023-11-17',
  ARRAY[
    '27% final energy reduction by 2030',
    '46% final energy reduction by 2045',
    'Federal/state building efficiency mandates (45 TWh annual savings by 2024)',
    'Data center efficiency standards',
    'Public agency efficiency obligations',
    'Company efficiency measure requirements',
    'Annual reporting and target tracking'
  ],
  'German Federal Ministry for Economic Affairs and Climate Action (BMWK)'
) ON CONFLICT DO NOTHING;

-- 4. UK MEES (Minimum Energy Efficiency Standards)
INSERT INTO regulations (
  title,
  description,
  jurisdiction,
  regulation_type,
  status,
  impact_level,
  effective_date,
  compliance_deadline,
  key_provisions,
  regulatory_body
) VALUES (
  'Minimum Energy Efficiency Standards (MEES) for Commercial Properties',
  'UK regulations implementing EPBD requirements at national level. Requires Energy Performance Certificates (EPCs) for all commercial buildings and sets minimum EPC ratings. Mandates EPC rating of E or above for commercial properties: new leases from April 2018 and all existing leases by April 2023.',
  'United Kingdom',
  'regulation',
  'active',
  'medium',
  '2018-04-01',
  '2023-04-01',
  ARRAY[
    'Minimum EPC E rating for all commercial leases',
    'EPC display requirement for public buildings',
    'Regular boiler and air conditioner inspections',
    'Prohibition on letting sub-standard properties',
    'Fines up to £5,000 for non-compliance'
  ],
  'UK Department for Energy Security and Net Zero'
) ON CONFLICT DO NOTHING;

-- 5. UK ESOS (Energy Savings Opportunity Scheme)
INSERT INTO regulations (
  title,
  description,
  jurisdiction,
  regulation_type,
  status,
  impact_level,
  effective_date,
  key_provisions,
  regulatory_body
) VALUES (
  'Energy Savings Opportunity Scheme (ESOS)',
  'UK transposition of EU EED Article 8. Requires large UK enterprises (≥250 employees or high turnover) to conduct comprehensive energy audits every four years and identify cost-effective energy-saving measures. Companies must report energy use and compliance to HMRC.',
  'United Kingdom',
  'regulation',
  'active',
  'medium',
  '2015-12-05',
  ARRAY[
    'Mandatory energy audits every 4 years',
    'Applies to enterprises ≥250 employees or ≥€50M turnover',
    'Identification of cost-effective efficiency measures',
    'Compliance reporting to HMRC',
    'ISO 50001 certification as alternative route',
    'Audit deadline: December 5 every fourth year (2015, 2019, 2023, 2027...)'
  ],
  'UK Environment Agency / HMRC'
) ON CONFLICT DO NOTHING;
