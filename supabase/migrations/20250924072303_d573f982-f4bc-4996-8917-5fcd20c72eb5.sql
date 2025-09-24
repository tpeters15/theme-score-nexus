-- First, let's find the theme ID for 'Smart Water Infrastructure & Analytics'
-- We'll use this in the theme_regulations inserts

-- Insert all water-related regulatory instruments
INSERT INTO public.regulations (
  title, 
  description, 
  jurisdiction, 
  regulation_type, 
  status, 
  impact_level, 
  effective_date, 
  regulatory_body, 
  key_provisions
) VALUES

-- Water Framework Directive (WFD)
(
  'Water Framework Directive (WFD) – Directive 2000/60/EC',
  'Foundational EU water law establishing river-basin management, ''good status'' objectives, and RBMP cycles. 2019 fitness check confirmed directive fit for purpose; 2022 proposal expands pollutant lists & monitoring.',
  'EU',
  'directive',
  'active',
  'high',
  '2000-10-23',
  'European Commission',
  ARRAY['Integrated river-basin management', 'Environmental objectives & EQS', 'Monitoring & public reporting', 'Six-year RBMP cycles']
),

-- Drinking Water Directive (DWD)
(
  'Drinking Water Directive (DWD) – Directive (EU) 2020/2184',
  'Overhauls drinking-water rules with risk-based management from catchment to tap. Creates demand for smart meters, sensors, and risk platforms.',
  'EU',
  'directive',
  'active',
  'high',
  '2020-12-16',
  'European Commission',
  ARRAY['Risk assessments across catchment, supply, domestic systems', 'Leakage assessment & reduction', 'Expanded monitoring incl. PFAS/watch list', 'Transparency and consumer information']
),

-- Urban Wastewater Treatment Directive (UWWTD)
(
  'Urban Wastewater Treatment Directive (UWWTD) – Directive (EU) 2024/3019',
  'Modernises wastewater rules to address micropollutants, energy neutrality, resource recovery, and public health surveillance. Strong technology-forcing effect for sensors, AI process control, and analytics.',
  'EU',
  'directive',
  'active',
  'high',
  '2024-11-27',
  'European Commission',
  ARRAY['Extended Producer Responsibility (EPR) for pharma/cosmetics', 'Quaternary treatment mandate', 'Energy neutrality & resource recovery', 'Wastewater-based epidemiology monitoring']
),

-- Water Reuse Regulation
(
  'Regulation (EU) 2020/741 on Minimum Requirements for Water Reuse',
  'Sets harmonised minimum requirements for reclaimed water, initially for agricultural irrigation. Anchors market creation for reuse projects and compliance platforms.',
  'EU',
  'regulation',
  'active',
  'high',
  '2023-06-26',
  'European Commission',
  ARRAY['Quality classes & monitoring', 'Water Reuse Risk Management Plans', 'Roles for competent authorities', 'Transparency and public reporting']
),

-- European Water Resilience Strategy
(
  'European Water Resilience Strategy (WRS)',
  'Strategic overlay elevating water security and introducing ''Water efficiency first''. Aligns EU funding (e.g. EIB commitments) and complements DWD/UWWTD.',
  'EU',
  'strategy',
  'active',
  'high',
  '2025-06-04',
  'European Commission',
  ARRAY['Restore water cycle', '10% leakage cut by 2030', 'Digitalisation and AI adoption', 'Biennial Water Resilience Forum monitoring']
),

-- Industrial Emissions Directive (IED)
(
  'Industrial Emissions Directive (IED) – Directive 2010/75/EU (amended 2024)',
  'Integrated pollution prevention & control for industrial installations. Raises industrial wastewater performance and monitoring expectations.',
  'EU',
  'directive',
  'active',
  'high',
  '2010-11-24',
  'European Commission',
  ARRAY['Integrated permits', 'BAT conclusions', 'Monitoring and reporting', 'Amendments expand scope and tighten performance']
),

-- PR24 / AMP8
(
  'PR24 / AMP8',
  'Ofwat 5-year price control programme driving record investment in water infrastructure. Includes £2.2bn Accelerated Infrastructure Delivery Project with 462k smart meters (2023–25).',
  'UK',
  'price_control',
  'active',
  'high',
  '2025-04-01',
  'Ofwat',
  ARRAY['Leakage reduction (-17% 2025–30)', 'Massive smart metering rollout (~10m+ devices)', 'Outcome Delivery Incentives (ODIs)', 'Targeted allowances and performance commitments']
),

-- German Drinking Water Ordinance
(
  'Drinking Water Ordinance (TrinkwV 2023)',
  'National transposition of DWD, mandating prevention-led risk management. Drives demand for catchment monitoring, SCADA/GIS integration, and predictive tools.',
  'Germany',
  'ordinance',
  'active',
  'high',
  '2023-06-01',
  'German Federal Ministry of Health',
  ARRAY['Continuous risk management obligation (§34 TrinkwV)', 'Stricter limits for contaminants incl. lead, PFAS', 'Documentation and proof of compliance to authorities']
),

