-- Populate Building Retrofits theme
DO $$
DECLARE
  v_theme_id uuid;
  v_reg_id uuid;
BEGIN
  -- Find theme ID
  SELECT id INTO v_theme_id FROM public.taxonomy_themes WHERE name ILIKE '%Building Retrofit%' LIMIT 1;
  IF v_theme_id IS NULL THEN
    RAISE EXCEPTION 'Building Retrofits theme not found';
  END IF;

  -- 1) Update market data (EARLY maturity = Emerging)
  UPDATE public.taxonomy_themes
  SET 
    tam_value = 230,
    tam_currency = 'GBP',
    cagr_percentage = 10,
    cagr_period_start = 2024,
    cagr_period_end = 2030,
    market_maturity = 'Emerging',
    updated_at = now()
  WHERE id = v_theme_id;

  -- 2) Insert detailed scores
  INSERT INTO public.detailed_scores (theme_id, criteria_id, score, confidence, notes, update_source, updated_at)
  VALUES
    (v_theme_id, (SELECT id FROM public.framework_criteria WHERE code = 'A1'), 5, 'Medium', '€230bn significantly exceeds the €5bn threshold for ''Expansive'' market size', 'manual', now()),
    (v_theme_id, (SELECT id FROM public.framework_criteria WHERE code = 'A2'), 5, 'Medium', '€6.1bn PE-addressable SOM far exceeds the €0.3bn threshold for ''High Potential'' revenue opportunity', 'manual', now()),
    (v_theme_id, (SELECT id FROM public.framework_criteria WHERE code = 'A3'), 3, 'Medium', '10% CAGR sits at the boundary between ''Solid'' (5-10%) and ''Rapid'' (>10%), scoring as solid growth', 'manual', now()),
    (v_theme_id, (SELECT id FROM public.framework_criteria WHERE code = 'A4'), 1, 'Medium', 'Early market maturity indicates VC-dominated environment, not yet PE-ready with multiple profitable companies', 'manual', now()),
    (v_theme_id, (SELECT id FROM public.framework_criteria WHERE code = 'B1'), 5, 'Medium', 'High fragmentation with top 3 holding only 17% share creates ideal structure for platform building and bolt-on acquisitions', 'manual', now()),
    (v_theme_id, (SELECT id FROM public.framework_criteria WHERE code = 'B2'), 3, 'Medium', 'Moderate moat strength suggests differentiation is possible with some switching costs or proprietary advantages, but not multi-layered protection', 'manual', now()),
    (v_theme_id, (SELECT id FROM public.framework_criteria WHERE code = 'B3'), 3, 'Medium', 'Viable exit quality indicates 2-5 relevant M&A transactions, providing adequate but not robust liquidity options', 'manual', now()),
    (v_theme_id, (SELECT id FROM public.framework_criteria WHERE code = 'C1'), 1, 'Medium', '60% compliance-driven demand meets the threshold for high regulatory dependency risk, making the market vulnerable to policy changes', 'manual', now()),
    (v_theme_id, (SELECT id FROM public.framework_criteria WHERE code = 'C2'), 3, 'Medium', 'Early maturity with solid 10% growth and strong regulatory support represents viable timing despite not being optimal PE-ready conditions', 'manual', now()),
    (v_theme_id, (SELECT id FROM public.framework_criteria WHERE code = 'C3'), 3, 'Medium', 'Mixed drivers with majority compliance-based provide moderate recession resilience through regulatory mandates, though 40% ROI-driven creates some cyclical exposure', 'manual', now()),
    (v_theme_id, (SELECT id FROM public.framework_criteria WHERE code = 'C4'), 3, 'Medium', 'Mix of medium to medium-high confidence across key research areas represents manageable concerns without major data gaps', 'manual', now());

  -- 3) Regulations
  -- EPBD Directive
  SELECT id INTO v_reg_id FROM public.regulations WHERE title = 'Directive (EU) 2024/1275 – Energy Performance of Buildings (Recast)' AND jurisdiction = 'EU' LIMIT 1;
  IF NOT FOUND THEN
    INSERT INTO public.regulations (title, description, jurisdiction, regulation_type, status, source_url, compliance_deadline, regulatory_body, key_provisions)
    VALUES (
      'Directive (EU) 2024/1275 – Energy Performance of Buildings (Recast)',
      'Sets a roadmap to decarbonise EU building stock by 2050. Key elements include mandatory long-term renovation strategies (2030/2040/2050 targets), phasing out fossil-fuel heating (no new combustion boilers by 2040), and minimum requirements for renovated buildings.',
      'EU', 'building_energy', 'in_force',
      'https://eur-lex.europa.eu/legal-content/EN/LSU/?uri=oj%3AL_202401275',
      '2026-05-31',
      'Directive (EU) 2024/1275',
      ARRAY['2030/2040/2050 renovation targets','Phase out fossil-fuel heating','Minimum renovation requirements']
    ) RETURNING id INTO v_reg_id;
  END IF;
  INSERT INTO public.theme_regulations (theme_id, regulation_id, impact_description, relevance_score)
  SELECT v_theme_id, v_reg_id,
    'Retrofit demand will be heavily compliance-driven. Investors can expect increased market demand for deep renovations and renewable heating solutions. However, compliance costs (for e.g. solar installations or boiler replacements) will rise, and projects may depend on subsidies/tax breaks to be viable.',
    5
  WHERE NOT EXISTS (SELECT 1 FROM public.theme_regulations WHERE theme_id = v_theme_id AND regulation_id = v_reg_id);

  -- Energy Efficiency Directive
  SELECT id INTO v_reg_id FROM public.regulations WHERE title = 'Directive (EU) 2023/1791 – Energy Efficiency (Recast EED)' AND jurisdiction = 'EU' LIMIT 1;
  IF NOT FOUND THEN
    INSERT INTO public.regulations (title, description, jurisdiction, regulation_type, status, source_url, compliance_deadline, regulatory_body, key_provisions)
    VALUES (
      'Directive (EU) 2023/1791 – Energy Efficiency (Recast EED)',
      'Imposes a binding EU target of –11.7% final energy consumption by 2030 (relative to 2020) and increases required annual savings (rising to ~1.9% pa by 2028). Extends the existing 3% public-building renovation obligation: all levels of public administration must renovate 3% of public building floor area per year.',
      'EU', 'energy_efficiency', 'in_force',
      'https://eur-lex.europa.eu/eli/dir/2023/1791/oj',
      '2025-09-30',
      'Directive (EU) 2023/1791',
      ARRAY['11.7% energy reduction by 2030','3% public building renovation','1.9% annual savings by 2028']
    ) RETURNING id INTO v_reg_id;
  END IF;
  INSERT INTO public.theme_regulations (theme_id, regulation_id, impact_description, relevance_score)
  SELECT v_theme_id, v_reg_id,
    'Public buildings (schools, hospitals, offices) will see mandated retrofits, stimulating work for retrofit contractors. Private sector firms may face new costs (audits, efficiency upgrades). Overall, the directive increases market demand for energy-saving upgrades and justifies financing schemes.',
    5
  WHERE NOT EXISTS (SELECT 1 FROM public.theme_regulations WHERE theme_id = v_theme_id AND regulation_id = v_reg_id);

  -- Taxonomy Regulation
  SELECT id INTO v_reg_id FROM public.regulations WHERE title = 'Regulation (EU) 2020/852 – Sustainable Finance Taxonomy' AND jurisdiction = 'EU' LIMIT 1;
  IF NOT FOUND THEN
    INSERT INTO public.regulations (title, description, jurisdiction, regulation_type, status, source_url, compliance_deadline, regulatory_body, key_provisions)
    VALUES (
      'Regulation (EU) 2020/852 – Sustainable Finance Taxonomy',
      'Defines criteria for "sustainable" economic activities. For building retrofits, it sets energy-performance thresholds: e.g. major renovations must cut primary energy demand by ≥30% (or achieve EPC A/B) to qualify as "climate mitigation" investments.',
      'EU', 'sustainable_finance', 'in_force',
      'https://eur-lex.europa.eu/eli/reg/2020/852/oj',
      '2020-07-12',
      'Regulation (EU) 2020/852',
      ARRAY['30% energy reduction threshold','EPC A/B requirements','Climate mitigation criteria']
    ) RETURNING id INTO v_reg_id;
  END IF;
  INSERT INTO public.theme_regulations (theme_id, regulation_id, impact_description, relevance_score)
  SELECT v_theme_id, v_reg_id,
    'Affects project economics: retrofit projects designed to meet Taxonomy criteria may access cheaper capital or subsidies. Conversely, projects failing the criteria may be harder to finance as sustainable investments. Investors will use these standards to underwrite projects.',
    3
  WHERE NOT EXISTS (SELECT 1 FROM public.theme_regulations WHERE theme_id = v_theme_id AND regulation_id = v_reg_id);

  -- German GEG
  SELECT id INTO v_reg_id FROM public.regulations WHERE title = 'Gebäudeenergiegesetz (GEG) 2020 – Germany (Building Energy Act)' AND jurisdiction = 'DE' LIMIT 1;
  IF NOT FOUND THEN
    INSERT INTO public.regulations (title, description, jurisdiction, regulation_type, status, source_url, compliance_deadline, regulatory_body, key_provisions)
    VALUES (
      'Gebäudeenergiegesetz (GEG) 2020 – Germany (Building Energy Act)',
      'Consolidates prior German laws. Mandates specific energy standards for new and renovated buildings and requires a minimum share of renewable heating: new residential buildings must supply ≥65% of heat from RES and ≥15% from RES overall. As of 2023 all new appropriate rooftops must be fitted with solar PV.',
      'DE', 'building_energy', 'in_force', '',
      '2020-11-01',
      'Gebäudeenergiegesetz (GEG) 2020',
      ARRAY['65% renewable heating','15% overall RES','Solar PV on new rooftops']
    ) RETURNING id INTO v_reg_id;
  END IF;
  INSERT INTO public.theme_regulations (theme_id, regulation_id, impact_description, relevance_score)
  SELECT v_theme_id, v_reg_id,
    'German investments in retrofits must account for GEG standards. In practice, subsidy programs will be geared to these criteria. For investors, this means a large guaranteed market in Germany – but also significant compliance costs. Retrofit projects failing to meet GEG criteria cannot proceed without penalties.',
    5
  WHERE NOT EXISTS (SELECT 1 FROM public.theme_regulations WHERE theme_id = v_theme_id AND regulation_id = v_reg_id);

  -- UK EPC Regulations
  SELECT id INTO v_reg_id FROM public.regulations WHERE title = 'The Energy Efficiency (Private Rented Property) (England and Wales) (Amendment) Regulations 2022' AND jurisdiction = 'UK' LIMIT 1;
  IF NOT FOUND THEN
    INSERT INTO public.regulations (title, description, jurisdiction, regulation_type, status, source_url, compliance_deadline, regulatory_body, key_provisions)
    VALUES (
      'The Energy Efficiency (Private Rented Property) (England and Wales) (Amendment) Regulations 2022',
      'Raises minimum EPC requirements for privately rented properties. Landlords must ensure that any new or renewed domestic tenancy has at least an EPC rating of E (from 1 April 2023). It also brings forward the ban on F/G ratings: homes offered on rent must now be no worse than E.',
      'UK', 'building_energy', 'in_force', '',
      '2023-04-01',
      'UK Statutory Instrument 2022',
      ARRAY['Minimum EPC rating E','Ban on F/G ratings','Applies to private rentals']
    ) RETURNING id INTO v_reg_id;
  END IF;
  INSERT INTO public.theme_regulations (theme_id, regulation_id, impact_description, relevance_score)
  SELECT v_theme_id, v_reg_id,
    'Investors targeting UK social housing or rental portfolios must plan upgrades to meet these standards. It creates steady retrofit demand in the private rental market. On the flip side, it adds compliance risk: landlords who fail to upgrade can be fined.',
    3
  WHERE NOT EXISTS (SELECT 1 FROM public.theme_regulations WHERE theme_id = v_theme_id AND regulation_id = v_reg_id);

  -- French Climate Law
  SELECT id INTO v_reg_id FROM public.regulations WHERE title = 'Loi n° 2021-1104 (France) – Climat & Résilience' AND jurisdiction = 'FR' LIMIT 1;
  IF NOT FOUND THEN
    INSERT INTO public.regulations (title, description, jurisdiction, regulation_type, status, source_url, compliance_deadline, regulatory_body, key_provisions)
    VALUES (
      'Loi n° 2021-1104 (France) – Climat & Résilience',
      'Implements multiple building-related reforms. Key elements include a progressive ban on energy-inefficient properties: sales of F- and G-rated dwellings will be prohibited (F from 2025, G from 2028), and rental properties must reach class E by 2025 (D by 2034, C by 2040).',
      'FR', 'building_energy', 'in_force', '',
      '2021-08-22',
      'Loi n° 2021-1104',
      ARRAY['Ban F/G-rated sales','Rental upgrades to E/D/C','Progressive compliance timeline']
    ) RETURNING id INTO v_reg_id;
  END IF;
  INSERT INTO public.theme_regulations (theme_id, regulation_id, impact_description, relevance_score)
  SELECT v_theme_id, v_reg_id,
    'Creates large retrofit demand, especially in the private residential sector. Landlords and owners will need to invest in insulation, new heating systems, etc., to comply. The law''s stringent requirements increase project viability but also raise risk if owners delay funding upgrades.',
    5
  WHERE NOT EXISTS (SELECT 1 FROM public.theme_regulations WHERE theme_id = v_theme_id AND regulation_id = v_reg_id);

END $$;
