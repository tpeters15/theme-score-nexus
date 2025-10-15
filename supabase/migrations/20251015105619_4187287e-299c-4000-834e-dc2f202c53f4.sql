-- Sustainable Materials & Packaging Theme Population
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
  'EU Packaging and Packaging Waste Regulation (PPWR) 2022/677',
  'Comprehensive EU regulation recasting packaging/waste laws, requiring all packaging to be reusable or recyclable with minimum recycled content and design obligations. Sets EU-wide targets for reuse (25% by 2030) and bans very lightweight single-use packaging. Strengthens EPR with uniform rules and recycled-content mandates (10-70% depending on material). Entered into force February 2025 with staged application milestones through 2040.',
  'EU',
  'Regulation',
  'active',
  'high',
  '2025-02-11',
  '2030-12-31',
  'European Commission DG Environment',
  ARRAY[
    'All packaging must be reusable or recyclable by 2030',
    'Minimum recycled content mandates: 10-70% depending on material',
    '25% reuse target for certain packaging by 2030',
    'Bans on very lightweight single-use packaging (e.g., tiny sachets)',
    'EU-wide EPR with uniform rules',
    '65-70% recycling by 2030, 90% beverage container collection by 2029',
    'Design-for-recycling criteria and digital product passport requirements',
    'PFAS restrictions in food-contact packaging'
  ],
  'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:52022PC0677'
),
(
  'EU Single-Use Plastics Directive (SUPD) 2019/904',
  'EU directive banning or restricting certain single-use plastic items (polystyrene plates, cups, expanded polystyrene containers). Imposes design requirements: bottle caps must stay attached to bottles. Requires labelling, collection targets (≥90% of plastic bottles by 2029), and EPR schemes for SUP products and fishing gear. Implementation by Member States completed mid-2021 with phased obligations through 2025.',
  'EU',
  'Directive',
  'active',
  'high',
  '2019-06-05',
  '2029-12-31',
  'European Commission',
  ARRAY[
    'Bans on specific single-use plastic items (polystyrene plates, cups, containers)',
    'Bottle cap attachment requirement (2024)',
    '≥90% plastic bottle collection target by 2029',
    'Mandatory labelling requirements for SUP products',
    'EPR schemes for SUP products and fishing gear',
    'Design rules for beverage bottles and packaging'
  ],
  'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32019L0904'
),
(
  'Germany Verpackungsgesetz (Packaging Act) 2019',
  'National law implementing EPR: all producers/importers of sales packaging must register with the Central Packaging Registry and participate in approved waste systems. Sets high recovery/recycling targets (≥63% overall recycling by 2023 with specific targets by material). Bans lightweight plastic bags and enforces deposit-return for bottles. Updated in 2021 for EU SUP/WFD alignment.',
  'Germany',
  'National Law',
  'active',
  'medium',
  '2019-01-01',
  '2023-12-31',
  'Bundesumweltministerium (Federal Ministry for the Environment)',
  ARRAY[
    'Mandatory EPR registration with Central Packaging Registry',
    'Participation in approved waste collection systems required',
    '≥63% overall recycling by 2023',
    'Material-specific recycling targets',
    'Lightweight plastic bag ban',
    'Deposit-return system for beverage bottles'
  ],
  'https://www.bgbl.de'
),
(
  'UK Packaging Waste EPR Regulations 2023',
  'National regulation establishing EPR for all packaging: producers/importers pay full costs of collection/recycling rather than flat rate. Sets recycling rate targets (69% general packaging by 2024 rising to 75% by 2030, 30% reusable packaging by 2030). Introduces mandatory labelling of reusable packaging options and recycled content. Partial launch April 2024 with full cost-reflective fees by 2025.',
  'United Kingdom',
  'National Regulation',
  'active',
  'medium',
  '2024-04-01',
  '2030-12-31',
  'DEFRA (Department for Environment, Food & Rural Affairs)',
  ARRAY[
    'Producers/importers pay full collection and recycling costs',
    '69% recycling rate target by 2024, rising to 75% by 2030',
    '30% reusable packaging target by 2030',
    'Mandatory labelling of reusable packaging and recycled content',
    'Cost-reflective EPR fees based on recyclability',
    'Data collection requirements from April 2024'
  ],
  'https://www.legislation.gov.uk'
),
(
  'UK Plastic Packaging Tax 2022',
  'National tax imposing £200/tonne on plastic packaging components containing <30% recycled plastic by weight. Applies to manufacturers/importers of >10 tonnes/year of covered plastic packaging. Encourages supply of recycled plastic and alternative materials by creating economic incentive to increase recycled content.',
  'United Kingdom',
  'National Tax',
  'active',
  'medium',
  '2022-04-01',
  '9999-12-31',
  'HM Revenue & Customs',
  ARRAY[
    '£200/tonne tax on plastic packaging with <30% recycled content',
    'Applies to manufacturers/importers of >10 tonnes/year',
    'Measured by weight of recycled plastic content',
    'Ongoing tax liability from April 2022',
    'Drives investment in recycled plastic sourcing and alternatives'
  ],
  'https://www.gov.uk/guidance/check-if-you-need-to-register-for-plastic-packaging-tax'
)
RETURNING id, title;