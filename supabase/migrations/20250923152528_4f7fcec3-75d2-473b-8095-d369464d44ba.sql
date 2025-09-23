-- First, let's create the Industrial Energy Efficiency & Optimisation theme
INSERT INTO public.themes (id, name, pillar, sector, description, in_scope, out_of_scope, created_at, updated_at) VALUES 
(
  gen_random_uuid(),
  'Industrial Energy Efficiency & Optimisation',
  'Energy Transition',
  'Industrial',
  'Asset-light software and services for industrial energy efficiency, targeting compliance with EU regulations and operational optimization',
  ARRAY[
    'Software-based energy management systems',
    'Industrial IoT and monitoring solutions',
    'Energy analytics and optimization platforms',
    'Compliance and reporting tools for EU regulations',
    'Asset-light service models',
    'Platform consolidation opportunities'
  ],
  ARRAY[
    'Hardware-heavy solutions',
    'Capital-intensive infrastructure',
    'Residential energy efficiency',
    'Transportation efficiency',
    'Pure consulting without technology'
  ],
  now(),
  now()
);

-- Store the theme ID for later use
DO $$
DECLARE
    theme_uuid uuid;
    cat_a_uuid uuid := gen_random_uuid();
    cat_b_uuid uuid := gen_random_uuid();
    cat_c_uuid uuid := gen_random_uuid();
    crit_a1_uuid uuid := gen_random_uuid();
    crit_a2_uuid uuid := gen_random_uuid();
    crit_a3_uuid uuid := gen_random_uuid();
    crit_b1_uuid uuid := gen_random_uuid();
    crit_b2_uuid uuid := gen_random_uuid();
    crit_b3_uuid uuid := gen_random_uuid();
    crit_c1_uuid uuid := gen_random_uuid();
    crit_c2_uuid uuid := gen_random_uuid();
    crit_c3_uuid uuid := gen_random_uuid();
