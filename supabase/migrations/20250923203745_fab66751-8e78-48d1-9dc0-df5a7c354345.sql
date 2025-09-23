-- Insert the 6 regulatory instruments for industrial energy efficiency and optimization theme
-- Corrected relevance scores to be within 1-5 range

-- Insert regulations
INSERT INTO public.regulations (
  id,
  title,
  description,
  jurisdiction,
  regulation_type,
  status,
  impact_level,
  compliance_deadline,
  effective_date,
  regulatory_body,
  key_provisions
) VALUES 
  (
    gen_random_uuid(),
    'Energy Efficiency Directive (EED) Recast (EU/2023/1791)',
    'Mandatory Energy Management Systems (>85 TJ/yr) or Energy Audits (>10 TJ/yr). Creates non-discretionary demand for audits, EMS software, and implementation services.',
    'EU',
    'directive',
    'active',
    'high',
    '2027-10-31',
    '2025-10-01',
    'European Commission',
    ARRAY['Mandatory Energy Management Systems', 'Energy Audits for large companies', 'Implementation services requirements']
  ),
  (
    gen_random_uuid(),
    'Industrial Emissions Directive (IED) Recast (EU/2024/1785)',
    'Requires use of Best Available Techniques (BAT), including energy efficiency, in operating permits. Makes efficiency upgrades a condition of the license to operate, driving capital expenditure.',
    'EU',
    'directive',
    'active',
    'high',
    '2026-07-31',
    '2024-07-01',
    'European Commission',
    ARRAY['Best Available Techniques (BAT)', 'Energy efficiency requirements', 'Operating permit conditions']
  ),
  (
    gen_random_uuid(),
    'EU Emissions Trading System (ETS) (Directive 2003/87/EC, as amended)',
    'Cap and trade system imposing a direct cost on GHG emissions for large emitters. Monetizes inefficiency, creating a powerful financial incentive for abatement via efficiency.',
    'EU',
    'trading_scheme',
    'active',
    'high',
    NULL,
    '2005-01-01',
    'European Commission',
    ARRAY['Carbon pricing mechanism', 'Cap and trade system', 'Financial incentives for efficiency']
  ),
  (
    gen_random_uuid(),
    'Corporate Sustainability Reporting Directive (CSRD) (EU/2022/2464)',
    'Mandatory, audited reporting on sustainability matters, including energy, emissions (Scopes 1, 2, 3), and climate transition plans. Creates a massive, compliance-driven market for data collection, carbon accounting, and reporting software/services.',
    'EU',
    'reporting',
    'active',
    'high',
    '2025-12-31',
    '2024-01-01',
    'European Commission',
    ARRAY['Mandatory sustainability reporting', 'Scope 1, 2, 3 emissions reporting', 'Climate transition plans', 'Third-party assurance']
  ),
  (
    gen_random_uuid(),
    'UK Energy Savings Opportunity Scheme (ESOS)',
    'Mandatory energy audits for large UK undertakings, now with required public action plans and progress reports. Shifts focus from audit to implementation, driving demand for project management and delivery services.',
    'UK',
    'scheme',
    'active',
    'medium',
    '2027-12-31',
    '2019-12-01',
    'Environment Agency',
    ARRAY['Mandatory energy audits', 'Public action plans', 'Progress reporting', 'Implementation requirements']
  ),
  (
    gen_random_uuid(),
    'UK Emissions Trading Scheme (UK ETS)',
    'Standalone UK cap and trade system, mirroring the EU ETS mechanism. Creates a direct carbon cost for UK industrial operators, driving efficiency investments.',
    'UK',
    'trading_scheme',
    'active',
    'high',
    NULL,
    '2021-01-01',
    'UK Government',
    ARRAY['Carbon pricing for UK industry', 'Cap and trade mechanism', 'Efficiency investment incentives']
  );

-- Now link these regulations to the Industrial Energy Efficiency theme
-- We need to find the theme first and then create the relationships
DO $$
DECLARE
    theme_record RECORD;
    regulation_record RECORD;
BEGIN
    -- Find the Industrial Energy Efficiency theme
    SELECT * INTO theme_record 
    FROM themes 
    WHERE LOWER(name) LIKE '%industrial energy efficiency%' 
       OR LOWER(name) LIKE '%energy efficiency%'
    LIMIT 1;
    
    IF theme_record.id IS NOT NULL THEN
        -- Link each regulation to the theme with corrected relevance scores (1-5 scale)
        FOR regulation_record IN 
            SELECT id, title FROM regulations 
            WHERE title IN (
                'Energy Efficiency Directive (EED) Recast (EU/2023/1791)',
                'Industrial Emissions Directive (IED) Recast (EU/2024/1785)',
                'EU Emissions Trading System (ETS) (Directive 2003/87/EC, as amended)',
                'Corporate Sustainability Reporting Directive (CSRD) (EU/2022/2464)',
                'UK Energy Savings Opportunity Scheme (ESOS)',
                'UK Emissions Trading Scheme (UK ETS)'
            )
        LOOP
            INSERT INTO theme_regulations (
                theme_id,
                regulation_id,
                relevance_score,
                impact_description,
                criteria_impacts
            ) VALUES (
                theme_record.id,
                regulation_record.id,
                CASE 
                    WHEN regulation_record.title LIKE '%EED%' THEN 5
                    WHEN regulation_record.title LIKE '%IED%' THEN 5
                    WHEN regulation_record.title LIKE '%EU ETS%' THEN 4
                    WHEN regulation_record.title LIKE '%CSRD%' THEN 4
                    WHEN regulation_record.title LIKE '%ESOS%' THEN 4
                    WHEN regulation_record.title LIKE '%UK ETS%' THEN 4
                    ELSE 3
                END,
                CASE 
                    WHEN regulation_record.title LIKE '%EED%' THEN 'Creates non-discretionary demand for audits, EMS software, and implementation services.'
                    WHEN regulation_record.title LIKE '%IED%' THEN 'Makes efficiency upgrades a condition of the license to operate, driving capital expenditure.'
                    WHEN regulation_record.title LIKE '%EU ETS%' THEN 'Monetizes inefficiency, creating a powerful financial incentive for abatement via efficiency.'
                    WHEN regulation_record.title LIKE '%CSRD%' THEN 'Creates a massive, compliance-driven market for data collection, carbon accounting, and reporting software/services.'
                    WHEN regulation_record.title LIKE '%ESOS%' THEN 'Shifts focus from audit to implementation, driving demand for project management and delivery services.'
                    WHEN regulation_record.title LIKE '%UK ETS%' THEN 'Creates a direct carbon cost for UK industrial operators, driving efficiency investments.'
                    ELSE 'Regulatory impact on industrial energy efficiency activities.'
                END,
                ARRAY['energy_efficiency', 'regulatory_compliance', 'carbon_management']
            );
        END LOOP;
    END IF;
END $$;