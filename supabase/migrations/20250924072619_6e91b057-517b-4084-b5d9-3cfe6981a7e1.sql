-- First, let's find the theme ID for 'Water Treatment & Reuse Services'
-- We'll verify which regulations already exist and add new ones

-- Add the NEW regulations that don't exist yet
INSERT INTO public.regulations (
  title, 
  description, 
  jurisdiction, 
  regulation_type, 
  status, 
  impact_level, 
  effective_date, 
  regulatory_body, 
  key_provisions
) VALUES

-- German Federal Water Act (NEW)
(
  'Federal Water Act (Wasserhaushaltsgesetz - WHG) & Ordinances',
  'Primary national framework transposing EU directives, enforced with stringent compliance. Estimated cost of UWWTD compliance in Germany: €885m–€1.025bn annually.',
  'Germany',
  'framework_act',
  'active',
  'high',
  '2009-07-31', -- WHG current version
  'German Federal Ministry for the Environment, UBA and Länder authorities',
  ARRAY['Federal Water Act and implementing ordinances (Abwasserverordnung, Grundwasserverordnung)', 'Strict enforcement by UBA and Länder authorities', 'High compliance culture']
),

-- UK Water Environment Regulations (NEW)
(
  'Water Environment Regulations 2017 & Environment Act 2021',
  'UK''s retained WFD-based law; diverges post-Brexit by not adopting UWWTD recast. Higher risk, discretionary demand; AMP8 (2025–2030) cycle to increase investment.',
  'UK',
  'regulation',
  'active',
  'medium',
  '2017-01-01',
  'Environment Agency, Ofwat',
  ARRAY['Based on EU WFD principles', 'No mandate for quaternary treatment or EPR', 'AMP cycles (Ofwat regulated) dictate investment', 'Focus on storm overflows, nutrient pollution, leakage']
);

-- Now link EXISTING regulations to the Water Treatment & Reuse Services theme
-- These regulations already exist from the previous migration
INSERT INTO public.theme_regulations (regulation_id, theme_id, relevance_score, impact_description, criteria_impacts)
SELECT 
  r.id as regulation_id,
  t.id as theme_id,
  CASE 
    WHEN r.title LIKE '%Urban Wastewater Treatment%' THEN 5
    WHEN r.title LIKE '%Water Framework Directive%' THEN 5
    WHEN r.title LIKE '%Water Reuse%' THEN 5
    WHEN r.title LIKE '%Plan Eau%' THEN 4
    ELSE 3
  END as relevance_score,
  CASE 
    WHEN r.title LIKE '%Urban Wastewater Treatment%' THEN 'Technology-forcing directive mandating quaternary treatment, energy neutrality, and circular economy - core driver for advanced water treatment services'
    WHEN r.title LIKE '%Water Framework Directive%' THEN 'Foundational directive requiring good status of water bodies, driving demand for comprehensive treatment and monitoring services'
    WHEN r.title LIKE '%Water Reuse%' THEN 'Creates harmonized EU market for reclaimed water services, enabling revenue streams from high-quality effluent treatment'
    WHEN r.title LIKE '%Plan Eau%' THEN 'French national programme targeting 1,000 reuse projects by 2027, creating major market opportunities for treatment and reuse services'
    ELSE 'Regulatory driver for water treatment and reuse services'
  END as impact_description,
  ARRAY['regulatory_compliance', 'market_opportunity', 'revenue_generation'] as criteria_impacts
FROM public.regulations r
CROSS JOIN public.themes t
WHERE t.name ILIKE '%Water Treatment%Reuse Services%'
AND r.title IN (
  'Urban Wastewater Treatment Directive (UWWTD) – Directive (EU) 2024/3019',
  'Water Framework Directive (WFD) – Directive 2000/60/EC',
  'Regulation (EU) 2020/741 on Minimum Requirements for Water Reuse',
  'Plan Eau (2023–2030)'
);

-- Now link the NEW regulations to the Water Treatment & Reuse Services theme
INSERT INTO public.theme_regulations (regulation_id, theme_id, relevance_score, impact_description, criteria_impacts)
SELECT 
  r.id as regulation_id,
  t.id as theme_id,
  CASE 
    WHEN r.title LIKE '%Federal Water Act%' THEN 4
    WHEN r.title LIKE '%Water Environment Regulations%' THEN 3
    ELSE 3
  END as relevance_score,
  CASE 
    WHEN r.title LIKE '%Federal Water Act%' THEN 'German framework with stringent enforcement driving €885m-€1.025bn annual compliance costs, creating substantial market for treatment services'
    WHEN r.title LIKE '%Water Environment Regulations%' THEN 'UK post-Brexit water framework focusing on nutrient pollution and storm overflows, creating discretionary demand for treatment solutions'
    ELSE 'National regulatory framework driving water treatment market demand'
  END as impact_description,
  ARRAY['regulatory_compliance', 'market_opportunity'] as criteria_impacts
FROM public.regulations r
CROSS JOIN public.themes t
WHERE t.name ILIKE '%Water Treatment%Reuse Services%'
AND r.title IN (
  'Federal Water Act (Wasserhaushaltsgesetz - WHG) & Ordinances',
  'Water Environment Regulations 2017 & Environment Act 2021'
);