-- EV Charging Infrastructure: fix market data and insert valid scores (1,3,5 only)

-- 1) Update market data
UPDATE public.taxonomy_themes
SET 
  tam_value = 80,
  tam_currency = 'GBP',
  cagr_percentage = 21,
  cagr_period_start = 2024,
  cagr_period_end = 2030,
  market_maturity = 'Growth', -- allowed by CHECK constraint
  updated_at = now()
WHERE id = '59276a29-119b-4412-86ae-4725472eb380';

-- 2) Insert detailed scores with allowed values and update_source
INSERT INTO public.detailed_scores (theme_id, criteria_id, score, confidence, notes, update_source, updated_at)
VALUES
  ('59276a29-119b-4412-86ae-4725472eb380', (SELECT id FROM public.framework_criteria WHERE code = 'A1' LIMIT 1), 5, 'High', 'TAM ~£80bn; large headroom driven by EV adoption and infrastructure rollout.', 'manual', now()),
  ('59276a29-119b-4412-86ae-4725472eb380', (SELECT id FROM public.framework_criteria WHERE code = 'A2' LIMIT 1), 3, 'High', 'Strong platform revenue opportunities across hardware, software, and services (CPO/EMSP).', 'manual', now()),
  ('59276a29-119b-4412-86ae-4725472eb380', (SELECT id FROM public.framework_criteria WHERE code = 'A3' LIMIT 1), 5, 'High', 'CAGR ~21% (2024–2030) supported by policy and accelerating EV penetration.', 'manual', now()),
  ('59276a29-119b-4412-86ae-4725472eb380', (SELECT id FROM public.framework_criteria WHERE code = 'A4' LIMIT 1), 3, 'Medium', 'Market transitioning from early to scaling phase; economics improving with utilization.', 'manual', now()),
  ('59276a29-119b-4412-86ae-4725472eb380', (SELECT id FROM public.framework_criteria WHERE code = 'B1' LIMIT 1), 3, 'Medium', 'Fragmented landscape with many CPOs/solution vendors; consolidation underway.', 'manual', now()),
  ('59276a29-119b-4412-86ae-4725472eb380', (SELECT id FROM public.framework_criteria WHERE code = 'B2' LIMIT 1), 3, 'Medium', 'Moats emerging via scale, network density, software stack, and partnerships.', 'manual', now()),
  ('59276a29-119b-4412-86ae-4725472eb380', (SELECT id FROM public.framework_criteria WHERE code = 'B3' LIMIT 1), 3, 'Medium', 'Improving exit quality given momentum and infrastructure focus of strategics/PE.', 'manual', now()),
  ('59276a29-119b-4412-86ae-4725472eb380', (SELECT id FROM public.framework_criteria WHERE code = 'C1' LIMIT 1), 5, 'High', 'Strong regulatory support (AFIR, building regs, smart charging) de-risks adoption.', 'manual', now()),
  ('59276a29-119b-4412-86ae-4725472eb380', (SELECT id FROM public.framework_criteria WHERE code = 'C2' LIMIT 1), 3, 'Medium', 'Execution/timing risks around grid connections and permitting remain.', 'manual', now()),
  ('59276a29-119b-4412-86ae-4725472eb380', (SELECT id FROM public.framework_criteria WHERE code = 'C3' LIMIT 1), 3, 'Medium', 'Macro sensitivity moderated by policy tailwinds; infra-like characteristics.', 'manual', now()),
  ('59276a29-119b-4412-86ae-4725472eb380', (SELECT id FROM public.framework_criteria WHERE code = 'C4' LIMIT 1), 5, 'High', 'High evidence base across market data and policy; some operator variability.', 'manual', now());
