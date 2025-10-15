-- Update detailed scores for Green Workforce & Skills theme based on complete report
INSERT INTO detailed_scores (theme_id, criteria_id, score, confidence, notes, update_source)
VALUES
-- A1: TAM
('2fa96ad6-d24d-4a75-b89a-6e1899a00693', 'e4613835-f637-49e8-99f1-57d6894cc990', 1, 'High',
 'Blended asset-light TAM for EU27+UK is €0.6bn (£0.6bn), well below the €5bn threshold. Training delivery (£350M), software platforms (£180M), and content/certification (£70M) comprise the addressable market. TAM excludes facility-based schools and apprenticeship management (£150M).',
 'manual'),
-- A2: Platform Potential (SOM)
('2fa96ad6-d24d-4a75-b89a-6e1899a00693', '975d1dff-0048-498e-8259-0aadcf152b8e', 1, 'Medium',
 'PE-addressable SOM is €0.06bn (£60M), derived from ~30 viable platform targets (£3-20M revenue) with top 3 controlling only 17.5% market share. Bottom-up model estimates €15-30M platform revenue potential by 2029, below £60M threshold despite fragmentation.',
 'manual'),
-- A3: CAGR
('2fa96ad6-d24d-4a75-b89a-6e1899a00693', 'd33eecd5-7f34-425a-92eb-138487e882dd', 3, 'Medium',
 'Blended asset-light growth estimate is 8.0% CAGR (2024-2030), placing market in the 5-15% band. Growth driven by EPBD renovation targets and RED II installer certification requirements, but vulnerable to policy shifts and subsidy volatility.',
 'manual'),
-- A4: Market Maturity
('2fa96ad6-d24d-4a75-b89a-6e1899a00693', '0c35a53e-ba40-4d76-ba5f-6d5368bcc828', 1, 'Medium',
 'Market is EARLY stage with high fragmentation (top 10 hold only 40% share), VC-backed startups dominating (Bcas, Cloover), and no clear consolidation activity. Series B/C rounds common but exit environment thin (only 2 relevant deals in 3 years: LTG at 7x EV/Revenue, OTG at 20x EBITDA).',
 'manual'),
-- B1: Market Fragmentation
('2fa96ad6-d24d-4a75-b89a-6e1899a00693', 'd880face-8043-4240-be11-3c5257927f65', 5, 'High',
 'Highly fragmented with ~30 viable platform targets (£3-20M revenue) and 125+ bolt-on candidates across Europe. Top 3 combined share is only 17.5%, no player exceeds 5-10% market share. Clear buy-and-build opportunity but quality of targets varies significantly.',
 'manual'),
-- B2: Competitive Landscape & Moat
('2fa96ad6-d24d-4a75-b89a-6e1899a00693', 'ae53ea1f-0f4e-4d9a-b309-55f8ea57c0f2', 1, 'Medium',
 'Moats are WEAK in this early market. Accrediting bodies control curricula/credentials, content is widely replicable, and buyers are cost-sensitive. Switching costs low unless tied to multi-year employer programs. Scale economies limited, brand/reputation not yet established. Risk of commoditization high.',
 'manual'),
-- B3: Exit Environment
('2fa96ad6-d24d-4a75-b89a-6e1899a00693', 'aa88205a-0fe6-4a41-b0fb-9ddd73fe64d8', 3, 'Medium',
 'Exit environment is THIN but improving. Only 2 relevant EdTech exits in 3 years: LTG (£300M sales) at 7x EV/Revenue to GA, and OTG ($50M EBITDA) at 20x to Oakley. Strategic buyers (utilities, OEMs) show MEDIUM appetite. Financial buyers (Oakley, GA) active but selective. 3-5 year exit window challenging given small SOM.',
 'manual'),
-- C1: Regulatory & Policy Landscape
('2fa96ad6-d24d-4a75-b89a-6e1899a00693', 'd6f7c864-6f6b-47e5-8dc5-a3f4b97d4410', 3, 'Medium',
 'MEDIUM regulatory dependency with HIGH policy volatility risk. 40% compliance-driven demand (RED II, EPBD, EED) provides growth tailwind, but 60% ROI-driven offers stability. Historical precedents show severe policy whiplash (Spain retroactive cuts, UK Green Deal failures, Mark Group installer collapse) can shrink training volumes 30-50%.',
 'manual'),
-- C2: Technology Risk
('2fa96ad6-d24d-4a75-b89a-6e1899a00693', 'ae0995bd-276a-4521-ab6f-3c78264ee8bc', 3, 'Medium',
 'MEDIUM technology risk. Core SaaS platforms (LMS, job marketplaces) use proven tech stacks. VR/AR training modules require higher R&D capex but are differentiating. Risk of tech disruption moderate - AI-powered adaptive learning and simulation could disrupt traditional delivery models. Integration complexity across acquisitions is material execution risk.',
 'manual'),
-- D1: Market Timing
('2fa96ad6-d24d-4a75-b89a-6e1899a00693', '81a53b4d-5a36-458b-a50a-605f948e61d9', 5, 'High',
 'Market timing is NEAR-TERM OPTIMAL (≤18 months). EPBD recast (2024) creates urgent 2030 deadline for 750,000 additional heat pump installers. RED II and EED compliance requirements in force. €15bn supportive funding through 2030. Window is NOW before consolidation begins and fragmentation window closes.',
 'manual'),
-- D2: Macro Sensitivity
('2fa96ad6-d24d-4a75-b89a-6e1899a00693', '954e16ba-9b94-4009-85d0-d5c6b76e20d8', 3, 'Medium',
 'MEDIUM macro sensitivity. 60% ROI-driven demand provides non-cyclical floor as energy costs remain high. 40% compliance/subsidy-driven demand vulnerable to government budget cuts in recession. Construction sector downturn would defer efficiency capex. Interest rate sensitivity moderate - training is relatively low-ticket vs capital equipment.',
 'manual')
ON CONFLICT (theme_id, criteria_id) 
DO UPDATE SET 
  score = EXCLUDED.score,
  confidence = EXCLUDED.confidence,
  notes = EXCLUDED.notes,
  update_source = EXCLUDED.update_source,
  updated_at = now();