BEGIN
    -- Get the theme ID we just created
    SELECT id INTO theme_uuid FROM public.themes WHERE name = 'Industrial Energy Efficiency & Optimisation';

    -- Create framework categories if they don't exist
    INSERT INTO public.framework_categories (id, code, name, description, weight, display_order, created_at, updated_at) VALUES 
    (cat_a_uuid, 'A', 'Market Attractiveness', 'Total Addressable Market, Platform Potential, and Growth Metrics', 30, 1, now(), now()),
    (cat_b_uuid, 'B', 'Investment Attractiveness', 'Platform potential, competitive dynamics, and exit environment', 35, 2, now(), now()),
    (cat_c_uuid, 'C', 'Risk Assessment', 'Regulatory, timing, and macro sensitivity factors', 35, 3, now(), now())
    ON CONFLICT (code) DO UPDATE SET
      name = EXCLUDED.name,
      description = EXCLUDED.description,
      weight = EXCLUDED.weight,
      updated_at = now();

    -- Get actual category IDs (in case they already existed)
    SELECT id INTO cat_a_uuid FROM public.framework_categories WHERE code = 'A';
    SELECT id INTO cat_b_uuid FROM public.framework_categories WHERE code = 'B';
    SELECT id INTO cat_c_uuid FROM public.framework_categories WHERE code = 'C';

    -- Create framework criteria
    INSERT INTO public.framework_criteria (id, category_id, code, name, description, objective, weight, display_order, scoring_rubric, ai_prompt, created_at, updated_at) VALUES 
    (crit_a1_uuid, cat_a_uuid, 'A1', 'TAM', 'Total Addressable Market analysis', 'Assess the size of the total addressable market', 10, 1, '{"1": {"label": "Low", "description": "TAM < €1bn"}, "3": {"label": "Medium", "description": "TAM €1-5bn"}, "5": {"label": "High", "description": "TAM > €5bn"}}', 'Analyze the total addressable market size for this theme', now(), now()),
    (crit_a2_uuid, cat_a_uuid, 'A2', 'Platform Potential (SOM)', 'Serviceable Obtainable Market for platform business', 'Evaluate realistic market capture potential', 10, 2, '{"1": {"label": "Low", "description": "SOM < €50m"}, "3": {"label": "Medium", "description": "SOM €50-100m"}, "5": {"label": "High", "description": "SOM > €100m"}}', 'Assess the serviceable obtainable market and platform potential', now(), now()),
    (crit_a3_uuid, cat_a_uuid, 'A3', 'CAGR', 'Compound Annual Growth Rate', 'Assess market growth trajectory', 10, 3, '{"1": {"label": "Low", "description": "CAGR < 5%"}, "3": {"label": "Medium", "description": "CAGR 5-15%"}, "5": {"label": "High", "description": "CAGR > 15%"}}', 'Evaluate the compound annual growth rate of the market', now(), now()),
    (crit_b1_uuid, cat_b_uuid, 'B1', 'Platform & Strategic M&A Potential', 'Consolidation and platform building opportunities', 'Evaluate buy-and-build potential', 12, 4, '{"1": {"label": "Low", "description": "Limited consolidation potential"}, "3": {"label": "Medium", "description": "Some M&A opportunities"}, "5": {"label": "High", "description": "Clear platform/consolidation play"}}', 'Assess platform building and M&A consolidation opportunities', now(), now()),
    (crit_b2_uuid, cat_b_uuid, 'B2', 'Competitive Landscape & Moat Potential', 'Market structure and defensibility', 'Assess competitive dynamics and moat building potential', 12, 5, '{"1": {"label": "Low", "description": "Highly competitive, low moats"}, "3": {"label": "Medium", "description": "Moderate competition, some differentiation"}, "5": {"label": "High", "description": "Clear differentiation and moat potential"}}', 'Analyze competitive landscape and potential for building defensible moats', now(), now()),
    (crit_b3_uuid, cat_b_uuid, 'B3', 'Exit Environment', 'Strategic and financial buyer landscape', 'Evaluate exit opportunities and timeline', 11, 6, '{"1": {"label": "Low", "description": "Limited exit options"}, "3": {"label": "Medium", "description": "Some strategic interest"}, "5": {"label": "High", "description": "Strong strategic and financial buyer interest"}}', 'Assess the exit environment including strategic and financial buyers', now(), now()),
    (crit_c1_uuid, cat_c_uuid, 'C1', 'Regulatory Dependency', 'Regulatory risk and dependency assessment', 'Evaluate regulatory risks and dependencies', 12, 7, '{"1": {"label": "High Risk", "description": "High regulatory uncertainty"}, "3": {"label": "Medium Risk", "description": "Some regulatory risks"}, "5": {"label": "Low Risk", "description": "Stable regulatory environment"}}', 'Assess regulatory dependency and associated risks', now(), now()),
    (crit_c2_uuid, cat_c_uuid, 'C2', 'Market Timing', 'Investment timing and market readiness', 'Assess optimal investment timing', 12, 8, '{"1": {"label": "Poor Timing", "description": "Market not ready, >3 years"}, "3": {"label": "Medium Timing", "description": "Moderate timing, 18 months - 3 years"}, "5": {"label": "Optimal Timing", "description": "Market ready, <18 months"}}', 'Evaluate market timing and investment window', now(), now()),
    (crit_c3_uuid, cat_c_uuid, 'C3', 'Macro Sensitivity', 'Macroeconomic sensitivity assessment', 'Assess exposure to macroeconomic cycles', 11, 9, '{"1": {"label": "High Sensitivity", "description": "Highly cyclical"}, "3": {"label": "Medium Sensitivity", "description": "Some macro exposure"}, "5": {"label": "Low Sensitivity", "description": "Defensive, counter-cyclical"}}', 'Analyze sensitivity to macroeconomic conditions', now(), now())
    ON CONFLICT (code) DO UPDATE SET
      name = EXCLUDED.name,
      description = EXCLUDED.description,
      objective = EXCLUDED.objective,
      weight = EXCLUDED.weight,
      updated_at = now();

    -- Get actual criteria IDs (in case they already existed)
    SELECT id INTO crit_a1_uuid FROM public.framework_criteria WHERE code = 'A1';
    SELECT id INTO crit_a2_uuid FROM public.framework_criteria WHERE code = 'A2';
    SELECT id INTO crit_a3_uuid FROM public.framework_criteria WHERE code = 'A3';
    SELECT id INTO crit_b1_uuid FROM public.framework_criteria WHERE code = 'B1';
    SELECT id INTO crit_b2_uuid FROM public.framework_criteria WHERE code = 'B2';
    SELECT id INTO crit_b3_uuid FROM public.framework_criteria WHERE code = 'B3';
    SELECT id INTO crit_c1_uuid FROM public.framework_criteria WHERE code = 'C1';
    SELECT id INTO crit_c2_uuid FROM public.framework_criteria WHERE code = 'C2';
    SELECT id INTO crit_c3_uuid FROM public.framework_criteria WHERE code = 'C3';

    -- Insert detailed scores for Industrial Energy Efficiency theme
    INSERT INTO public.detailed_scores (theme_id, criteria_id, score, confidence, notes, analyst_notes, updated_by, updated_at, update_source) VALUES 
    (theme_uuid, crit_a1_uuid, 5, 'High', 'Blended TAM for asset-light industrial efficiency in target European geographies is €8–12 bn (2025), clearly above the €5 bn threshold.', 'Market analysis confirms strong TAM above threshold', auth.uid(), now(), 'manual'),
    (theme_uuid, crit_a2_uuid, 5, 'High', 'Bottom-up model indicates a realistic SOM ≈ €246 m annual revenue by 2029 for a single market-leading platform (≥£100 m).', 'Bottom-up modeling supports strong platform potential', auth.uid(), now(), 'manual'),
    (theme_uuid, crit_a3_uuid, 3, 'Medium', 'Final blended growth estimate for the asset-light software/services segment is ~10–12% for the 2025–2029 horizon (within 5–15%).', 'Growth rate within acceptable range but not exceptional', auth.uid(), now(), 'manual'),
    (theme_uuid, crit_b1_uuid, 5, 'High', 'Market is highly fragmented with a long tail of specialists, supporting a clear buy-and-build pathway for a consolidating platform.', 'Clear platform consolidation opportunity identified', auth.uid(), now(), 'manual'),
    (theme_uuid, crit_b2_uuid, 3, 'Medium', 'Field includes large incumbents alongside many SMEs; defensibility can be built via scalable software layers and integration of ESG/CSRD capabilities that increase stickiness.', 'Competitive but differentiation opportunities exist', auth.uid(), now(), 'manual'),
    (theme_uuid, crit_b3_uuid, 5, 'High', 'Theme shows a clear path to attractive exit with both strategic and financial buyers within 3–5 years, underpinned by consolidation dynamics.', 'Strong exit environment with multiple buyer types', auth.uid(), now(), 'manual'),
    (theme_uuid, crit_c1_uuid, 3, 'Medium', 'Strong, durable EU/UK regulatory tailwinds support demand, but risks remain around uneven transposition, policy "simplification" and complexity, making growth partly policy-contingent.', 'Regulatory support strong but some implementation risks', auth.uid(), now(), 'manual'),
    (theme_uuid, crit_c2_uuid, 5, 'High', 'The investability window is "Near" (≤18 months) given newly implemented binding regulations and 2030 timelines, indicating a favourable entry point.', 'Optimal timing with regulatory drivers in place', auth.uid(), now(), 'manual'),
    (theme_uuid, crit_c3_uuid, 3, 'Medium', 'Regulatory/ compliance drivers provide a non-cyclical demand floor, but a severe industrial recession would defer efficiency capex and slow adoption.', 'Some macro sensitivity despite regulatory floor', auth.uid(), now(), 'manual');

