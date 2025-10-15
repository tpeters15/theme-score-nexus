-- Step 4: Add remaining C3, C4 scores for Green Workforce & Skills

INSERT INTO detailed_scores (theme_id, criteria_id, score, confidence, notes, update_source, updated_by)
VALUES
(
  '2fa96ad6-d24d-4a75-b89a-6e1899a00693',
  '81a53b4d-5a36-458b-a50a-605f948e61d9', -- C3 (mapped to D1): Macro Sensitivity
  3,
  'Medium',
  'MEDIUM macro sensitivity with 60% ROI-driven demand providing resilience but 40% compliance-driven exposure creating cyclical risk. ROI-driven training (cost reduction, productivity gains, market access) continues through downturns as companies pursue efficiency savings, but discretionary upskilling budgets compress during recessions—training often first expense cut despite long-term value. Compliance-driven demand (RED II certifications, EPBD audits, EED mandates) provides floor but vulnerable to policy deferrals when fiscal pressure mounts (precedent: Spain subsidy cuts, UK program cancellations). Sector-specific risks: construction/renovation activity is highly cyclical, solar/wind installations slow in credit crunches, and utility capex budgets (major training buyers) defer in downturns. Score 3/5 reflects moderate cyclicality—not recession-proof but more resilient than pure discretionary spend given structural skills shortage and regulatory backstops.',
  'manual',
  auth.uid()
),
(
  '2fa96ad6-d24d-4a75-b89a-6e1899a00693',
  '954e16ba-9b94-4009-85d0-d5c6b76e20d8', -- C4 (mapped to D2): Evidence/Data Confidence
  3,
  'Medium',
  'MEDIUM-LOW overall confidence with methodology gaps and unverified commercial assumptions. Data quality issues: Capital-Efficient TAM exactly equals Total TAM (both £0.6bn) without methodology—unusual and suggests assumed frictionless conversion. Moat claims (scale economies, switching costs, brand) lack supporting metrics: no contract retention data, no net revenue retention benchmarks, no proprietary accreditation ownership documented. Platform MOIC target 2.85x/IRR 24% lacks operational levers or sourced add-on pipeline—assumes multiple arbitrage in higher-rate environment without proof. Placeholders "[object Object]" in exit quality and rollup potential indicate incomplete analysis. Positive: Regulatory landscape well-documented (EUR-Lex sources), skills shortage validated by official EU/IEA data, TAM bottom-up calculation shows audit trail. However, commercial validation weak: buyer willingness-to-pay unproven, integration complexity underestimated (diverse accreditation systems), payer mix (public vs. private) unclear, and policy fragility precedents (Spain, UK failures) insufficiently stress-tested. Score 3/5 reflects mixed evidence—strong problem statement but weak commercial proof.',
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