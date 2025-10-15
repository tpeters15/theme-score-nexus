-- Populate Smart Grid & Demand Response theme (corrected, no invalid ON CONFLICT)
DO $$
DECLARE
  v_theme_id uuid;
  v_reg_id uuid;
BEGIN
  -- Find theme id exactly
  SELECT id INTO v_theme_id
  FROM public.taxonomy_themes
  WHERE name = 'Smart Grid & Demand Response'
  LIMIT 1;

  IF v_theme_id IS NULL THEN
    RAISE EXCEPTION 'Theme not found: Smart Grid & Demand Response';
  END IF;

  -- 1) Update market data (TRANSITIONING -> Growth per CHECK constraint)
  UPDATE public.taxonomy_themes
  SET 
    tam_value = 5.5,
    tam_currency = 'GBP',
    cagr_percentage = 10,
    cagr_period_start = 2024,
    cagr_period_end = 2030,
    market_maturity = 'Growth',
    updated_at = now()
  WHERE id = v_theme_id;

  -- 2) Insert detailed scores (allowed values: 1,3,5)
  INSERT INTO public.detailed_scores (theme_id, criteria_id, score, confidence, notes, update_source, updated_at)
  VALUES
    (v_theme_id, (SELECT id FROM public.framework_criteria WHERE code = 'A1' LIMIT 1), 5, 'Medium', 'TAM of €5.5bn exceeds the €5bn threshold for ''Expansive'' market size classification.', 'manual', now()),
    (v_theme_id, (SELECT id FROM public.framework_criteria WHERE code = 'A2' LIMIT 1), 5, 'Medium', 'SOM of €0.75bn significantly exceeds the €0.3bn threshold for ''High Potential'' revenue opportunity.', 'manual', now()),
    (v_theme_id, (SELECT id FROM public.framework_criteria WHERE code = 'A3' LIMIT 1), 3, 'Medium', 'CAGR of exactly 10% falls at the upper boundary of ''Solid'' growth, meeting but not exceeding the >10% threshold for ''Rapid.''', 'manual', now()),
    (v_theme_id, (SELECT id FROM public.framework_criteria WHERE code = 'A4' LIMIT 1), 3, 'Medium', 'Transitioning market maturity directly aligns with the ''Growth (mix of VC and early PE)'' classification for viable timing.', 'manual', now()),
    (v_theme_id, (SELECT id FROM public.framework_criteria WHERE code = 'B1' LIMIT 1), 5, 'Medium', 'High fragmentation with top 3 players holding only 19.3% share indicates ''Ideal Structure'' with multiple platform and bolt-on opportunities.', 'manual', now()),
    (v_theme_id, (SELECT id FROM public.framework_criteria WHERE code = 'B2' LIMIT 1), 3, 'Medium', 'Moderate moat strength suggests differentiation is possible with some switching costs or proprietary advantages, fitting ''Competitive'' classification.', 'manual', now()),
    (v_theme_id, (SELECT id FROM public.framework_criteria WHERE code = 'B3' LIMIT 1), 3, 'Medium', 'Viable exit quality directly corresponds to medium exit environment with 2-5 relevant M&A transactions in recent years.', 'manual', now()),
    (v_theme_id, (SELECT id FROM public.framework_criteria WHERE code = 'C1' LIMIT 1), 5, 'Medium', 'Only 30% compliance-driven demand falls well below the 40% threshold, indicating primarily ROI-driven market with low regulatory risk.', 'manual', now()),
    (v_theme_id, (SELECT id FROM public.framework_criteria WHERE code = 'C2' LIMIT 1), 3, 'Medium', 'Transitioning maturity with 10% CAGR and moderate regulatory support aligns with ''Viable Timing'' for PE investment.', 'manual', now()),
    (v_theme_id, (SELECT id FROM public.framework_criteria WHERE code = 'C3' LIMIT 1), 3, 'Medium', 'Mix of 70% ROI-driven and 30% compliance-driven demand creates moderate cyclicality with some essential regulatory underpinning.', 'manual', now()),
    (v_theme_id, (SELECT id FROM public.framework_criteria WHERE code = 'C4' LIMIT 1), 3, 'Medium', 'Medium confidence across available tools with no major data gaps represents manageable concerns for investment decision-making.', 'manual', now());

  -- 3) Regulations - upsert-like logic without unique constraint
  -- EU 2024/1747
  SELECT id INTO v_reg_id FROM public.regulations WHERE title = 'Regulation (EU) 2024/1747 – Improving Electricity Market Design' AND jurisdiction = 'EU' LIMIT 1;
  IF NOT FOUND THEN
    INSERT INTO public.regulations (title, description, jurisdiction, regulation_type, status, source_url, compliance_deadline, regulatory_body, key_provisions)
    VALUES (
      'Regulation (EU) 2024/1747 – Improving Electricity Market Design',
      'Updates EU power market rules to explicitly integrate demand response and storage. It mandates that NEMOs offer products with minimum bid sizes ≤100 kW by Jan 2026, requires TSOs/DSOs to develop peak-shaving demand-reduction products during price crises, and allows use of dedicated measurement devices for demand-response observability.',
      'EU',
      'market_design',
      'in_force',
      'https://eur-lex.europa.eu/legal-content/EN/ALL/?uri=OJ:L_2024_1747',
      '2026-01-31',
      'Regulation (EU) 2024/1747',
      ARRAY['Minimum bid sizes ≤100 kW by Jan 2026','Peak-shaving demand-reduction products','Dedicated measurement devices for DR']
    ) RETURNING id INTO v_reg_id;
  END IF;
  INSERT INTO public.theme_regulations (theme_id, regulation_id, impact_description, relevance_score)
  SELECT v_theme_id, v_reg_id,
    'Investors in DR/smart-grid assets should see increased guaranteed demand (e.g. system-operator contracts for peak reduction) and broader market access. The rules likely accelerate product development (metering, aggregator platforms) but also introduce compliance costs (meter-accuracy, regulatory filings).',
    5
  WHERE NOT EXISTS (
    SELECT 1 FROM public.theme_regulations WHERE theme_id = v_theme_id AND regulation_id = v_reg_id
  );

  -- EU 2024/1711
  SELECT id INTO v_reg_id FROM public.regulations WHERE title = 'Directive (EU) 2024/1711 – Electricity Market Design (Clean Energy Package Recast)' AND jurisdiction = 'EU' LIMIT 1;
  IF NOT FOUND THEN
    INSERT INTO public.regulations (title, description, jurisdiction, regulation_type, status, source_url, compliance_deadline, regulatory_body, key_provisions)
    VALUES (
      'Directive (EU) 2024/1711 – Electricity Market Design (Clean Energy Package Recast)',
      'Amends Electricity Market Directive 2019/944 to mandate consumer access and information. It ensures all final customers can participate in demand-response and energy sharing arrangements. It enshrines a new ''right to energy sharing'': households/SMEs may share self-generated renewable energy within local zones.',
      'EU',
      'market_design',
      'in_force',
      'https://eur-lex.europa.eu/eli/dir/2024/1711/oj/eng',
      '2026-01-17',
      'Directive (EU) 2024/1711',
      ARRAY['Consumer access to demand-response','Right to energy sharing','Households/SMEs renewable sharing']
    ) RETURNING id INTO v_reg_id;
  END IF;
  INSERT INTO public.theme_regulations (theme_id, regulation_id, impact_description, relevance_score)
  SELECT v_theme_id, v_reg_id,
    'Expands market base: utilities and startups can target fixed-price subscribers and prosumers for DR programs, whereas previously such customers might have been locked out. Energy-sharing rights may stimulate DER+storage cluster projects, raising demand for enabling platforms and tariff designs.',
    5
  WHERE NOT EXISTS (
    SELECT 1 FROM public.theme_regulations WHERE theme_id = v_theme_id AND regulation_id = v_reg_id
  );

  -- EU 2023/1791
  SELECT id INTO v_reg_id FROM public.regulations WHERE title = 'Directive (EU) 2023/1791 – Energy Efficiency (Recast)' AND jurisdiction = 'EU' LIMIT 1;
  IF NOT FOUND THEN
    INSERT INTO public.regulations (title, description, jurisdiction, regulation_type, status, source_url, compliance_deadline, regulatory_body, key_provisions)
    VALUES (
      'Directive (EU) 2023/1791 – Energy Efficiency (Recast)',
      'Recasts the Energy Efficiency Directive. All newly installed electricity meters must be remotely readable and interoperable, and existing non-communicative meters must be upgraded by Jan 2027 unless cost-prohibitive. It guarantees consumers'' access to consumption/billing data: information must be made available to designated energy service providers on request.',
      'EU',
      'energy_efficiency',
      'in_force',
      'https://eur-lex.europa.eu/eli/dir/2023/1791/oj/eng',
      '2027-01-31',
      'Directive (EU) 2023/1791',
      ARRAY['Smart meters remotely readable','Meter upgrades by Jan 2027','Consumer access to consumption data']
    ) RETURNING id INTO v_reg_id;
  END IF;
  INSERT INTO public.theme_regulations (theme_id, regulation_id, impact_description, relevance_score)
  SELECT v_theme_id, v_reg_id,
    'Substantial compliance effort for utilities (meter upgrades by 2027), but also a market driver: vendors of smart meters, IoT devices and data platforms will see growth. For investors, this greatly expands the potential user base for DR services, reducing a key barrier (lack of meter data).',
    5
  WHERE NOT EXISTS (
    SELECT 1 FROM public.theme_regulations WHERE theme_id = v_theme_id AND regulation_id = v_reg_id
  );

  -- DE Ninth Act
  SELECT id INTO v_reg_id FROM public.regulations WHERE title = 'Ninth Act Amending the Regionalization Act' AND jurisdiction = 'DE' LIMIT 1;
  IF NOT FOUND THEN
    INSERT INTO public.regulations (title, description, jurisdiction, regulation_type, status, source_url, compliance_deadline, regulatory_body, key_provisions)
    VALUES (
      'Ninth Act Amending the Regionalization Act',
      'Speeds up the smart-meter rollout in Germany. It streamlines approval processes and cedes some federal oversight. It introduces cost caps: installation of a smart meter gateway is capped at €30 for small consumers, with annual operating costs capped at €10. It reassigns cost burdens and allows meter gateways to be used for multiple purposes. It delays the consumer''s voluntary meter-installation ''right'' from immediate effect to 2025.',
      'DE',
      'infrastructure',
      'in_force',
      '',
      '2025-12-31',
      'Gesetz zum Neustart der Digitalisierung der Energiewende',
      ARRAY['Cost cap €30 for gateway installation','Annual operating costs capped at €10','Multi-purpose meter gateways']
    ) RETURNING id INTO v_reg_id;
  END IF;
  INSERT INTO public.theme_regulations (theme_id, regulation_id, impact_description, relevance_score)
  SELECT v_theme_id, v_reg_id,
    'Investors in German smart meter hardware/software see lighter regulatory burdens and firm cost frameworks. For DR businesses, the cap on meter costs and multi-use gateways improves ROI. However, the delay of voluntary rollout rights to 2025 tempers short-term market growth.',
    3
  WHERE NOT EXISTS (
    SELECT 1 FROM public.theme_regulations WHERE theme_id = v_theme_id AND regulation_id = v_reg_id
  );

END $$;