-- German National Water Strategy
(
  'National Water Strategy (Nationale Wasserstrategie)',
  'Long-term national strategy (to 2050) for water security, efficiency, and digitalisation. Provides durable planning signals beyond political cycles.',
  'Germany',
  'strategy',
  'active',
  'high',
  '2023-03-15',
  'German Federal Ministry for the Environment',
  ARRAY['10 strategic areas', '78 measures', 'Data integration and drought monitoring', 'Efficiency and tariff exploration']
),

-- French Plan Eau
(
  'Plan Eau (2023–2030)',
  'French programme addressing drought and water stress with reuse/demand reduction targets. Promotes smart meters and intelligent irrigation systems.',
  'France',
  'programme',
  'active',
  'high',
  '2023-03-30',
  'French Ministry of Ecological Transition',
  ARRAY['1,000 reuse projects by 2027', '10% abstraction reduction by 2030', 'Network leakage repairs', 'Funding via water agencies (+€500m/year)']
),

-- RBMP cycles & EQS updates
(
  'RBMP cycles & EQS list updates (WFD ecosystem)',
  'Planning and environmental quality standard updates under the WFD framework. Increases monitoring and data needs, driving demand for analytics.',
  'EU',
  'framework',
  'active',
  'medium',
  '2022-01-01',
  'European Commission',
  ARRAY['Six-year RBMP planning cycles', 'Priority substances and watch list updates', 'Enhanced monitoring and transparency']
);

-- Now link all these regulations to the Smart Water Infrastructure & Analytics theme
-- First, we need to get the theme ID for 'Smart Water Infrastructure & Analytics'

INSERT INTO public.theme_regulations (regulation_id, theme_id, relevance_score, impact_description, criteria_impacts)
SELECT 
  r.id as regulation_id,
  t.id as theme_id,
  CASE 
    WHEN r.title LIKE '%Water Framework Directive%' THEN 5
    WHEN r.title LIKE '%Drinking Water Directive%' THEN 5
    WHEN r.title LIKE '%Urban Wastewater Treatment%' THEN 5
    WHEN r.title LIKE '%Water Reuse%' THEN 4
    WHEN r.title LIKE '%Water Resilience Strategy%' THEN 5
    WHEN r.title LIKE '%PR24%' THEN 5
    WHEN r.title LIKE '%TrinkwV%' THEN 4
    WHEN r.title LIKE '%National Water Strategy%' THEN 4
    WHEN r.title LIKE '%Plan Eau%' THEN 4
    WHEN r.title LIKE '%Industrial Emissions%' THEN 3
    WHEN r.title LIKE '%RBMP cycles%' THEN 3
    ELSE 3
  END as relevance_score,
  CASE 
    WHEN r.title LIKE '%Water Framework Directive%' THEN 'Foundational directive driving comprehensive water monitoring and management systems'
    WHEN r.title LIKE '%Drinking Water Directive%' THEN 'Creates massive demand for smart meters, sensors, and risk management platforms across EU water utilities'
    WHEN r.title LIKE '%Urban Wastewater Treatment%' THEN 'Technology-forcing regulation driving adoption of AI process control, advanced sensors, and analytics platforms'
    WHEN r.title LIKE '%Water Reuse%' THEN 'Enables market creation for water reuse compliance and monitoring platforms'
    WHEN r.title LIKE '%Water Resilience Strategy%' THEN 'EU strategic framework promoting digitalisation and AI adoption across water sector'
    WHEN r.title LIKE '%PR24%' THEN 'Major UK investment cycle driving 10M+ smart meter rollout and infrastructure digitalization'
    WHEN r.title LIKE '%TrinkwV%' THEN 'German implementation driving demand for integrated monitoring and predictive analytics'
    WHEN r.title LIKE '%National Water Strategy%' THEN 'Long-term strategy promoting data integration and digital transformation'
    WHEN r.title LIKE '%Plan Eau%' THEN 'French programme promoting smart water technologies and efficiency systems'
    WHEN r.title LIKE '%Industrial Emissions%' THEN 'Industrial wastewater monitoring and compliance requirements'
    WHEN r.title LIKE '%RBMP cycles%' THEN 'Ongoing monitoring and reporting requirements driving analytics demand'
    ELSE 'Regulatory driver for smart water infrastructure and analytics adoption'
  END as impact_description,
  ARRAY['regulatory_compliance', 'market_opportunity', 'technology_adoption'] as criteria_impacts
FROM public.regulations r
CROSS JOIN public.themes t
WHERE t.name ILIKE '%Smart Water Infrastructure%Analytics%'
AND r.title IN (
  'Water Framework Directive (WFD) – Directive 2000/60/EC',
  'Drinking Water Directive (DWD) – Directive (EU) 2020/2184',
  'Urban Wastewater Treatment Directive (UWWTD) – Directive (EU) 2024/3019',
  'Regulation (EU) 2020/741 on Minimum Requirements for Water Reuse',
  'European Water Resilience Strategy (WRS)',
  'Industrial Emissions Directive (IED) – Directive 2010/75/EU (amended 2024)',
  'PR24 / AMP8',
  'Drinking Water Ordinance (TrinkwV 2023)',
  'National Water Strategy (Nationale Wasserstrategie)',
  'Plan Eau (2023–2030)',
  'RBMP cycles & EQS list updates (WFD ecosystem)'
);