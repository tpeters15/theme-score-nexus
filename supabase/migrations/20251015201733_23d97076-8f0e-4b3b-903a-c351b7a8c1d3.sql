-- Populate Circular Logistics & Reverse Supply Chain theme
DO $$
DECLARE
  v_theme_id uuid;
  v_reg_id uuid;
BEGIN
  -- Find theme ID
  SELECT id INTO v_theme_id FROM public.taxonomy_themes WHERE name ILIKE '%Circular Logistics%' OR name ILIKE '%Reverse Supply%' LIMIT 1;
  IF v_theme_id IS NULL THEN
    RAISE EXCEPTION 'Circular Logistics & Reverse Supply Chain theme not found';
  END IF;

  -- 1) Update market data (EARLY = Emerging)
  UPDATE public.taxonomy_themes
  SET 
    tam_value = 5.6,
    tam_currency = 'GBP',
    cagr_percentage = 9.5,
    cagr_period_start = 2024,
    cagr_period_end = 2030,
    market_maturity = 'Emerging',
    updated_at = now()
  WHERE id = v_theme_id;

  -- 2) Insert detailed scores
  INSERT INTO public.detailed_scores (theme_id, criteria_id, score, confidence, notes, update_source, updated_at)
  VALUES
    (v_theme_id, (SELECT id FROM public.framework_criteria WHERE code = 'A1'), 5, 'Medium', 'TAM of €5.6bn exceeds the €5bn threshold for ''Expansive'' market size classification.', 'manual', now()),
    (v_theme_id, (SELECT id FROM public.framework_criteria WHERE code = 'A2'), 3, 'Medium', 'SOM of €0.2bn falls within the €0.1-0.3bn range for ''Sufficient'' platform revenue potential.', 'manual', now()),
    (v_theme_id, (SELECT id FROM public.framework_criteria WHERE code = 'A3'), 3, 'Medium', 'CAGR of 9.5% falls within the 5-10% range classified as ''Solid'' growth.', 'manual', now()),
    (v_theme_id, (SELECT id FROM public.framework_criteria WHERE code = 'A4'), 1, 'Medium', 'Early market maturity indicates VC-dominated environment, not yet PE-ready with established profitable companies.', 'manual', now()),
    (v_theme_id, (SELECT id FROM public.framework_criteria WHERE code = 'B1'), 5, 'Medium', 'High fragmentation with top 3 players holding only 10.7% share creates ideal structure for platform building and bolt-on acquisitions.', 'manual', now()),
    (v_theme_id, (SELECT id FROM public.framework_criteria WHERE code = 'B2'), 3, 'Medium', 'Moderate moat strength suggests differentiation is possible with some switching costs or proprietary advantages, but not multi-layered defensibility.', 'manual', now()),
    (v_theme_id, (SELECT id FROM public.framework_criteria WHERE code = 'B3'), 1, 'Medium', 'Constrained exit environment indicates limited M&A activity with fewer than 2 relevant deals in recent years, creating liquidity concerns.', 'manual', now()),
    (v_theme_id, (SELECT id FROM public.framework_criteria WHERE code = 'C1'), 5, 'Medium', 'With only 40% compliance-driven demand, the market is primarily ROI-driven and resilient to policy changes.', 'manual', now()),
    (v_theme_id, (SELECT id FROM public.framework_criteria WHERE code = 'C2'), 3, 'Medium', 'Early maturity with solid 9.5% CAGR and moderate regulatory support represents viable but not optimal timing for PE entry.', 'manual', now()),
    (v_theme_id, (SELECT id FROM public.framework_criteria WHERE code = 'C3'), 3, 'Medium', 'Mixed drivers with 40% regulatory mandates and 60% ROI-driven demand creates moderate cyclicality with some recession resilience.', 'manual', now()),
    (v_theme_id, (SELECT id FROM public.framework_criteria WHERE code = 'C4'), 3, 'Medium', 'Mix of medium to medium-high confidence across critical research tools with no major data gaps represents manageable research quality concerns.', 'manual', now());

  -- 3) Regulations
  -- Ecodesign Regulation
  SELECT id INTO v_reg_id FROM public.regulations WHERE title = 'Regulation (EU) 2024/1781 – Ecodesign for Sustainable Products' AND jurisdiction = 'EU' LIMIT 1;
  IF NOT FOUND THEN
    INSERT INTO public.regulations (title, description, jurisdiction, regulation_type, status, source_url, compliance_deadline, regulatory_body, key_provisions)
    VALUES (
      'Regulation (EU) 2024/1781 – Ecodesign for Sustainable Products',
      'Establishes mandatory ecodesign requirements for all products: durability, reparability, recycled content, energy and resource efficiency. Introduces the Digital Product Passport (DPP) for tracking product/material information. Requires member states to use these criteria in public procurement.',
      'EU', 'product_stewardship', 'in_force',
      'https://eur-lex.europa.eu/eli/reg/2024/1781/oj/eng',
      '2025-07-19',
      'Regulation (EU) 2024/1781',
      ARRAY['Durability & reparability','Digital Product Passport','Recycled content','Public procurement']
    ) RETURNING id INTO v_reg_id;
  END IF;
  INSERT INTO public.theme_regulations (theme_id, regulation_id, impact_description, relevance_score)
  SELECT v_theme_id, v_reg_id,
    'Firms must redesign products and supply chains to meet new design/labeling rules – e.g. guarantee spare parts, document material content, and facilitate end-of-life recycling. This increases compliance costs but also creates market opportunities for circular‐economy services.',
    5
  WHERE NOT EXISTS (SELECT 1 FROM public.theme_regulations WHERE theme_id = v_theme_id AND regulation_id = v_reg_id);

  -- Batteries Regulation
  SELECT id INTO v_reg_id FROM public.regulations WHERE title = 'Regulation (EU) 2023/1542 – Batteries Regulation' AND jurisdiction = 'EU' LIMIT 1;
  IF NOT FOUND THEN
    INSERT INTO public.regulations (title, description, jurisdiction, regulation_type, status, source_url, compliance_deadline, regulatory_body, key_provisions)
    VALUES (
      'Regulation (EU) 2023/1542 – Batteries Regulation',
      'Imposes new rules on the entire battery life-cycle. Key provisions include mandatory Digital Battery Passport, strict limits on hazardous substances, minimum recycled content, performance/durability standards, and expanded collection targets for portable, EV, and industrial batteries.',
      'EU', 'product_stewardship', 'in_force',
      'https://www.batteryregulation.eu/post/eu-battery-regulation',
      '2025-08-18',
      'Regulation (EU) 2023/1542',
      ARRAY['Digital Battery Passport','Hazardous substance limits','Recycled content','Collection targets']
    ) RETURNING id INTO v_reg_id;
  END IF;
  INSERT INTO public.theme_regulations (theme_id, regulation_id, impact_description, relevance_score)
  SELECT v_theme_id, v_reg_id,
    'Battery producers and OEMs must invest in traceability systems and in take-back/recycling partnerships. This creates compliance costs but also revenue streams (value from recovered metals) – shifting demand for services like battery remanufacturing and recycling infrastructure.',
    5
  WHERE NOT EXISTS (SELECT 1 FROM public.theme_regulations WHERE theme_id = v_theme_id AND regulation_id = v_reg_id);

  -- Packaging Proposal
  SELECT id INTO v_reg_id FROM public.regulations WHERE title = 'Proposal for a Regulation on Packaging and Packaging Waste' AND jurisdiction = 'EU' LIMIT 1;
  IF NOT FOUND THEN
    INSERT INTO public.regulations (title, description, jurisdiction, regulation_type, status, source_url, compliance_deadline, regulatory_body, key_provisions)
    VALUES (
      'Proposal for a Regulation on Packaging and Packaging Waste',
      'Seeks to consolidate and update the old Packaging Waste Directive. Introduces mandatory reuse targets, minimum recycled content, stricter recycling targets, and broader producer responsibility obligations. Harmonises rules on deposit-return systems and restricts over-packaging.',
      'EU', 'packaging', 'proposal',
      'https://eur-lex.europa.eu/eli/com/2022/677/oj',
      '2030-12-31',
      'COM(2022)677 final',
      ARRAY['Reuse targets','Recycled content','Stricter recycling','Deposit-return systems']
    ) RETURNING id INTO v_reg_id;
  END IF;
  INSERT INTO public.theme_regulations (theme_id, regulation_id, impact_description, relevance_score)
  SELECT v_theme_id, v_reg_id,
    'Companies handling packaging must overhaul packaging design and systems: transition to refillable/returnable packaging, invest in recycling technologies, and bear higher EPR fees if recycling rates are low. This raises capex but may lower material costs long-term.',
    5
  WHERE NOT EXISTS (SELECT 1 FROM public.theme_regulations WHERE theme_id = v_theme_id AND regulation_id = v_reg_id);

  -- Single-Use Plastics
  SELECT id INTO v_reg_id FROM public.regulations WHERE title = 'Directive (EU) 2019/904 – Single-Use Plastics (SUPD)' AND jurisdiction = 'EU' LIMIT 1;
  IF NOT FOUND THEN
    INSERT INTO public.regulations (title, description, jurisdiction, regulation_type, status, source_url, compliance_deadline, regulatory_body, key_provisions)
    VALUES (
      'Directive (EU) 2019/904 – Single-Use Plastics (SUPD)',
      'Bans certain single-use plastic items. Requires separate collection of 90% of plastic bottles by 2029, and extension of bottle deposit-return schemes. Member States must implement DRS for beverage containers by 2024 or achieve 90% collection by 2029.',
      'EU', 'plastics', 'in_force',
      'https://eur-lex.europa.eu/eli/dir/2019/904/oj',
      '2029-12-31',
      'Directive (EU) 2019/904',
      ARRAY['Single-use plastic bans','90% bottle collection','Deposit-return schemes']
    ) RETURNING id INTO v_reg_id;
  END IF;
  INSERT INTO public.theme_regulations (theme_id, regulation_id, impact_description, relevance_score)
  SELECT v_theme_id, v_reg_id,
    'Beverage producers and retailers must prepare for deposit-return (equipment, handling of returned bottles). Fast-food chains face bans on disposables. These rules mostly require shifts in supply-chain operations (less waste), rather than presenting new profit centers.',
    3
  WHERE NOT EXISTS (SELECT 1 FROM public.theme_regulations WHERE theme_id = v_theme_id AND regulation_id = v_reg_id);

  -- UK Packaging Waste
  SELECT id INTO v_reg_id FROM public.regulations WHERE title = 'UK: Producer Responsibility Obligations (Packaging Waste) Regulations 2023' AND jurisdiction = 'UK' LIMIT 1;
  IF NOT FOUND THEN
    INSERT INTO public.regulations (title, description, jurisdiction, regulation_type, status, source_url, compliance_deadline, regulatory_body, key_provisions)
    VALUES (
      'UK: Producer Responsibility Obligations (Packaging Waste) Regulations 2023',
      'Implements extended producer responsibility (EPR) for packaging in England, Wales and Northern Ireland. Producers must register and pay fees to cover recycling/disposal. Fees are modulated by recyclability and recycled content of packaging. Sets recovery targets for different materials by 2025.',
      'UK', 'packaging', 'in_force',
      'https://www.gov.uk/government/publications/uk-joint-policy-statement-on-extended-producer-responsibility-for-packaging',
      '2024-04-30',
      'Producer Responsibility Obligations (Packaging Waste) Regulations 2023',
      ARRAY['EPR fees','Modulated by recyclability','Recovery targets','Registration required']
    ) RETURNING id INTO v_reg_id;
  END IF;
  INSERT INTO public.theme_regulations (theme_id, regulation_id, impact_description, relevance_score)
  SELECT v_theme_id, v_reg_id,
    'Businesses in packaging and logistics must track all packaging flows and may see significant cost changes. It should accelerate investments in recyclable/reusable packaging. UK service providers will see a revenue boost through mandatory fees, while producers face higher costs if they do not redesign packaging.',
    5
  WHERE NOT EXISTS (SELECT 1 FROM public.theme_regulations WHERE theme_id = v_theme_id AND regulation_id = v_reg_id);

  -- German Packaging Act
  SELECT id INTO v_reg_id FROM public.regulations WHERE title = 'Germany: Packaging Act (Verpackungsgesetz, 2019)' AND jurisdiction = 'DE' LIMIT 1;
  IF NOT FOUND THEN
    INSERT INTO public.regulations (title, description, jurisdiction, regulation_type, status, source_url, compliance_deadline, regulatory_body, key_provisions)
    VALUES (
      'Germany: Packaging Act (Verpackungsgesetz, 2019)',
      'Extends EPR to all packaging. Producers must register in the LUCID registry and join a "dual system" for recycling. Mandatory deposit on single-use PET bottles. Sets recycling rates for packaging from businesses. From 2023, glass/coated paper must be sorted by color/material.',
      'DE', 'packaging', 'in_force', '',
      '2022-12-31',
      'Verpackungsgesetz (PakV)',
      ARRAY['LUCID registry','Dual system','PET deposit','Recycling rates']
    ) RETURNING id INTO v_reg_id;
  END IF;
  INSERT INTO public.theme_regulations (theme_id, regulation_id, impact_description, relevance_score)
  SELECT v_theme_id, v_reg_id,
    'Any logistics/infrastructure business in Germany must factor in high volumes of returns and material recovery. Foreign companies selling into Germany must join LUCID and pay system fees. The market is relatively stable but still growing with more products in EPR and higher targets.',
    5
  WHERE NOT EXISTS (SELECT 1 FROM public.theme_regulations WHERE theme_id = v_theme_id AND regulation_id = v_reg_id);

  -- French AGEC
  SELECT id INTO v_reg_id FROM public.regulations WHERE title = 'France: Anti-Waste for Circular Economy Law (Loi AGEC, No. 2020-105 of 10 Feb 2020)' AND jurisdiction = 'FR' LIMIT 1;
  IF NOT FOUND THEN
    INSERT INTO public.regulations (title, description, jurisdiction, regulation_type, status, source_url, compliance_deadline, regulatory_body, key_provisions)
    VALUES (
      'France: Anti-Waste for Circular Economy Law (Loi AGEC, No. 2020-105 of 10 Feb 2020)',
      'Comprehensive circular economy reform. Expanded EPR to new product categories. Introduced mandatory deposit-return for packaging. Set minimum recycled content targets. Banned destruction of unsold goods; mandated repairability and labeling. Strengthened selective collection.',
      'FR', 'circular_economy', 'in_force', '',
      '2025-12-31',
      'Loi No. 2020-105',
      ARRAY['Expanded EPR','Deposit-return','Recycled content targets','Ban on unsold goods destruction']
    ) RETURNING id INTO v_reg_id;
  END IF;
  INSERT INTO public.theme_regulations (theme_id, regulation_id, impact_description, relevance_score)
  SELECT v_theme_id, v_reg_id,
    'French companies must prepare for large-scale deposit schemes and meet high sorting targets, which involve IT systems and partnerships. Services enabling repair, reuse, and last-mile collection are seeing strong policy tailwinds. Companies using virgin materials face higher costs or taxes.',
    5
  WHERE NOT EXISTS (SELECT 1 FROM public.theme_regulations WHERE theme_id = v_theme_id AND regulation_id = v_reg_id);

END $$;
