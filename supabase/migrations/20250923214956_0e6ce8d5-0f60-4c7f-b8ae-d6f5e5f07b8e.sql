-- Insert scores for Smart Water Infrastructure & Analytics theme
INSERT INTO detailed_scores (theme_id, criteria_id, score, confidence, notes, update_source) 
VALUES 
  ('b4684290-52b7-431a-b3ce-05fad5e39479', '6fea944f-fe7c-49df-b77d-9ce298df6a1d', 3, 'High', 'Blended asset-light TAM for Europe is £2.3–2.7bn (≈€2.7–3.2bn), triangulated from Bluefield and other sources—solidly within the €1–5bn band.', 'manual'),
  ('b4684290-52b7-431a-b3ce-05fad5e39479', '96c016c6-7080-45cf-9fd2-056d2394c533', 1, 'High', 'Bottom-up SOM model yields ~£42.2m ARR by 2029 (7,500 target customers × 7.5% share × £75k ACV), below the £60m threshold despite plausible upside with roll-ups.', 'manual'),
  ('b4684290-52b7-431a-b3ce-05fad5e39479', '288364d2-b462-4398-8ded-0aa441649390', 3, 'High', 'Blended asset-light growth estimate is ~12%, placing the market in the 5–15% bracket.', 'manual'),
  ('b4684290-52b7-431a-b3ce-05fad5e39479', 'f3321e3d-3bcb-402d-a628-e4799cb695a4', 3, 'High', 'Market is highly fragmented with abundant bolt-ons, but a limited pool of €15m+ revenue pure-play platforms implies a viable (not "ideal") buy-and-build path, potentially starting smaller or via carve-outs.', 'manual'),
  ('b4684290-52b7-431a-b3ce-05fad5e39479', '21d8d5dc-c511-4241-8df6-155a25f6be47', 5, 'High', 'High switching costs from deep IT/OT integration and data network effects from multi-utility datasets enable durable moats for best-of-breed software, even as incumbents bundle hardware+software.', 'manual'),
  ('b4684290-52b7-431a-b3ce-05fad5e39479', 'fe25c421-b09b-4188-9e5c-e97060f95879', 5, 'High', 'Active, liquid exits to strategics and PE, evidenced by recent deals (e.g., EQT–AMCS, Mueller–i2O, Diehl–PREVENTIO) and a broad buyer universe (Xylem, Siemens, ABB, Badger, etc.).', 'manual'),
  ('b4684290-52b7-431a-b3ce-05fad5e39479', 'c50351a4-82a8-464b-a3d2-0f8e513d6486', 3, 'High', 'Growth is supported by binding EU/UK mandates (recast DWD, UWWTD, PR24/AMP8), but adoption is also underwritten by clear ROI (NRW and energy savings), indicating medium dependency.', 'manual'),
  ('b4684290-52b7-431a-b3ce-05fad5e39479', 'a5754996-f788-41e5-a73b-efb277fd5d87', 5, 'High', 'Near-term catalysts—PR24 (2025–30) with 10.4m smart meters, UWWTD entry-into-force 2025 and quaternary-treatment ramp, plus the 2024 Water Resilience Strategy—point to a current tipping point.', 'manual'),
  ('b4684290-52b7-431a-b3ce-05fad5e39479', '6633e39f-f1e0-48dc-afef-e2e10e79632b', 5, 'High', 'Utility spend is non-discretionary/regulated and tied to compliance and opex reduction, supporting resilience through macro cycles.', 'manual')
ON CONFLICT (theme_id, criteria_id) 
DO UPDATE SET 
  score = EXCLUDED.score,
  confidence = EXCLUDED.confidence,
  notes = EXCLUDED.notes,
  updated_at = now(),
  update_source = EXCLUDED.update_source;