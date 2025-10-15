-- Populate Smart Water Infrastructure & Analytics theme
DO $$
DECLARE
  v_theme_id uuid;
  v_reg_id uuid;
BEGIN
  -- Find theme ID
  SELECT id INTO v_theme_id FROM public.taxonomy_themes WHERE name ILIKE '%Smart Water%' LIMIT 1;
  IF v_theme_id IS NULL THEN
    RAISE EXCEPTION 'Smart Water Infrastructure & Analytics theme not found';
  END IF;

  -- 1) Update market data (TRANSITIONING = Growth)
  UPDATE public.taxonomy_themes
  SET 
    tam_value = 7.2,
    tam_currency = 'GBP',
    cagr_percentage = 13,
    cagr_period_start = 2024,
    cagr_period_end = 2030,
    market_maturity = 'Growth',
    updated_at = now()
  WHERE id = v_theme_id;

  -- 2) Insert detailed scores
  INSERT INTO public.detailed_scores (theme_id, criteria_id, score, confidence, notes, update_source, updated_at)
  VALUES
    (v_theme_id, (SELECT id FROM public.framework_criteria WHERE code = 'A1'), 5, 'Medium', 'TAM of €7.2bn exceeds the €5bn threshold for ''Expansive'' market size classification.', 'manual', now()),
    (v_theme_id, (SELECT id FROM public.framework_criteria WHERE code = 'A2'), 5, 'Medium', 'SOM of €0.7bn significantly exceeds the €0.3bn threshold for ''High Potential'' platform revenue opportunity.', 'manual', now()),
    (v_theme_id, (SELECT id FROM public.framework_criteria WHERE code = 'A3'), 5, 'Medium', 'CAGR of 13% exceeds the 10% threshold for ''Rapid'' growth classification.', 'manual', now()),
    (v_theme_id, (SELECT id FROM public.framework_criteria WHERE code = 'A4'), 3, 'Medium', 'Transitioning market maturity represents growth stage with mix of VC and early PE activity, fitting ''Transitioning'' classification.', 'manual', now()),
    (v_theme_id, (SELECT id FROM public.framework_criteria WHERE code = 'B1'), 3, 'Medium', 'Top 3 market share of 35% falls within the 30-60% range indicating moderate fragmentation with viable platform targets.', 'manual', now()),
    (v_theme_id, (SELECT id FROM public.framework_criteria WHERE code = 'B2'), 3, 'Medium', 'Moderate moat strength indicates medium competitive intensity with differentiation opportunities and moderate switching costs.', 'manual', now()),
    (v_theme_id, (SELECT id FROM public.framework_criteria WHERE code = 'B3'), 3, 'Medium', 'Viable exit quality indicates 2-5 relevant M&A transactions in recent years, providing adequate but not robust exit optionality.', 'manual', now()),
    (v_theme_id, (SELECT id FROM public.framework_criteria WHERE code = 'C1'), 5, 'Medium', '40% compliance-driven demand falls below the 40% threshold, indicating primarily ROI-driven market with low regulatory dependency risk.', 'manual', now()),
    (v_theme_id, (SELECT id FROM public.framework_criteria WHERE code = 'C2'), 3, 'Medium', 'Transitioning maturity with 13% CAGR and moderate regulatory support represents viable timing with manageable adoption risk.', 'manual', now()),
    (v_theme_id, (SELECT id FROM public.framework_criteria WHERE code = 'C3'), 3, 'Medium', 'Mixed demand drivers with 60% ROI-driven and 40% compliance-driven creates moderate cyclicality with some recession resilience.', 'manual', now()),
    (v_theme_id, (SELECT id FROM public.framework_criteria WHERE code = 'C4'), 3, 'Medium', 'Medium confidence across available tools with some data gaps (missing impact confidence) represents manageable concerns.', 'manual', now());

  -- 3) Regulations
  -- Drinking Water Directive
  SELECT id INTO v_reg_id FROM public.regulations WHERE title = 'Directive (EU) 2020/2184 – Drinking Water Directive (Recast)' AND jurisdiction = 'EU' LIMIT 1;
  IF NOT FOUND THEN
    INSERT INTO public.regulations (title, description, jurisdiction, regulation_type, status, source_url, compliance_deadline, regulatory_body, key_provisions)
    VALUES (
      'Directive (EU) 2020/2184 – Drinking Water Directive (Recast)',
      'Introduces a fully risk-based "water safety" approach across the supply chain, expands mandatory parameters (e.g. micropollutants, lead, chromium), and strengthens consumer information. It mandates annual reporting of consumption and quality data and requires Member States to assess leakage using the Infrastructure Leakage Index (ILI). Suppliers must provide consumers with detailed usage and quality information (e.g. via bills or apps).',
      'EU', 'water_quality', 'in_force',
      'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32020L2184',
      '2023-01-12',
      'Directive (EU) 2020/2184',
      ARRAY['Risk-based water safety','Annual reporting','Infrastructure Leakage Index','Consumer data access']
    ) RETURNING id INTO v_reg_id;
  END IF;
  INSERT INTO public.theme_regulations (theme_id, regulation_id, impact_description, relevance_score)
  SELECT v_theme_id, v_reg_id,
    'Water utilities must invest in smart meters, sensors and data platforms for risk assessments and consumer updates (creating market demand). Stricter water-quality parameters also drive demand for advanced treatment and monitoring technologies.',
    5
  WHERE NOT EXISTS (SELECT 1 FROM public.theme_regulations WHERE theme_id = v_theme_id AND regulation_id = v_reg_id);

  -- Water Framework Directive
  SELECT id INTO v_reg_id FROM public.regulations WHERE title = 'Directive (EU) 2000/60/EC – Water Framework Directive (WFD)' AND jurisdiction = 'EU' LIMIT 1;
  IF NOT FOUND THEN
    INSERT INTO public.regulations (title, description, jurisdiction, regulation_type, status, source_url, compliance_deadline, regulatory_body, key_provisions)
    VALUES (
      'Directive (EU) 2000/60/EC – Water Framework Directive (WFD)',
      'Mandates integrated management of all surface and groundwater, setting "good status" targets for 2027. Requires MS to establish monitoring networks for water bodies and include measures for water efficiency and leakage reduction. Encourages water reuse and cross-sector coordination.',
      'EU', 'water_quality', 'in_force',
      'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32000L0060',
      '2027-12-31',
      'Directive (EU) 2000/60/EC',
      ARRAY['Good status targets 2027','Monitoring networks','Water efficiency','Leakage reduction']
    ) RETURNING id INTO v_reg_id;
  END IF;
  INSERT INTO public.theme_regulations (theme_id, regulation_id, impact_description, relevance_score)
  SELECT v_theme_id, v_reg_id,
    'Wastewater and drinking-water utilities must invest in network monitoring to achieve WFD targets. Projects (in sensors, data analysis, modelling) are partly driven by WFD deadlines, although utilities often follow these for ROI as well.',
    3
  WHERE NOT EXISTS (SELECT 1 FROM public.theme_regulations WHERE theme_id = v_theme_id AND regulation_id = v_reg_id);

  -- NIS2 Directive
  SELECT id INTO v_reg_id FROM public.regulations WHERE title = 'Regulation (EU) 2022/2555 – NIS2 Directive (Cybersecurity for Critical Sectors)' AND jurisdiction = 'EU' LIMIT 1;
  IF NOT FOUND THEN
    INSERT INTO public.regulations (title, description, jurisdiction, regulation_type, status, source_url, compliance_deadline, regulatory_body, key_provisions)
    VALUES (
      'Regulation (EU) 2022/2555 – NIS2 Directive (Cybersecurity for Critical Sectors)',
      'Sets binding cyber-security standards for operators of essential services, explicitly including drinking-water and wastewater sectors. Entities must conduct risk assessments, ensure supply-chain security, implement incident reporting, and establish an overall governance framework for cyber resilience.',
      'EU', 'cybersecurity', 'in_force',
      'https://eur-lex.europa.eu/legal-content/EN/LSU/?uri=OJ:JOL_2022_333_R_0002',
      '2024-10-31',
      'Regulation (EU) 2022/2555',
      ARRAY['Risk assessments','Supply-chain security','Incident reporting','Cyber governance']
    ) RETURNING id INTO v_reg_id;
  END IF;
  INSERT INTO public.theme_regulations (theme_id, regulation_id, impact_description, relevance_score)
  SELECT v_theme_id, v_reg_id,
    'Increases demand for IT security products/services tailored to IoT sensors and SCADA systems in water infrastructure. Compliance costs (audits, training) are substantial but create upselling opportunities for cybersecurity firms.',
    5
  WHERE NOT EXISTS (SELECT 1 FROM public.theme_regulations WHERE theme_id = v_theme_id AND regulation_id = v_reg_id);

  -- Water Reuse Regulation
  SELECT id INTO v_reg_id FROM public.regulations WHERE title = 'Regulation (EU) 2020/741 – Minimum Requirements for Water Reuse' AND jurisdiction = 'EU' LIMIT 1;
  IF NOT FOUND THEN
    INSERT INTO public.regulations (title, description, jurisdiction, regulation_type, status, source_url, compliance_deadline, regulatory_body, key_provisions)
    VALUES (
      'Regulation (EU) 2020/741 – Minimum Requirements for Water Reuse',
      'Harmonises quality standards for reclaimed (treated wastewater) use in agricultural irrigation. Sets strict microbiological and chemical parameter limits and monitoring obligations, including use of advanced treatment processes.',
      'EU', 'water_reuse', 'in_force',
      'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32020R0741',
      '2023-06-26',
      'Regulation (EU) 2020/741',
      ARRAY['Quality standards','Microbiological limits','Advanced treatment','Monitoring obligations']
    ) RETURNING id INTO v_reg_id;
  END IF;
  INSERT INTO public.theme_regulations (theme_id, regulation_id, impact_description, relevance_score)
  SELECT v_theme_id, v_reg_id,
    'Promotes investment in smart treatment plants and sensors to ensure compliance. Creates new markets for analytics (e.g., predicting treatment performance) and networks linking urban wastewater and irrigation systems.',
    3
  WHERE NOT EXISTS (SELECT 1 FROM public.theme_regulations WHERE theme_id = v_theme_id AND regulation_id = v_reg_id);

  -- EU Data Act
  SELECT id INTO v_reg_id FROM public.regulations WHERE title = 'Regulation (EU) 2023/X? – EU Data Act (Data Sharing and Access)' AND jurisdiction = 'EU' LIMIT 1;
  IF NOT FOUND THEN
    INSERT INTO public.regulations (title, description, jurisdiction, regulation_type, status, source_url, compliance_deadline, regulatory_body, key_provisions)
    VALUES (
      'Regulation (EU) 2023/X? – EU Data Act (Data Sharing and Access)',
      'Will require that IoT device-generated data (including from industrial sensors) be shareable between companies and customers. Establishes cloud-to-cloud data portability rights and rules for non-personal data sharing driven by public interest (and possibly critical infra uses).',
      'EU', 'data_governance', 'proposal', '',
      '2027-12-31',
      'Regulation (EU) 2023/X?',
      ARRAY['IoT data sharing','Cloud-to-cloud portability','Public interest data']
    ) RETURNING id INTO v_reg_id;
  END IF;
  INSERT INTO public.theme_regulations (theme_id, regulation_id, impact_description, relevance_score)
  SELECT v_theme_id, v_reg_id,
    'Could spur new business models where water usage data collected by utilities or device makers is shared with analytics companies or regulators. May impose change in how sensor vendors design data platforms (should be data-portable).',
    3
  WHERE NOT EXISTS (SELECT 1 FROM public.theme_regulations WHERE theme_id = v_theme_id AND regulation_id = v_reg_id);

  -- German TrinkwV
  SELECT id INTO v_reg_id FROM public.regulations WHERE title = 'Germany: Trinkwasserverordnung (TrinkwV) 2023' AND jurisdiction = 'DE' LIMIT 1;
  IF NOT FOUND THEN
    INSERT INTO public.regulations (title, description, jurisdiction, regulation_type, status, source_url, compliance_deadline, regulatory_body, key_provisions)
    VALUES (
      'Germany: Trinkwasserverordnung (TrinkwV) 2023',
      'Aligns German law with the EU Drinking Water Directive recast. Introduces risk-based water-supply management, new parameters (e.g. lead, chromium, arsenic limits tightened), digital reporting obligations to authorities, and requires removal of lead pipes (max 2030). Water suppliers must assess and report leakage and keep digital records.',
      'DE', 'water_quality', 'in_force',
      'https://www.recht.bund.de/bgbl/1/2023/159/VO.html',
      '2023-06-24',
      'Trinkwasserverordnung (TrinkwV) 2023',
      ARRAY['Risk-based management','Lead pipe removal by 2030','Digital reporting','Leakage assessment']
    ) RETURNING id INTO v_reg_id;
  END IF;
  INSERT INTO public.theme_regulations (theme_id, regulation_id, impact_description, relevance_score)
  SELECT v_theme_id, v_reg_id,
    'German water firms are upgrading systems: install smart sensors and analytics for leak detection, remote monitoring, and compliance reporting. Cleantech firms see significant business opportunities (e.g. leak-detection drones/sensors, lab-on-chip monitoring).',
    5
  WHERE NOT EXISTS (SELECT 1 FROM public.theme_regulations WHERE theme_id = v_theme_id AND regulation_id = v_reg_id);

  -- French Water Law
  SELECT id INTO v_reg_id FROM public.regulations WHERE title = 'France: Loi n°2022-1538 du 23 décembre 2022 (Eau)' AND jurisdiction = 'FR' LIMIT 1;
  IF NOT FOUND THEN
    INSERT INTO public.regulations (title, description, jurisdiction, regulation_type, status, source_url, compliance_deadline, regulatory_body, key_provisions)
    VALUES (
      'France: Loi n°2022-1538 du 23 décembre 2022 (Eau)',
      'Implements the EU Drinking Water Directive. Introduces consumer right to water under Constitutional-level right, enforces stricter quality controls, and updates reporting rules. Utilities must deploy risk-based management, monitor advanced parameters, and provide digital access to quality/consumption data. An example measure (Arrêté FCEC9600130A) mandates annual water invoice content and digital access.',
      'FR', 'water_quality', 'in_force', '',
      '2023-01-31',
      'Loi n°2022-1538 du 23 décembre 2022',
      ARRAY['Constitutional right to water','Risk-based management','Digital data access','Annual invoicing']
    ) RETURNING id INTO v_reg_id;
  END IF;
  INSERT INTO public.theme_regulations (theme_id, regulation_id, impact_description, relevance_score)
  SELECT v_theme_id, v_reg_id,
    'Stimulates demand in France for customer-facing analytics platforms and smart metering solutions, as utilities must digitize billing and quality info. Encourages public-private data initiatives (e.g. open data platforms).',
    3
  WHERE NOT EXISTS (SELECT 1 FROM public.theme_regulations WHERE theme_id = v_theme_id AND regulation_id = v_reg_id);

  -- UK Environment Act
  SELECT id INTO v_reg_id FROM public.regulations WHERE title = 'United Kingdom: Environment Act 2021 (Part 5: Water)' AND jurisdiction = 'UK' LIMIT 1;
  IF NOT FOUND THEN
    INSERT INTO public.regulations (title, description, jurisdiction, regulation_type, status, source_url, compliance_deadline, regulatory_body, key_provisions)
    VALUES (
      'United Kingdom: Environment Act 2021 (Part 5: Water)',
      'Establishes Env. Agency oversight, statutory water quality targets, and duties on water companies to manage resources. Introduces a duty to promote resilience (e.g. reduced leakage, abstraction control) and powers to mandate metering. Ofwat also introduced a £100M+ Water Efficiency Fund (2023) to incentivize smart meters.',
      'UK', 'water_quality', 'in_force',
      'https://www.legislation.gov.uk/ukpga/2021/30/part/5/enacted',
      '2025-12-31',
      'Environment Act 2021 (Part 5: Water)',
      ARRAY['Water quality targets','Leakage reduction','Smart meter mandate','£100M+ efficiency fund']
    ) RETURNING id INTO v_reg_id;
  END IF;
  INSERT INTO public.theme_regulations (theme_id, regulation_id, impact_description, relevance_score)
  SELECT v_theme_id, v_reg_id,
    'Creates a supportive environment (subsidies + targets) for smart water products in UK. Investors see lower market risk; clients can get partial funding (e.g. England''s Water Efficiency Fund) for smart meter rollouts. Potential future mandates may force uptake.',
    3
  WHERE NOT EXISTS (SELECT 1 FROM public.theme_regulations WHERE theme_id = v_theme_id AND regulation_id = v_reg_id);

END $$;
