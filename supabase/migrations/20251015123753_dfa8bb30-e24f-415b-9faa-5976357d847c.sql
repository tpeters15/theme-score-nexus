-- Insert updated regulations for Green Workforce & Skills theme
INSERT INTO regulations (
  id, title, description, jurisdiction, regulation_type, status, 
  effective_date, compliance_deadline, source_url, impact_level, regulatory_body
) VALUES
(
  gen_random_uuid(),
  'EU Renewable Energy Directive (RED II) 2018/2001',
  'Sets binding renewable energy targets requiring Member States to ensure availability of certified installers for renewable energy technologies. Article 18 mandates that installers of heat pumps, solar PV, and biomass systems must meet training and certification requirements.',
  'EU-27',
  'Directive',
  'active',
  '2018-12-11',
  '2030-12-31',
  'https://eur-lex.europa.eu/eli/dir/2018/2001/oj',
  'high',
  'European Commission'
),
(
  gen_random_uuid(),
  'EU Energy Performance of Buildings Directive (EPBD) recast 2024/1275',
  'Revised directive mandating building renovation pathways to achieve zero-emission building stock by 2050. Creates massive demand for skilled workers in building retrofit, heat pump installation, and energy efficiency measures. EU needs 750,000 additional heat pump installers by 2030 to meet EPBD targets.',
  'EU-27',
  'Directive',
  'active',
  '2024-05-28',
  '2030-12-31',
  'https://energy.ec.europa.eu/topics/energy-efficiency/energy-efficient-buildings/energy-performance-buildings-directive_en',
  'high',
  'European Commission'
),
(
  gen_random_uuid(),
  'EU Pact for Skills (2020)',
  'Large-scale partnership bringing together public and private stakeholders to upskill and reskill workers in key sectors including green energy. Aims to deliver 3 million green training opportunities by 2025.',
  'EU-27',
  'Policy Framework',
  'active',
  '2020-11-10',
  '2025-12-31',
  'https://ec.europa.eu/social/main.jsp?catId=1517',
  'medium',
  'European Commission'
),
(
  gen_random_uuid(),
  'EU Energy Efficiency Directive (EED) 2023/1791',
  'Recast directive establishing binding energy efficiency targets and energy savings obligations. Article 22 requires Member States to ensure availability of qualified energy auditors and building professionals. Creates compliance-driven demand for energy efficiency training.',
  'EU-27',
  'Directive',
  'active',
  '2023-09-20',
  '2030-12-31',
  'https://energy.ec.europa.eu/topics/energy-efficiency/energy-efficiency-targets-directive-and-rules/energy-efficiency-directive_en',
  'high',
  'European Commission'
),
(
  gen_random_uuid(),
  'EU Just Transition Fund & Social Climate Fund',
  'Provides €65bn+ in funding (2021-2027) for reskilling workers in carbon-intensive industries and supporting green transitions. Significant portion allocated to vocational training in renewable energy and efficiency sectors.',
  'EU-27',
  'Funding Mechanism',
  'active',
  '2021-01-01',
  '2027-12-31',
  'https://ec.europa.eu/regional_policy/funding/just-transition-fund_en',
  'medium',
  'European Commission'
)
RETURNING id;