END $$;

-- Insert regulatory instruments from the regulatory analysis
INSERT INTO public.regulations (title, regulatory_body, jurisdiction, regulation_type, status, effective_date, compliance_deadline, impact_level, description, key_provisions, source_url, created_at, updated_at) VALUES 
('Energy Efficiency Directive (EED) 2023/1791', 'European Commission', 'European Union', 'Directive', 'active', '2023-10-20', '2025-10-11', 'high', 'Establishes a common framework of measures for the promotion of energy efficiency to ensure the achievement of the Union 2030 energy efficiency targets', ARRAY['Annual 1.49% energy consumption reduction', 'Energy management systems for large companies', 'Energy audits every 4 years', 'Public sector 1.9% annual reduction'], 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023L1791', now(), now()),
('Corporate Sustainability Reporting Directive (CSRD)', 'European Commission', 'European Union', 'Directive', 'active', '2023-01-05', '2025-01-01', 'high', 'Requires companies to report on sustainability matters including environmental impact and energy efficiency', ARRAY['Mandatory sustainability reporting', 'Energy consumption disclosure', 'Double materiality assessment', 'Third-party assurance required'], 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32022L2464', now(), now()),
('EU Taxonomy Regulation', 'European Commission', 'European Union', 'Regulation', 'active', '2020-07-12', '2022-01-01', 'high', 'Classification system establishing list of environmentally sustainable economic activities including energy efficiency', ARRAY['Technical screening criteria for energy efficiency', 'Substantial contribution requirements', 'Do no significant harm principle', 'Minimum safeguards compliance'], 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32020R0852', now(), now()),
('Sustainable Finance Disclosure Regulation (SFDR)', 'European Commission', 'European Union', 'Regulation', 'active', '2021-03-10', '2021-03-10', 'medium', 'Requires financial market participants to disclose sustainability-related information', ARRAY['Principal adverse impact disclosure', 'Sustainability risk integration', 'Article 8 and 9 product classification', 'ESG data requirements'], 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32019R2088', now(), now()),
('EU Emissions Trading System (EU ETS) - Phase 4', 'European Commission', 'European Union', 'Regulation', 'active', '2021-01-01', '2030-12-31', 'high', 'Cap-and-trade system covering energy-intensive industries with increasing carbon pricing pressure', ARRAY['Linear reduction factor 2.2% annually', 'Market Stability Reserve mechanism', 'Free allocation phase-out', 'Carbon leakage protection'], 'https://climate.ec.europa.eu/eu-action/eu-emissions-trading-system-eu-ets_en', now(), now()),
('Energy Savings Opportunity Scheme (ESOS)', 'Environment Agency', 'United Kingdom', 'Regulation', 'active', '2014-07-17', '2023-12-05', 'medium', 'Mandatory energy assessment and improvement identification for large UK companies', ARRAY['Energy audits every 4 years', 'Lead assessor requirements', 'Board level sign-off', 'Alternative compliance routes'], 'https://www.gov.uk/guidance/energy-savings-opportunity-scheme-esos', now(), now()),
('Streamlined Energy and Carbon Reporting (SECR)', 'Department for Business, Energy & Industrial Strategy', 'United Kingdom', 'Regulation', 'active', '2019-04-01', '2019-04-01', 'medium', 'Mandatory annual reporting of energy consumption and carbon emissions for large companies', ARRAY['Annual energy and carbon reporting', 'Energy efficiency measures disclosure', 'Intensity metrics required', 'Previous year comparison'], 'https://www.gov.uk/government/consultations/streamlined-energy-and-carbon-reporting', now(), now());

-- Link regulations to the Industrial Energy Efficiency theme
DO $$
DECLARE
    theme_uuid uuid;
    reg_eed_uuid uuid;
    reg_csrd_uuid uuid;
    reg_taxonomy_uuid uuid;
    reg_sfdr_uuid uuid;
    reg_ets_uuid uuid;
    reg_esos_uuid uuid;
    reg_secr_uuid uuid;
BEGIN
    -- Get IDs
    SELECT id INTO theme_uuid FROM public.themes WHERE name = 'Industrial Energy Efficiency & Optimisation';
    SELECT id INTO reg_eed_uuid FROM public.regulations WHERE title = 'Energy Efficiency Directive (EED) 2023/1791';
    SELECT id INTO reg_csrd_uuid FROM public.regulations WHERE title = 'Corporate Sustainability Reporting Directive (CSRD)';
    SELECT id INTO reg_taxonomy_uuid FROM public.regulations WHERE title = 'EU Taxonomy Regulation';
    SELECT id INTO reg_sfdr_uuid FROM public.regulations WHERE title = 'Sustainable Finance Disclosure Regulation (SFDR)';
    SELECT id INTO reg_ets_uuid FROM public.regulations WHERE title = 'EU Emissions Trading System (EU ETS) - Phase 4';
    SELECT id INTO reg_esos_uuid FROM public.regulations WHERE title = 'Energy Savings Opportunity Scheme (ESOS)';
    SELECT id INTO reg_secr_uuid FROM public.regulations WHERE title = 'Streamlined Energy and Carbon Reporting (SECR)';

    INSERT INTO public.theme_regulations (theme_id, regulation_id, relevance_score, impact_description, criteria_impacts, created_at, updated_at) VALUES 
    (theme_uuid, reg_eed_uuid, 95, 'Core driver for industrial energy efficiency investments and compliance solutions', ARRAY['A1', 'A2', 'C1', 'C2'], now(), now()),
    (theme_uuid, reg_csrd_uuid, 85, 'Creates demand for energy reporting and management systems', ARRAY['A2', 'B2', 'C1'], now(), now()),
    (theme_uuid, reg_taxonomy_uuid, 80, 'Defines technical criteria for sustainable energy efficiency investments', ARRAY['B2', 'C1'], now(), now()),
    (theme_uuid, reg_sfdr_uuid, 70, 'Drives ESG data requirements supporting efficiency solutions', ARRAY['A2', 'B2'], now(), now()),
    (theme_uuid, reg_ets_uuid, 90, 'Carbon pricing creates economic incentive for efficiency improvements', ARRAY['A1', 'A3', 'C2'], now(), now()),
    (theme_uuid, reg_esos_uuid, 75, 'UK-specific compliance driver for energy audits and efficiency', ARRAY['A2', 'C1'], now(), now()),
    (theme_uuid, reg_secr_uuid, 65, 'UK reporting requirements supporting efficiency monitoring solutions', ARRAY['A2', 'B2'], now(), now());
END $$;