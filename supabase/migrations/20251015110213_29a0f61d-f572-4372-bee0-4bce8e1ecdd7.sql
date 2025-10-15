-- Green Workforce & Skills Theme Population
-- Step 1: Insert 5 key regulations

INSERT INTO regulations (
  title,
  description,
  jurisdiction,
  regulation_type,
  status,
  impact_level,
  effective_date,
  compliance_deadline,
  regulatory_body,
  key_provisions,
  source_url
) VALUES
(
  'EU Renewable Energy Directive (RED II) 2018/2001',
  'Directive establishing EU framework for renewable energy promotion, requiring Member States to ensure renewable heating/cooling installer certification schemes by 2020. RED III updates (2023) tighten requirements for certified solar PV, heat pump, and biomass installers, creating direct mandate for training providers to deliver accredited programs. Drives 40% compliance-driven demand for green skills training.',
  'EU',
  'Directive',
  'active',
  'high',
  '2018-12-11',
  '2030-12-31',
  'European Commission DG Energy',
  ARRAY[
    'Mandatory installer certification schemes for renewable technologies',
    'Heat pump installer certification required for quality installations',
    'Solar PV installer accreditation for grid-connected systems',
    'Biomass boiler installer qualification requirements',
    'Member State oversight of training provider accreditation',
    'RED III (2023) tightens qualification standards and adds wind sector',
    'Certification prerequisite for accessing renewable energy subsidies'
  ],
  'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32018L2001'
),
(
  'EU Energy Performance of Buildings Directive (EPBD) recast 2024/1275',
  'Directive requiring all new buildings to be zero-emission by 2030 and fully decarbonised building stock by 2050. Mandates Member States to establish renovation roadmaps, minimum energy performance standards (MEPS), and energy audits driving massive skills shortage: EU needs 750,000 additional heat pump installers by 2030. Creates sustained demand for building retrofit, HVAC, and energy management training through 2050.',
  'EU',
  'Directive',
  'active',
  'high',
  '2024-05-28',
  '2050-12-31',
  'European Commission DG Energy',
  ARRAY[
    'All new buildings must be zero-emission by 2030',
    'Fully decarbonised building stock target by 2050',
    'Minimum energy performance standards (MEPS) for existing buildings',
    'National renovation roadmaps with milestone targets',
    'Mandatory energy audits for large enterprises',
    'Skills shortage: 750,000 heat pump installers needed by 2030',
    'Building automation and control systems (BACS) requirements'
  ],
  'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024L1275'
),
(
  'EU Pact for Skills (2020)',
  'Multi-stakeholder partnership launched by European Commission to mobilize upskilling for green and digital transitions. Signatories commit to training workers in clean energy, building renovation, and sustainable transport sectors. Provides framework for industry-led training consortia and creates market structure for private B2B skills providers through employer pledges and co-funding mechanisms.',
  'EU',
  'Voluntary Partnership',
  'active',
  'medium',
  '2020-11-10',
  '2030-12-31',
  'European Commission DG Employment',
  ARRAY[
    'Multi-stakeholder training commitments from employers',
    'Industry-led consortia for clean energy skills development',
    'Co-funding mechanisms for green transition training',
    'Framework for private B2B training provider market development',
    'Targets 3 million+ workers upskilled in green skills by 2030',
    'Sectoral partnerships in construction, energy, transport'
  ],
  'https://ec.europa.eu/social/main.jsp?catId=1517'
),
(
  'EU Energy Efficiency Directive (EED) 2023/1791',
  'Directive setting binding energy efficiency targets and mandatory annual energy savings obligations for Member States. Article 8 requires large enterprises to conduct energy audits every 4 years, and Article 11-17 mandate promotion of efficiency in heating/cooling through qualified installers. Creates compliance-driven demand for energy auditor certification and installer training programs.',
  'EU',
  'Directive',
  'active',
  'medium',
  '2023-09-20',
  '2030-12-31',
  'European Commission DG Energy',
  ARRAY[
    'Mandatory energy audits for large enterprises every 4 years (Article 8)',
    'Qualified energy auditor certification requirements',
    'Heating/cooling installer qualification mandates (Articles 11-17)',
    '11.7% energy consumption reduction target by 2030',
    'Member State obligation to promote training for efficiency professionals',
    'SME energy audit incentive programs creating auditor demand'
  ],
  'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023L1791'
),
(
  'EU Just Transition Fund & Social Climate Fund',
  'EU funding mechanisms providing €17.5bn (Just Transition Fund) and €65bn+ (Social Climate Fund 2026-2032) to support workers and regions transitioning to climate neutrality. Funds vocational training, reskilling programs, and workforce development in coal/carbon-intensive regions. Enables public-private partnerships where B2B training providers can access co-funding for green skills delivery.',
  'EU',
  'Funding Mechanism',
  'active',
  'medium',
  '2021-06-30',
  '2032-12-31',
  'European Commission DG Climate Action / DG Employment',
  ARRAY[
    '€17.5bn Just Transition Fund for coal/carbon-intensive region support',
    '€65bn+ Social Climate Fund (2026-2032) for workforce transition',
    'Vocational training and reskilling program funding',
    'Public-private partnership opportunities for training providers',
    'Priority regions: Poland, Germany, Romania (coal phase-out)',
    'Co-funding for green skills certification and placement programs',
    'Focus on building renovation, renewable energy, and sustainable transport skills'
  ],
  'https://ec.europa.eu/info/strategy/priorities-2019-2024/european-green-deal/finance-and-green-deal/just-transition-mechanism_en'
)
RETURNING id, title;