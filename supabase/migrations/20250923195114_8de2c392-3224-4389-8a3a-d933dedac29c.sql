-- Update detailed scores for Industrial Energy Efficiency & Optimisation theme
-- Based on the uploaded scoring document

-- Delete existing scores for this theme first
DELETE FROM public.detailed_scores 
WHERE theme_id = 'c86b4e99-d6cc-4b8c-9a4c-8864d64e4d6d';

-- Insert new scores with both numerical scores and detailed rationales
INSERT INTO public.detailed_scores (theme_id, criteria_id, score, confidence, notes, analyst_notes, updated_at, update_source) VALUES

-- A1. TAM - Score: 5
('c86b4e99-d6cc-4b8c-9a4c-8864d64e4d6d', '6fea944f-fe7c-49df-b77d-9ce298df6a1d', 5, 'High', 
'Blended TAM for asset-light industrial efficiency in target European geographies is €8–12 bn (2025), clearly above the €5 bn threshold.',
'Market size significantly exceeds requirements for high scoring threshold', now(), 'manual'),

-- A2. Platform Revenue Potential (SOM) - Score: 5  
('c86b4e99-d6cc-4b8c-9a4c-8864d64e4d6d', '96c016c6-7080-45cf-9fd2-056d2394c533', 5, 'High',
'Bottom-up model indicates a realistic SOM ≈ €246 m annual revenue by 2029 for a single market-leading platform (≥£100 m).',
'Platform potential well above €500M threshold indicating high potential', now(), 'manual'),

-- A3. Market Growth Rate (CAGR) - Score: 3
('c86b4e99-d6cc-4b8c-9a4c-8864d64e4d6d', '288364d2-b462-4398-8ded-0aa441649390', 3, 'Medium',
'Final blended growth estimate for the asset-light software/services segment is ~10–12% for the 2025–2029 horizon (within 5–15%).',
'Growth rate within solid 5-10% range, meeting medium criteria threshold', now(), 'manual'),

-- B1. Market Fragmentation (mapped to document''s "Platform & Strategic M&A Potential") - Score: 5
('c86b4e99-d6cc-4b8c-9a4c-8864d64e4d6d', 'f3321e3d-3bcb-402d-a628-e4799cb695a4', 5, 'High',
'Market is highly fragmented with a long tail of specialists, supporting a clear buy-and-build pathway for a consolidating platform.',
'High fragmentation creates excellent consolidation opportunities for platform players', now(), 'manual'),

-- B2. Investment Target Quality (mapped to document''s "Competitive Landscape & Moat Potential") - Score: 3
('c86b4e99-d6cc-4b8c-9a4c-8864d64e4d6d', '21d8d5dc-c511-4241-8df6-155a25f6be47', 3, 'Medium',
'Field includes large incumbents alongside many SMEs; defensibility can be built via scalable software layers and integration of ESG/CSRD capabilities that increase stickiness.',
'Adequate targets available across growth stages, with defensibility buildable through technology integration', now(), 'manual'),

-- B3. Exit Environment - Score: 5
('c86b4e99-d6cc-4b8c-9a4c-8864d64e4d6d', 'fe25c421-b09b-4188-9e5c-e97060f95879', 5, 'High',
'Theme shows a clear path to attractive exit with both strategic and financial buyers within 3–5 years, underpinned by consolidation dynamics.',
'Multiple exit routes available with attractive valuations supported by ongoing consolidation', now(), 'manual'),

-- C1. Technology Risk (mapped to document''s "Regulatory Dependency") - Score: 3
('c86b4e99-d6cc-4b8c-9a4c-8864d64e4d6d', '8c1fcdf9-0d5e-42be-8ae2-336a1d40f597', 3, 'Medium',
'Strong, durable EU/UK regulatory tailwinds support demand, but risks remain around uneven transposition, policy "simplification" and complexity, making growth partly policy-contingent.',
'Technology proven but implementation has some regulatory complexity challenges', now(), 'manual'),

-- C2. Regulatory Risk (mapped to document''s "Market Timing") - Score: 5  
('c86b4e99-d6cc-4b8c-9a4c-8864d64e4d6d', 'c50351a4-82a8-464b-a3d2-0f8e513d6486', 5, 'High',
'The investability window is "Near" (≤18 months) given newly implemented binding regulations and 2030 timelines, indicating a favourable entry point.',
'Very supportive regulatory environment with clear compliance paths and favorable timing', now(), 'manual'),

-- C3. Market Risk (mapped to document''s "Macro Sensitivity") - Score: 3
('c86b4e99-d6cc-4b8c-9a4c-8864d64e4d6d', 'a5754996-f788-41e5-a73b-efb277fd5d87', 3, 'Medium',
'Regulatory/compliance drivers provide a non-cyclical demand floor, but a severe industrial recession would defer efficiency capex and slow adoption.',
'Growing demand with regulatory support, but some economic sensitivity remains', now(), 'manual');