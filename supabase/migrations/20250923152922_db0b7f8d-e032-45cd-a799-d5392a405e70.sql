-- Create the Industrial Energy Efficiency & Optimisation theme
INSERT INTO public.themes (name, pillar, sector, description, in_scope, out_of_scope)
VALUES (
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
  ]
);

-- Insert detailed scores for Industrial Energy Efficiency theme
-- First get the theme and criteria IDs, then insert scores
DO $$
DECLARE
    theme_uuid uuid;
    a1_criteria_id uuid;
    a2_criteria_id uuid;
    a3_criteria_id uuid;
    b1_criteria_id uuid;
    b2_criteria_id uuid;
    b3_criteria_id uuid;
    c1_criteria_id uuid;
    c2_criteria_id uuid;
    c3_criteria_id uuid;
BEGIN
    -- Get theme ID
    SELECT id INTO theme_uuid FROM public.themes WHERE name = 'Industrial Energy Efficiency & Optimisation';
    
    -- Get criteria IDs
    SELECT id INTO a1_criteria_id FROM public.framework_criteria WHERE code = 'A1';
    SELECT id INTO a2_criteria_id FROM public.framework_criteria WHERE code = 'A2';
    SELECT id INTO a3_criteria_id FROM public.framework_criteria WHERE code = 'A3';
    SELECT id INTO b1_criteria_id FROM public.framework_criteria WHERE code = 'B1';
    SELECT id INTO b2_criteria_id FROM public.framework_criteria WHERE code = 'B2';
    SELECT id INTO b3_criteria_id FROM public.framework_criteria WHERE code = 'B3';
    SELECT id INTO c1_criteria_id FROM public.framework_criteria WHERE code = 'C1';
    SELECT id INTO c2_criteria_id FROM public.framework_criteria WHERE code = 'C2';
    SELECT id INTO c3_criteria_id FROM public.framework_criteria WHERE code = 'C3';
    
    -- Insert scores if IDs exist
    IF theme_uuid IS NOT NULL AND a1_criteria_id IS NOT NULL THEN
        INSERT INTO public.detailed_scores (theme_id, criteria_id, score, confidence, notes, analyst_notes, update_source) VALUES
        (theme_uuid, a1_criteria_id, 5, 'High', 'Blended TAM for asset-light industrial efficiency in target European geographies is €8–12 bn (2025), clearly above the €5 bn threshold.', 'Market analysis confirms strong TAM above threshold', 'manual'),
        (theme_uuid, a2_criteria_id, 5, 'High', 'Bottom-up model indicates a realistic SOM ≈ €246 m annual revenue by 2029 for a single market-leading platform (≥£100 m).', 'Bottom-up modeling supports strong platform potential', 'manual'),
        (theme_uuid, a3_criteria_id, 3, 'Medium', 'Final blended growth estimate for the asset-light software/services segment is ~10–12% for the 2025–2029 horizon (within 5–15%).', 'Growth rate within acceptable range but not exceptional', 'manual'),
        (theme_uuid, b1_criteria_id, 5, 'High', 'Market is highly fragmented with a long tail of specialists, supporting a clear buy-and-build pathway for a consolidating platform.', 'Clear platform consolidation opportunity identified', 'manual'),
        (theme_uuid, b2_criteria_id, 3, 'Medium', 'Field includes large incumbents alongside many SMEs; defensibility can be built via scalable software layers and integration of ESG/CSRD capabilities that increase stickiness.', 'Competitive but differentiation opportunities exist', 'manual'),
        (theme_uuid, b3_criteria_id, 5, 'High', 'Theme shows a clear path to attractive exit with both strategic and financial buyers within 3–5 years, underpinned by consolidation dynamics.', 'Strong exit environment with multiple buyer types', 'manual'),
        (theme_uuid, c1_criteria_id, 3, 'Medium', 'Strong, durable EU/UK regulatory tailwinds support demand, but risks remain around uneven transposition, policy "simplification" and complexity, making growth partly policy-contingent.', 'Regulatory support strong but some implementation risks', 'manual'),
        (theme_uuid, c2_criteria_id, 5, 'High', 'The investability window is "Near" (≤18 months) given newly implemented binding regulations and 2030 timelines, indicating a favourable entry point.', 'Optimal timing with regulatory drivers in place', 'manual'),
        (theme_uuid, c3_criteria_id, 3, 'Medium', 'Regulatory/ compliance drivers provide a non-cyclical demand floor, but a severe industrial recession would defer efficiency capex and slow adoption.', 'Some macro sensitivity despite regulatory floor', 'manual');
    END IF;
