-- Populate Recycling & Material Recovery theme
DO $$
DECLARE
  v_theme_id uuid;
  v_reg_id uuid;
BEGIN
  -- Find theme ID
  SELECT id INTO v_theme_id FROM public.taxonomy_themes WHERE name = 'Recycling & Material Recovery' LIMIT 1;
  IF v_theme_id IS NULL THEN
    RAISE EXCEPTION 'Theme "Recycling & Material Recovery" not found';
  END IF;

  -- 1) Update market data
  UPDATE public.taxonomy_themes
  SET 
    tam_value = 36.5,
    tam_currency = 'GBP',
    cagr_percentage = 5,
    cagr_period_start = 2024,
    cagr_period_end = 2030,
    market_maturity = 'Growth',
    updated_at = now()
  WHERE id = v_theme_id;

  -- 2) Insert detailed scores (valid values: 1,3,5)
  INSERT INTO public.detailed_scores (theme_id, criteria_id, score, confidence, notes, update_source, updated_at)
  VALUES
    (v_theme_id, (SELECT id FROM public.framework_criteria WHERE code = 'A1'), 5, 'Medium', 'TAM of €36.5bn significantly exceeds the €5bn threshold for "Expansive" market size.', 'manual', now()),
    (v_theme_id, (SELECT id FROM public.framework_criteria WHERE code = 'A2'), 5, 'Medium', 'SOM of €3bn substantially exceeds the €0.3bn threshold for "High Potential" platform revenue opportunity.', 'manual', now()),
    (v_theme_id, (SELECT id FROM public.framework_criteria WHERE code = 'A3'), 3, 'Medium', 'CAGR of 5% sits at the exact boundary between "Stagnant" and "Solid," qualifying for the 5-10% "Solid" growth category.', 'manual', now()),
    (v_theme_id, (SELECT id FROM public.framework_criteria WHERE code = 'A4'), 3, 'Medium', 'Transitioning maturity directly maps to the "Growth (mix of VC and early PE)" rubric definition for viable PE timing.', 'manual', now()),
    (v_theme_id, (SELECT id FROM public.framework_criteria WHERE code = 'B1'), 5, 'Medium', 'High fragmentation with top 3 players holding only 5% share indicates "Ideal Structure" with multiple platform options and extensive bolt-on pipeline.', 'manual', now()),
    (v_theme_id, (SELECT id FROM public.framework_criteria WHERE code = 'B2'), 3, 'Medium', 'Moderate moat strength aligns with "Competitive" environment where differentiation is possible through moderate switching costs or proprietary capabilities.', 'manual', now()),
    (v_theme_id, (SELECT id FROM public.framework_criteria WHERE code = 'B3'), 3, 'Medium', 'Viable exit quality directly corresponds to "Medium exit quality" with 2-5 relevant M&A transactions providing reasonable liquidity options.', 'manual', now()),
    (v_theme_id, (SELECT id FROM public.framework_criteria WHERE code = 'C1'), 1, 'Medium', 'Exactly 60% compliance-driven demand meets the threshold for "High Risk" where market depends heavily on policy stability.', 'manual', now()),
    (v_theme_id, (SELECT id FROM public.framework_criteria WHERE code = 'C2'), 3, 'Medium', 'Transitioning maturity with 5% CAGR and moderate regulatory support aligns with "Viable Timing" despite not reaching optimal growth thresholds.', 'manual', now()),
    (v_theme_id, (SELECT id FROM public.framework_criteria WHERE code = 'C3'), 3, 'Medium', 'Mixed demand drivers with majority compliance-based but significant ROI component creates "Moderate" cyclicality with some recession resilience from regulatory mandates.', 'manual', now()),
    (v_theme_id, (SELECT id FROM public.framework_criteria WHERE code = 'C4'), 3, 'Medium', 'Consistent MEDIUM confidence across all critical research tools (T0a, T0b, T1, T2) with no major data gaps qualifies as "Manageable Concerns."', 'manual', now());

  -- 3) Regulations
  -- Waste Framework Directive
  SELECT id INTO v_reg_id FROM public.regulations WHERE title = 'Directive 2008/98/EC – Waste Framework Directive' AND jurisdiction = 'EU' LIMIT 1;
  IF NOT FOUND THEN
    INSERT INTO public.regulations (title, description, jurisdiction, regulation_type, status, source_url, compliance_deadline, regulatory_body, key_provisions)
    VALUES (
      'Directive 2008/98/EC – Waste Framework Directive',
      'Establishes the waste hierarchy (prevention, reuse, recycling) and requires separate collection and recycling of key waste streams. It sets EU recycling targets (e.g. prepare-for-reuse and recycling of household-like waste ≥50% by 2020) and obliges Member States to enact EPR schemes for products (packaging, electronics, etc.).',
      'EU', 'waste_management', 'in_force',
      'https://eur-lex.europa.eu/eli/dir/2008/98/oj', '2020-12-31',
      'Directive 2008/98/EC',
      ARRAY['Waste hierarchy','50% recycling target','EPR schemes']
    ) RETURNING id INTO v_reg_id;
  END IF;
  INSERT INTO public.theme_regulations (theme_id, regulation_id, impact_description, relevance_score)
  SELECT v_theme_id, v_reg_id,
    'Creates assured market for recyclables and recyclers (through mandatory take-back and EPR fees) but also obliges waste producers to internalize recycling costs. Companies must invest in collection/recycling infrastructure or pay EPR fees, making recycling services a core part of business.',
    5
  WHERE NOT EXISTS (SELECT 1 FROM public.theme_regulations WHERE theme_id = v_theme_id AND regulation_id = v_reg_id);

  -- Packaging Regulation
  SELECT id INTO v_reg_id FROM public.regulations WHERE title = 'Regulation (EU) 2025/40 – Packaging and Packaging Waste' AND jurisdiction = 'EU' LIMIT 1;
  IF NOT FOUND THEN
    INSERT INTO public.regulations (title, description, jurisdiction, regulation_type, status, source_url, compliance_deadline, regulatory_body, key_provisions)
    VALUES (
      'Regulation (EU) 2025/40 – Packaging and Packaging Waste',
      'Introduces stricter rules on design-for-recycling, reuse and EPR for packaging. Requires Member States to implement deposit–return and reuse systems for beverage containers, limits overpackaging, and mandates that 100% of packaging be recyclable. Packaging producers face modulated EPR fees and must meet strict recycled-content or reuse targets.',
      'EU', 'packaging', 'in_force',
      'https://eur-lex.europa.eu/eli/reg/2025/40/oj/eng', '2026-08-12',
      'Regulation (EU) 2025/40',
      ARRAY['100% recyclable packaging','Deposit-return systems','EPR modulation']
    ) RETURNING id INTO v_reg_id;
  END IF;
  INSERT INTO public.theme_regulations (theme_id, regulation_id, impact_description, relevance_score)
  SELECT v_theme_id, v_reg_id,
    'Pressures producers to switch to recyclable or reusable packaging. Creates opportunities for recycling and materials recovery businesses (to meet the 100% recyclability goal) and for service providers of reuse systems. Non-compliance will incur penalties or higher EPR costs, affecting product pricing and ROI calculations.',
    5
  WHERE NOT EXISTS (SELECT 1 FROM public.theme_regulations WHERE theme_id = v_theme_id AND regulation_id = v_reg_id);

  -- Landfill Directive
  SELECT id INTO v_reg_id FROM public.regulations WHERE title = 'Council Directive 1999/31/EC – Landfill of Waste' AND jurisdiction = 'EU' LIMIT 1;
  IF NOT FOUND THEN
    INSERT INTO public.regulations (title, description, jurisdiction, regulation_type, status, source_url, compliance_deadline, regulatory_body, key_provisions)
    VALUES (
      'Council Directive 1999/31/EC – Landfill of Waste',
      'Strictly limits landfilling of recoverable waste. Requires Member States to reduce biowaste to 50% (of 1995 levels) and restrict the types of waste sent to landfill. Current law caps municipal waste to landfill at 10% by 2035. Essentially, any waste suitable for recycling must be diverted.',
      'EU', 'waste_management', 'in_force',
      'https://eur-lex.europa.eu/eli/dir/1999/31/oj', '2035-12-31',
      'Directive 1999/31/EC',
      ARRAY['10% landfill cap by 2035','Biowaste reduction','Diversion requirements']
    ) RETURNING id INTO v_reg_id;
  END IF;
  INSERT INTO public.theme_regulations (theme_id, regulation_id, impact_description, relevance_score)
  SELECT v_theme_id, v_reg_id,
    'Inhibits investment in landfill (increasing landfill tax/costs) and drives demand for recycling and energy-recovery facilities. In practice it means more recyclable materials must be processed, underpinning demand for waste processors and recyclers.',
    3
  WHERE NOT EXISTS (SELECT 1 FROM public.theme_regulations WHERE theme_id = v_theme_id AND regulation_id = v_reg_id);

  -- Batteries Regulation
  SELECT id INTO v_reg_id FROM public.regulations WHERE title = 'Regulation (EU) 2023/1542 – Batteries and Waste Batteries' AND jurisdiction = 'EU' LIMIT 1;
  IF NOT FOUND THEN
    INSERT INTO public.regulations (title, description, jurisdiction, regulation_type, status, source_url, compliance_deadline, regulatory_body, key_provisions)
    VALUES (
      'Regulation (EU) 2023/1542 – Batteries and Waste Batteries',
      'Establishes strict sustainability standards for all batteries and new EPR, extending the Waste Batteries Directive. Key points: mandatory recycled-content quotas (e.g. EV batteries require minimum recycled cobalt, lithium, lead by 2030); ''digital battery passport'' labelling for traceability; minimum design/labelling requirements; and very high recycling efficiencies.',
      'EU', 'product_stewardship', 'in_force',
      'https://eur-lex.europa.eu/eli/reg/2023/1542/oj/eng', '2025-01-28',
      'Regulation (EU) 2023/1542',
      ARRAY['Recycled-content quotas','Digital battery passport','High recycling efficiency']
    ) RETURNING id INTO v_reg_id;
  END IF;
  INSERT INTO public.theme_regulations (theme_id, regulation_id, impact_description, relevance_score)
  SELECT v_theme_id, v_reg_id,
    'Creates guaranteed supply of batteries and critical materials (Lead, Co, Li, Ni) to recyclers via legally mandated collection. Encourages investment in advanced recycling tech to meet the high targets. Also raises compliance costs for battery producers (must finance or carry out recycling), affecting battery product costs but fostering local recycling businesses.',
    5
  WHERE NOT EXISTS (SELECT 1 FROM public.theme_regulations WHERE theme_id = v_theme_id AND regulation_id = v_reg_id);

  -- Single-Use Plastics
  SELECT id INTO v_reg_id FROM public.regulations WHERE title = 'Directive (EU) 2019/904 – Single-Use Plastics (SUP) Directive' AND jurisdiction = 'EU' LIMIT 1;
  IF NOT FOUND THEN
    INSERT INTO public.regulations (title, description, jurisdiction, regulation_type, status, source_url, compliance_deadline, regulatory_body, key_provisions)
    VALUES (
      'Directive (EU) 2019/904 – Single-Use Plastics (SUP) Directive',
      'Bans and restricts various single-use plastic products (e.g. cutlery, cotton buds, oxo-degradable plastics banned from 2021). Sets measures to reduce plastic pollution: EPR schemes for fishing gear and tobacco filters; mandatory labelling of biodegradable plastics; targets to collect 90% of plastic beverage bottles by 2029; and minimum recycled PET content (25% by 2025) and PVC ban in bottles.',
      'EU', 'plastics', 'in_force', '', '2021-12-31',
      'Directive (EU) 2019/904',
      ARRAY['Single-use plastic bans','90% bottle collection','25% recycled PET content']
    ) RETURNING id INTO v_reg_id;
  END IF;
  INSERT INTO public.theme_regulations (theme_id, regulation_id, impact_description, relevance_score)
  SELECT v_theme_id, v_reg_id,
    'Forces substitution of single-use plastics with reusable or recycled alternatives. Opens markets for recycled plastic and alternatives (bio-plastics, glass/metal). Also imposes costs (e.g. deposit-scheme setup).',
    3
  WHERE NOT EXISTS (SELECT 1 FROM public.theme_regulations WHERE theme_id = v_theme_id AND regulation_id = v_reg_id);

  -- UK Environment Act
  SELECT id INTO v_reg_id FROM public.regulations WHERE title = 'UK Environment Act 2021' AND jurisdiction = 'UK' LIMIT 1;
  IF NOT FOUND THEN
    INSERT INTO public.regulations (title, description, jurisdiction, regulation_type, status, source_url, compliance_deadline, regulatory_body, key_provisions)
    VALUES (
      'UK Environment Act 2021',
      'Sets the UK''s waste & recycling framework. Key provisions relevant to recycling: binding national targets (e.g. household recycling ≥65% by 2035, fishery waste reduction), requirement for product stewardship (EPR) schemes for packaging, WEEE, batteries, vehicles; frameworks for deposit return schemes; restrictions on exports of plastic waste to non-OECD countries.',
      'UK', 'waste_management', 'in_force', '', '2035-12-31',
      'UK Environment Act 2021 (c.30)',
      ARRAY['65% recycling by 2035','EPR schemes','Plastic export restrictions']
    ) RETURNING id INTO v_reg_id;
  END IF;
  INSERT INTO public.theme_regulations (theme_id, regulation_id, impact_description, relevance_score)
  SELECT v_theme_id, v_reg_id,
    'Industries must adapt to UK-specific schemes. For instance, producers pay higher fees, so innovative reuse/recycling lowers costs. The Act creates new revenue for recyclers via mandatory schemes, but adds compliance cost (license fees, reporting).',
    5
  WHERE NOT EXISTS (SELECT 1 FROM public.theme_regulations WHERE theme_id = v_theme_id AND regulation_id = v_reg_id);

  -- German Packaging Act
  SELECT id INTO v_reg_id FROM public.regulations WHERE title = 'German Packaging Act (VerpackG, 2019)' AND jurisdiction = 'DE' LIMIT 1;
  IF NOT FOUND THEN
    INSERT INTO public.regulations (title, description, jurisdiction, regulation_type, status, source_url, compliance_deadline, regulatory_body, key_provisions)
    VALUES (
      'German Packaging Act (VerpackG, 2019)',
      'Implements EU Packaging Directive via national law. Main features: mandatory registration of producers with national authority (LUCID), compulsory participation in dual-system waste collection (EPR) for all packaging (including lightweight consumer packaging), and a deposit system for one-way beverage bottles and cans.',
      'DE', 'packaging', 'in_force', '', '2022-12-31',
      'VerpackG',
      ARRAY['LUCID registration','Dual-system EPR','Deposit system']
    ) RETURNING id INTO v_reg_id;
  END IF;
  INSERT INTO public.theme_regulations (theme_id, regulation_id, impact_description, relevance_score)
  SELECT v_theme_id, v_reg_id,
    'Packaging producers bear the cost of take-back via system fees, incentivizing lightweight or reusable designs. Established waste/recycling industry (like the Green Dot system) thrives under this law. New entrants face high fees, but opportunities exist in advanced sorting and recycling to meet targets.',
    5
  WHERE NOT EXISTS (SELECT 1 FROM public.theme_regulations WHERE theme_id = v_theme_id AND regulation_id = v_reg_id);

  -- French AGEC Law
  SELECT id INTO v_reg_id FROM public.regulations WHERE title = 'France Loi n°2020-105 (Anti-Gaspillage pour Économie Circulaire, AGEC)' AND jurisdiction = 'FR' LIMIT 1;
  IF NOT FOUND THEN
    INSERT INTO public.regulations (title, description, jurisdiction, regulation_type, status, source_url, compliance_deadline, regulatory_body, key_provisions)
    VALUES (
      'France Loi n°2020-105 (Anti-Gaspillage pour Économie Circulaire, AGEC)',
      'Broad circular-economy law covering waste and recycling. Highlights: bans plastic cups/cutlery by 2021, single-use plastics by 2040; mandates PAYT (pay-as-you-throw) schemes by 2025; significantly expands EPR (new categories like textiles, wood, furniture added); requires repairability labeling; increases recycled content requirements.',
      'FR', 'circular_economy', 'in_force', '', '2040-12-31',
      'Loi n°2020-105',
      ARRAY['Plastic bans by 2040','PAYT schemes','Expanded EPR categories']
    ) RETURNING id INTO v_reg_id;
  END IF;
  INSERT INTO public.theme_regulations (theme_id, regulation_id, impact_description, relevance_score)
  SELECT v_theme_id, v_reg_id,
    'French manufacturers and retailers have new obligations (e.g. financing separate collection). It encourages companies to produce durable, repairable goods. Recyclers benefit from handling new waste categories; However, administrative complexity and fees rise.',
    3
  WHERE NOT EXISTS (SELECT 1 FROM public.theme_regulations WHERE theme_id = v_theme_id AND regulation_id = v_reg_id);

END $$;
