-- Step 3: Update detailed scores for Sustainable Materials & Packaging theme
-- Theme ID: d6e00aaa-c4d2-461d-b7cb-df596ad444af

-- Category A: Market Attractiveness
INSERT INTO detailed_scores (theme_id, criteria_id, score, confidence, notes, update_source, updated_by)
VALUES
(
  'd6e00aaa-c4d2-461d-b7cb-df596ad444af',
  'e4613835-f637-49e8-99f1-57d6894cc990', -- A1: TAM
  5,
  'Medium',
  'Total European TAM of £42.0bn (EU27+UK, 2024) across all packaging segments. Capital-efficient subset (excluding commodity manufacturing, infrastructure ownership, and bulk recycling) estimated at £4.2bn, encompassing bio-materials manufacturing (£10-15bn addressable), digital marketplace/SaaS (£2-4bn), sustainability software/traceability (£1-2bn), and consulting/design services (£2-3bn). Asset-light segments (SaaS, software, consulting) offer ~£5-9bn accessible TAM with 70-90% gross margins. Firmly in >£5bn bracket despite capital-efficiency filter.',
  'manual',
  auth.uid()
),
(
  'd6e00aaa-c4d2-461d-b7cb-df596ad444af',
  '975d1dff-0048-498e-8259-0aadcf152b8e', -- A2: SOM/Platform Potential
  5,
  'Medium',
  'PE-addressable SOM of £0.6bn with ~50 platform-sized targets (£12-40M revenue potential) identified across Germany (15-20 firms), UK (10-15), France (8-12), and Nordics (5-8). Fragmented structure with Top 3 market share only 8% creates abundant consolidation opportunities. Platform archetypes: Digital Marketplace/SaaS (£2-4bn TAM, 80-90% margins), Sustainability Software (£1-2bn TAM, 80-90% margins), Bio-materials Manufacturing (£10-15bn TAM, 30-50% margins conditional on proven tech), and Consulting Services (£2-3bn TAM, 30-50% margins). Buy-and-build thesis targeting 2.5x MOIC, 22% IRR through 3-5 add-ons at 6-8x EBITDA entry.',
  'manual',
  auth.uid()
),
(
  'd6e00aaa-c4d2-461d-b7cb-df596ad444af',
  'd33eecd5-7f34-425a-92eb-138487e882dd', -- A3: CAGR
  3,
  'High',
  'Market growing at 5.5% CAGR (2024-2030), below the 8% threshold for high scoring. Growth driven by regulatory tightening (PPWR 65-70% recycling by 2030, SUP bans), EPR fee activation (Germany 2019, UK 2025), and corporate ESG pressure under CSRD. Modest but steady expansion reflecting policy-driven adoption cycles rather than explosive technology-led disruption. CAGR places market in "mature growth" rather than "high growth" category despite strong regulatory tailwinds.',
  'manual',
  auth.uid()
),
(
  'd6e00aaa-c4d2-461d-b7cb-df596ad444af',
  '0c35a53e-ba40-4d76-ba5f-6d5368bcc828', -- A4: Market Maturity  
  1,
  'Medium',
  'Market is EARLY/NASCENT despite large incumbent packaging players (Mondi, Smurfit Kappa, DS Smith). Sustainable packaging niche characterized by: <5 relevant M&A transactions in last 3 years (Carton Pack/A&M Capital €327M 2022, Petainer/Ara Partners 2022), predominantly VC-backed growth-stage companies (Packmatic €15M, Paptic €23M, Notpla £20M), fragmented competitive landscape with no pure-play sustainable packaging leaders, and unproven exit multiples (8-12x EBITDA estimated). Early-stage risks include policy timing uncertainty, input spread volatility vs. virgin materials, and unvalidated buyer willingness-to-pay for sustainability premium.',
  'manual',
  auth.uid()
),