END $$;

-- Insert regulatory instruments
INSERT INTO public.regulations (title, regulatory_body, jurisdiction, regulation_type, status, effective_date, compliance_deadline, impact_level, description, key_provisions, source_url) VALUES 
('Energy Efficiency Directive (EED) 2023/1791', 'European Commission', 'European Union', 'Directive', 'active', '2023-10-20', '2025-10-11', 'high', 'Establishes a common framework of measures for the promotion of energy efficiency to ensure the achievement of the Union 2030 energy efficiency targets', ARRAY['Annual 1.49% energy consumption reduction', 'Energy management systems for large companies', 'Energy audits every 4 years', 'Public sector 1.9% annual reduction'], 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023L1791'),
('Corporate Sustainability Reporting Directive (CSRD)', 'European Commission', 'European Union', 'Directive', 'active', '2023-01-05', '2025-01-01', 'high', 'Requires companies to report on sustainability matters including environmental impact and energy efficiency', ARRAY['Mandatory sustainability reporting', 'Energy consumption disclosure', 'Double materiality assessment', 'Third-party assurance required'], 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32022L2464'),
('EU Taxonomy Regulation', 'European Commission', 'European Union', 'Regulation', 'active', '2020-07-12', '2022-01-01', 'high', 'Classification system establishing list of environmentally sustainable economic activities including energy efficiency', ARRAY['Technical screening criteria for energy efficiency', 'Substantial contribution requirements', 'Do no significant harm principle', 'Minimum safeguards compliance'], 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32020R0852'),
('Sustainable Finance Disclosure Regulation (SFDR)', 'European Commission', 'European Union', 'Regulation', 'active', '2021-03-10', '2021-03-10', 'medium', 'Requires financial market participants to disclose sustainability-related information', ARRAY['Principal adverse impact disclosure', 'Sustainability risk integration', 'Article 8 and 9 product classification', 'ESG data requirements'], 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32019R2088'),
('EU Emissions Trading System (EU ETS) - Phase 4', 'European Commission', 'European Union', 'Regulation', 'active', '2021-01-01', '2030-12-31', 'high', 'Cap-and-trade system covering energy-intensive industries with increasing carbon pricing pressure', ARRAY['Linear reduction factor 2.2% annually', 'Market Stability Reserve mechanism', 'Free allocation phase-out', 'Carbon leakage protection'], 'https://climate.ec.europa.eu/eu-action/eu-emissions-trading-system-eu-ets_en'),
('Energy Savings Opportunity Scheme (ESOS)', 'Environment Agency', 'United Kingdom', 'Regulation', 'active', '2014-07-17', '2023-12-05', 'medium', 'Mandatory energy assessment and improvement identification for large UK companies', ARRAY['Energy audits every 4 years', 'Lead assessor requirements', 'Board level sign-off', 'Alternative compliance routes'], 'https://www.gov.uk/guidance/energy-savings-opportunity-scheme-esos'),
('Streamlined Energy and Carbon Reporting (SECR)', 'Department for Business, Energy & Industrial Strategy', 'United Kingdom', 'Regulation', 'active', '2019-04-01', '2019-04-01', 'medium', 'Mandatory annual reporting of energy consumption and carbon emissions for large companies', ARRAY['Annual energy and carbon reporting', 'Energy efficiency measures disclosure', 'Intensity metrics required', 'Previous year comparison'], 'https://www.gov.uk/government/consultations/streamlined-energy-and-carbon-reporting');

-- Link regulations to the Industrial Energy Efficiency theme
DO $$
DECLARE
    theme_uuid uuid;
BEGIN
    SELECT id INTO theme_uuid FROM public.themes WHERE name = 'Industrial Energy Efficiency & Optimisation';
    
    IF theme_uuid IS NOT NULL THEN
        INSERT INTO public.theme_regulations (theme_id, regulation_id, relevance_score, impact_description, criteria_impacts) 
        SELECT 
          theme_uuid,
          r.id,
          CASE r.title
            WHEN 'Energy Efficiency Directive (EED) 2023/1791' THEN 95
            WHEN 'Corporate Sustainability Reporting Directive (CSRD)' THEN 85
            WHEN 'EU Taxonomy Regulation' THEN 80
            WHEN 'Sustainable Finance Disclosure Regulation (SFDR)' THEN 70
            WHEN 'EU Emissions Trading System (EU ETS) - Phase 4' THEN 90
            WHEN 'Energy Savings Opportunity Scheme (ESOS)' THEN 75
            WHEN 'Streamlined Energy and Carbon Reporting (SECR)' THEN 65
          END,
          CASE r.title
            WHEN 'Energy Efficiency Directive (EED) 2023/1791' THEN 'Core driver for industrial energy efficiency investments and compliance solutions'
            WHEN 'Corporate Sustainability Reporting Directive (CSRD)' THEN 'Creates demand for energy reporting and management systems'
            WHEN 'EU Taxonomy Regulation' THEN 'Defines technical criteria for sustainable energy efficiency investments'
            WHEN 'Sustainable Finance Disclosure Regulation (SFDR)' THEN 'Drives ESG data requirements supporting efficiency solutions'
            WHEN 'EU Emissions Trading System (EU ETS) - Phase 4' THEN 'Carbon pricing creates economic incentive for efficiency improvements'
            WHEN 'Energy Savings Opportunity Scheme (ESOS)' THEN 'UK-specific compliance driver for energy audits and efficiency'
            WHEN 'Streamlined Energy and Carbon Reporting (SECR)' THEN 'UK reporting requirements supporting efficiency monitoring solutions'
          END,
          CASE r.title
            WHEN 'Energy Efficiency Directive (EED) 2023/1791' THEN ARRAY['A1', 'A2', 'C1', 'C2']
            WHEN 'Corporate Sustainability Reporting Directive (CSRD)' THEN ARRAY['A2', 'B2', 'C1']
            WHEN 'EU Taxonomy Regulation' THEN ARRAY['B2', 'C1']
            WHEN 'Sustainable Finance Disclosure Regulation (SFDR)' THEN ARRAY['A2', 'B2']
            WHEN 'EU Emissions Trading System (EU ETS) - Phase 4' THEN ARRAY['A1', 'A3', 'C2']
            WHEN 'Energy Savings Opportunity Scheme (ESOS)' THEN ARRAY['A2', 'C1']
            WHEN 'Streamlined Energy and Carbon Reporting (SECR)' THEN ARRAY['A2', 'B2']
          END
        FROM public.regulations r
        WHERE r.title IN (
          'Energy Efficiency Directive (EED) 2023/1791',
          'Corporate Sustainability Reporting Directive (CSRD)',
          'EU Taxonomy Regulation',
          'Sustainable Finance Disclosure Regulation (SFDR)',
          'EU Emissions Trading System (EU ETS) - Phase 4',
          'Energy Savings Opportunity Scheme (ESOS)',
          'Streamlined Energy and Carbon Reporting (SECR)'
        );
    END IF;
END $$;