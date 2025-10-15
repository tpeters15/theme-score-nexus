-- Step 4: Add remaining C3, C4 scores for Sustainable Materials & Packaging

INSERT INTO detailed_scores (theme_id, criteria_id, score, confidence, notes, update_source, updated_by)
VALUES
(
  'd6e00aaa-c4d2-461d-b7cb-df596ad444af',
  '81a53b4d-5a36-458b-a50a-605f948e61d9', -- C3 (mapped to D1): Macro Sensitivity
  3,
  'Medium',
  'MEDIUM macro sensitivity despite 60% compliance-driven demand floor. Discretionary sustainability spend (ROI-driven retrofits, premium materials) vulnerable to recession and affordability pressures—McKinsey 2025 research confirms buyers prioritize cost over sustainability when budgets tighten. Industrial and FMCG packaging projects may defer in downturn. However, regulatory mandates (PPWR recycling targets, SUP bans, EPR fees) provide downside floor preventing complete demand collapse. Input spread volatility creates additional risk: if virgin PET/PE prices remain ≥12% below recycled-content alternatives for four consecutive quarters (35-45% probability per red-team), r-content adoption stalls in non-mandated categories, compressing SOM 20-30% and reducing IRR 6-9 points. Score 3/5 reflects moderate but non-trivial cyclicality.',
  'manual',
  auth.uid()
),
(
  'd6e00aaa-c4d2-461d-b7cb-df596ad444af',
  '954e16ba-9b94-4009-85d0-d5c6b76e20d8', -- C4 (mapped to D2): Evidence/Data Confidence
  3,
  'Medium',
  'MEDIUM-LOW overall confidence with significant data gaps. Methodology issues: presence of "[object Object]" placeholders in original analysis, capital-efficient TAM appears as heuristic 10% haircut (£4.2bn exactly 10% of £42bn) lacking bottom-up validation, moats asserted without retention data/lock-in metrics/patent analysis. Fragmentation estimates credible but lack single database verification. Exit multiples (8-12x EBITDA) are broad packaging norms, not deal-specific. Buy-and-build 2.5x MOIC target lacks sourced pipeline, integration costs, or FCF-to-fund proof. Regulatory landscape well-documented (EUR-Lex, government sources) providing HIGH confidence on policy drivers. However, unit economics vs. virgin alternatives unproven across downside oil price scenarios, buyer willingness-to-pay evidence thin (McKinsey flags affordability barriers), and add-on execution risk elevated. Score 3/5 reflects mixed evidence quality—strong regulatory foundation but weak commercial validation.',
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