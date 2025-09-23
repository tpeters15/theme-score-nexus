-- Insert scores for Water Treatment & Reuse Services theme
INSERT INTO detailed_scores (theme_id, criteria_id, score, confidence, notes, update_source) 
VALUES 
  ('c424535e-096d-4167-9d17-f7bda652feaf', '6fea944f-fe7c-49df-b77d-9ce298df6a1d', 5, 'High', 'Europe''s water recycle & reuse market grows from USD 3.85bn (2024E) to USD 6.59bn (2030E ≈ €6.0bn), clearing the >€5bn threshold; adjacent pools (e.g., digital water) are larger but not counted in this score.', 'manual'),
  ('c424535e-096d-4167-9d17-f7bda652feaf', '96c016c6-7080-45cf-9fd2-056d2394c533', 5, 'High', 'Single-platform scale >£100m is realistic: Saur''s Industrial Water Solutions generates €545m revenue, and Culligan C&I (IT/FR/UK) had >€100m turnover when acquired by Grundfos—both within our target geographies.', 'manual'),
  ('c424535e-096d-4167-9d17-f7bda652feaf', '288364d2-b462-4398-8ded-0aa441649390', 3, 'High', 'Core Europe water recycle & reuse market grows at ~9.4% (2024–30); faster sub-segments exist (e.g., municipal reuse ~16%), but the core pool supports a 3-score.', 'manual'),
  ('c424535e-096d-4167-9d17-f7bda652feaf', 'f3321e3d-3bcb-402d-a628-e4799cb695a4', 5, 'High', 'Multiple proven archetypes (WaaS, SaaS, O&M) and active M&A provide bolt-on paths; recent deals (Grundfos–Culligan C&I, EQT–AMCS, Palatine–Isle, Xylem–Heusser) and a deep bench of logical buyers evidence an ideal buy-and-build/exit structure.', 'manual'),
  ('c424535e-096d-4167-9d17-f7bda652feaf', '21d8d5dc-c511-4241-8df6-155a25f6be47', 3, 'High', 'Incumbents (Veolia, Suez, Xylem) are pivoting hard into asset-light and can bundle, keeping intensity high; nonetheless, new platforms can build moats via high switching costs and data scale, albeit with replication/brand pressures.', 'manual'),
  ('c424535e-096d-4167-9d17-f7bda652feaf', 'fe25c421-b09b-4188-9e5c-e97060f95879', 5, 'High', 'Robust: strategics and PE are active, with premium multiples for software-enabled models (low-to-mid-teens) and multiple recent transactions signalling liquidity.', 'manual'),
  ('c424535e-096d-4167-9d17-f7bda652feaf', 'c50351a4-82a8-464b-a3d2-0f8e513d6486', 3, 'High', 'EU Water Reuse Reg. (2020/741) is in force and the UWWTD EPR scheme de-risks funding, yet outcomes still hinge on national transposition and legal challenges; ROI levers (e.g., ~€200k annual energy savings at mid-size plants) underpin adoption beyond policy alone.', 'manual'),
  ('c424535e-096d-4167-9d17-f7bda652feaf', 'a5754996-f788-41e5-a73b-efb277fd5d87', 3, 'High', 'We''re early in the ramp: the Reuse Reg. applies since June 2023 and the UWWTD entered into force 1 Jan 2025, but transposition runs to 31 Jul 2027 and key compliance milestones stretch into the 2030s; member-state variability adds execution risk.', 'manual'),
  ('c424535e-096d-4167-9d17-f7bda652feaf', '6633e39f-f1e0-48dc-afef-e2e10e79632b', 5, 'High', 'Demand is non-discretionary (compliance-driven) with ring-fenced EPR funding, heavy O&M/recurring mix, and propositions that lower opex—yielding low cyclical exposure and even counter-cyclical characteristics.', 'manual')
ON CONFLICT (theme_id, criteria_id) 
DO UPDATE SET 
  score = EXCLUDED.score,
  confidence = EXCLUDED.confidence,
  notes = EXCLUDED.notes,
  updated_at = now(),
  update_source = EXCLUDED.update_source;