-- Category B: Investability  
(
  'd6e00aaa-c4d2-461d-b7cb-df596ad444af',
  'd880face-8043-4240-be11-3c5257927f65', -- B1: Fragmentation
  5,
  'High',
  'Extremely fragmented market with Top 3 share of only 8% and Top 10 estimated at 20-25%. No dominant pure-play sustainable packaging incumbents—large players (Mondi £9-11bn revenue, Smurfit Kappa £8-10bn, DS Smith £7-8bn) are diversified packaging conglomerates with sustainability as small segment. Estimated 200+ companies in PE-target range (£5-15M EBITDA) across software/SaaS (high margin, asset-light), bio-materials (capital-intensive but innovative), and consulting segments. Fragmentation score 5/5 creates ideal buy-and-build environment with ~50 platform candidates and 150+ bolt-on targets. Low consolidation risk before large incumbents activate due to early market stage.',
  'manual',
  auth.uid()
),
(
  'd6e00aaa-c4d2-461d-b7cb-df596ad444af',
  'ae53ea1f-0f4e-4d9a-b309-55f8ea57c0f2', -- B2: Competitive Moat
  1,
  'Low',
  'WEAK moats in early, fragmented market. Claimed sources (switching costs from packaging line qualification, proprietary bio-material technology, brand reputation in sustainability procurement) lack supporting evidence—no retention data, contract lock-in metrics, patent landscape analysis, or qualification barrier documentation provided. McKinsey 2025 purchaser research highlights affordability, unclear standards, and supply limitations as primary adoption barriers, contradicting moat strength claims. In price-sensitive categories, moats must be earned through performance proofs and standards alignment. Risk of commoditization high unless scaled platforms achieve regulatory-enabled mandates or unique datasets. Score 1/5 reflects unproven defensive positioning.',
  'manual',
  auth.uid()
),
(
  'd6e00aaa-c4d2-461d-b7cb-df596ad444af',
  'aa88205a-0fe6-4a41-b0fb-9ddd73fe64d8', -- B3: Exit Environment
  3,
  'Medium',
  'VIABLE but not robust exit environment. Strategic buyer categories: (1) Tier 1 FMCG/Retail (Unilever, Nestlé, PepsiCo, Danone, Tesco/Sainsbury) with medium-high appetite driven by EPR/sustainability mandates, (2) Tier 1 Packaging OEMs (Tetra Pak, Bosch Packaging, Krones) acquiring complementary technologies, (3) Tier 2 Industrial/PE Conglomerates (EQT, Fineurop) focused on platform building. Recent precedents: Carton Pack/A&M Capital €327M (2022), Petainer/Ara Partners (2022), Krones/BitWise Industries (2021). Estimated exit multiples 8-12x EV/EBITDA (modest packaging market tier). IPO viability LOW—requires >£300-500M revenue scale. Sponsor-to-sponsor possible after bolt-ons. Exit viable but limited buyer competition may cap multiples. Score 3/5.',
  'manual',
  auth.uid()
),

-- Category C: Risk Profile
(
  'd6e00aaa-c4d2-461d-b7cb-df596ad444af',
  'd6f7c864-6f6b-47e5-8dc5-a3f4b97d4410', -- C1: Regulatory Dependency
  1,
  'Medium',
  'HIGH regulatory dependency with 60% compliance-driven demand vs. 40% ROI-driven (T1 analysis). Core thesis relies on policy-driven tightening: PPWR 65-70% recycling targets, SUP bans, EPR fee modulation, and UK plastic packaging tax. However, recent precedents show policy timing slippage and enforcement fragmentation—UK EPR delayed with base fees only in 2025, modulation from 2026, and evolving RAM methodology. If two of top five EU markets fail to fully implement and invoice producer fees by Dec 2027 (40-50% probability per red-team analysis), compliance-led demand underperforms, collapsing IRR 7-10 points and compressing MOIC to ~1.7-2.0x. Policy stability critical; regulatory reversals pose significant downside. Score 1/5 reflects HIGH dependency risk.',
  'manual',
  auth.uid()
),
(
  'd6e00aaa-c4d2-461d-b7cb-df596ad444af',
  'ae0995bd-276a-4521-ab6f-3c78264ee8bc', -- C2: Market Timing
  3,
  'Medium',
  'MODERATE timing with mixed signals. Positive catalysts: PPWR entered force Feb 2025 with staged milestones through 2040, Germany EPR active since 2019, UK EPR launching 2024-2025, and growing corporate ESG disclosure under CSRD. However, McKinsey 2025 research flags affordability pressures limiting adoption, recent UK policy deferrals show implementation risk, and market remains VC-dominated (not PE-led) indicating early adoption phase. Buyers prioritize cost over sustainability when budgets tighten. Market is approaching inflection point but 2-3 years from mass deployment—not optimal entry timing. Score 3/5 reflects good but not excellent timing with execution uncertainties.',
  'manual',
  auth.uid()
)
ON CONFLICT (theme_id, criteria_id) DO UPDATE SET
  score = EXCLUDED.score,
  confidence = EXCLUDED.confidence,
  notes = EXCLUDED.notes,
  update_source = EXCLUDED.update_source,
  updated_by = EXCLUDED.updated_by,
  updated_at = now();