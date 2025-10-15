
-- Insert/Update detailed scores for Water Efficiency theme (all 10 criteria)

INSERT INTO detailed_scores (
  theme_id,
  criteria_id,
  score,
  confidence,
  notes,
  update_source,
  updated_at
) VALUES
-- A1: TAM
(
  'aa637432-d6c1-47c8-94b8-2bad7e55f5d0',
  'e4613835-f637-49e8-99f1-57d6894cc990',
  5,
  'High',
  'European water efficiency TAM estimated at €5.6bn, with capital-efficient segment at €4.4bn firmly in the >€5bn bracket. Market encompasses utility network efficiency (leak detection, pressure management), precision irrigation, industrial water reuse, and building efficiency solutions across 500M+ population base. Validated through bottom-up analysis: EU abstracts 197bn m³/year with 23% average leakage (45bn m³ opportunity), agriculture irrigation 57bn m³ with 10-40% savings potential, industrial water 28bn m³ with 30-50% efficiency gains possible.',
  'manual',
  NOW()
),
-- A2: SOM / Platform Potential
(
  'aa637432-d6c1-47c8-94b8-2bad7e55f5d0',
  '975d1dff-0048-498e-8259-0aadcf152b8e',
  5,
  'High',
  'PE-addressable SOM of €0.5bn with ~100 platform-sized targets (€10-30M revenue) concentrated in Germany (30-40 firms), UK (20-30), France (10-20). Fragmented structure with top 3 holding only 15% share creates ideal consolidation environment. Platform revenue potential €20-50M based on sector penetration and recurring service models (SaaS monitoring, multi-year O&M contracts). Conservative bottom-up build: €25M initial platform × 7% organic growth + 3-5 bolt-ons → €72M revenue by Year 5.',
  'manual',
  NOW()
),
-- A3: CAGR
(
  'aa637432-d6c1-47c8-94b8-2bad7e55f5d0',
  'd33eecd5-7f34-425a-92eb-138487e882dd',
  3,
  'Medium',
  'Market growing at 7.0% CAGR (2024-2030), solidly within the 5-15% band. Growth driven by water scarcity intensification (38% EU population affected by 2019, worsening with climate change), regulatory tightening (EU 10% reduction target by 2030, Drinking Water Directive leakage mandates by 2026-2028), and rising corporate ESG requirements under CSRD (phased 2024-2026). Medium confidence due to long utility procurement cycles (5-10 year AMP periods) and nascent VC-stage market indicating early adoption curve.',
  'manual',
  NOW()
),
-- A4: Market Maturity
(
  'aa637432-d6c1-47c8-94b8-2bad7e55f5d0',
  '0c35a53e-ba40-4d76-ba5f-6d5368bcc828',
  3,
  'Medium',
  'Market is TRANSITIONING from early to growth stage. Investment predominantly VC-led (>90% of deals) with only 1 Series C+ round in Europe since 2020 (Weenat €8.5M Series C). However, enterprise reference accounts exist (Waterplan serving Danone, AB InBev; Weenat with 25k sensors deployed across 10k fields), early M&A activity by strategics (Siemens/BuntPlanet for smart metering AI, Grundfos/Metasphere for IoT sewer monitoring, Kurita/Arcade Engineering), and proven business models emerging around SaaS monitoring (subscription per site/month) and managed services (multi-year contracts with recurring O&M). Positioned between nascent and scaled—sufficient proof points for PE entry but not yet mature platform landscape.',
  'manual',
  NOW()
),
-- B1: Fragmentation
(
  'aa637432-d6c1-47c8-94b8-2bad7e55f5d0',
  'd880face-8043-4240-be11-3c5257927f65',
  5,
  'High',
  'Extremely fragmented with Top 3 market share of 15% and Top 10 at 38%. Estimated 200+ active players (>€1M revenue) with 100-150 companies in PE-target range (€10-30M revenue). No dominant pure-play incumbents—largest players (Schneider Electric ~5% share, Siemens ~4%, Johnson Controls ~3%) are diversified conglomerates with water efficiency as small segment of broader building automation/industrial businesses. High fragmentation creates abundant platform (~60-90 quality targets meeting >10% growth, >15% EBITDA margins, modern tech stack criteria) and bolt-on opportunities (200+ smaller specialists in leak detection, irrigation tech, IoT analytics). Geographic clusters exist: Nordics (smart meter specialists), Germany/Austria (engineering & pumps), Southern Europe (irrigation vendors), UK (building services).',
  'manual',
  NOW()
),
-- B2: Competitive Moat
(
  'aa637432-d6c1-47c8-94b8-2bad7e55f5d0',
  'ae53ea1f-0f4e-4d9a-b309-55f8ea57c0f2',
  3,
  'Medium',
  'Moderate moats from three sources: (1) Data & analytics—long-term customer usage data enables predictive efficiency and leak detection algorithms difficult to replicate without historical baselines (MEDIUM strength, requires multi-year deployment), (2) Proprietary tech integration—custom IoT sensor networks and control systems create switching friction and interoperability lock-in (MEDIUM, especially in utility SCADA integration), (3) Recurring contracts—multi-year monitoring and O&M bundling with typical 3-5 year terms creates relationship stickiness (MEDIUM switching costs due to re-integration effort and operational risk). However, scale economies are weak (local service delivery doesn''t benefit much from pan-European consolidation), branding slow to build in B2B procurement, and regulatory barriers low (ISO certifications achievable by any serious provider). Commoditization risk exists unless scaled with regulation-enabled mandates (like Techem/ista in submetering via EED remote reading requirements) or unique proprietary datasets. Basis of competition mixed: Price/ROI ~25%, Technology/Analytics ~20%, Service Reliability ~20%, with remaining 35% split across relationship and track record.',
  'manual',
  NOW()
),
-- B3: Exit Environment
(
  'aa637432-d6c1-47c8-94b8-2bad7e55f5d0',
  'aa88205a-0fe6-4a41-b0fb-9ddd73fe64d8',
  3,
  'Medium',
  'VIABLE exit environment with active strategic buyers including utilities (Veolia, Suez/Italgas), building systems conglomerates (Schneider Electric, ABB, Johnson Controls, Danfoss), water technology OEMs (Grundfos, Xylem, Pentair), and infrastructure funds. Recent deals demonstrate appetite: Siemens acquired Spanish water-software BuntPlanet (smart metering/AI, deal size undisclosed), Kurita bought Arcade Engineering (semiconductor water treatment, multiples not disclosed), Grundfos acquired UK''s Metasphere (satellite/IoT sewer monitoring), Italgas negotiated €100M+ deal for Veolia''s Italian water networks. Deal multiples moderate: 3-6x revenue, 8-12x EBITDA for platform targets depending on growth and SaaS content (recurring revenue commands premium). Secondary PE deals also possible (broader environmental services PE platforms could extend into water efficiency). However, IPOs unlikely for pure-plays given lack of European comparables (US-listed Xylem, Pentair trade at mid-single-digit EV/Rev but are diversified). Exit viable but not robust—limited buyer competition and moderate multiples may cap returns. Precedents of successful PE exits in adjacent submetering (Techem €6.7bn to TPG/GIC 2024, ista €4.5bn to CKI/CKP 2017) show path for regulation-backed, scaled platforms.',
  'manual',
  NOW()
),
-- C1: Regulatory & Policy Landscape (Using the correct criteria based on the DB schema)
(
  'aa637432-d6c1-47c8-94b8-2bad7e55f5d0',
  'd6f7c864-6f6b-47e5-8dc5-a3f4b97d4410',
  5,
  'High',
  'LOW regulatory dependency provides resilience. Demand split: 60% ROI-driven (£100+ annual household savings, industrial cost reduction of 10-30% on water bills providing standalone business case independent of policy) and 40% compliance-driven (EU Water Reuse Regulation effective June 2023, Drinking Water Directive leakage mandates due 2026-2028, CSRD water disclosure 2024-2026 phase-in). This balanced profile means efficiency investments justify on pure economics with regulation as tailwind rather than requirement—superior to renewables (90%+ policy-dependent) or building insulation (70%+ subsidy-reliant). Water tariffs and drought pressures ensure non-discretionary nature: utilities face regulatory penalties for leakage exceeding thresholds (UK Ofwat enforces through price controls), industrial users avoid abstraction charges and production shutdowns during drought restrictions, agriculture faces water rights curtailment without efficiency proof. Even if specific programs weaken, underlying water scarcity and pricing mechanisms sustain demand.',
  'manual',
  NOW()
),
-- C2: Regulatory Dependency (This one exists in the schema)
(
  'aa637432-d6c1-47c8-94b8-2bad7e55f5d0',
  'ae0995bd-276a-4521-ab6f-3c78264ee8bc',
  5,
  'High',
  'See C1 score - regulatory framework is supportive but not dependency-creating due to strong standalone ROI drivers.',
  'manual',
  NOW()
),
-- D1: Market Timing
(
  'aa637432-d6c1-47c8-94b8-2bad7e55f5d0',
  '81a53b4d-5a36-458b-a50a-605f948e61d9',
  3,
  'Medium',
  'GOOD timing but not optimal. Water scarcity intensifying (38% EU population affected by scarcity in 2019 per EEA, worsening with droughts 2022-2024 across Mediterranean and Central Europe), new regulations entering force creating compliance deadlines (Water Reuse Regulation effective June 2023, Drinking Water Directive leakage assessments mandatory by 2026 with binding EU targets by 2028), and CSRD driving corporate water disclosure starting 2024 for large companies (10k+ employees) expanding to all listed firms by 2026. However, utility adoption cycles are long (5-10 year AMP periods in UK, similar planning horizons across EU), some mandates lack enforcement teeth (Water Framework Directive "good status" repeatedly missed without penalties), and market remains VC-dominated indicating early adoption phase rather than mass deployment. Near inflection point but realistically 2-3 years from widespread rollout—not too late but also not perfectly timed like established markets with immediate procurement pipelines. Private capital still underpenetrated (EU water tech received only ~$1B 2020-2023 per Sifted) suggesting greenfield opportunity.',
  'manual',
  NOW()
),
-- D2: Macro Sensitivity
(
  'aa637432-d6c1-47c8-94b8-2bad7e55f5d0',
  '954e16ba-9b94-4009-85d0-d5c6b76e20d8',
  3,
  'Medium',
  'MEDIUM macro sensitivity with partial downside protection. Water efficiency spend bifurcates: (1) Non-discretionary regulatory compliance and drought response providing floor (utility leakage remediation under regulatory obligation, industrial water recycling to maintain production during restrictions, agricultural efficiency to retain water rights) estimated at 40% of market, and (2) Discretionary ROI-driven efficiency capex vulnerable to recession and credit tightening (industrial retrofit projects deferred when cash tight, precision irrigation upgrades delayed by farmers facing commodity price volatility, building greywater systems cut from construction specs) representing 60% of addressable market. Utilities provide stability via regulated spend (UK water companies committed £14bn capex AMP8 2025-2030 regardless of macro environment), but broader market exposes to economic cycles. Historical precedent: 2008-2009 saw 20-30% pullback in industrial efficiency projects, though utility infrastructure spending remained resilient. The 60% ROI-driven weighting implies moderate cyclicality—worse than pure infrastructure (10-20% discretionary) but better than pure efficiency tech (80-90% discretionary). Climate-driven water stress provides countercyclical support (droughts force action even in recessions).',
  'manual',
  NOW()
)
ON CONFLICT (theme_id, criteria_id) DO UPDATE SET
  score = EXCLUDED.score,
  confidence = EXCLUDED.confidence,
  notes = EXCLUDED.notes,
  update_source = EXCLUDED.update_source,
  updated_at = EXCLUDED.updated_at;
