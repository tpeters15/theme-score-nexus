-- Create the Industrial Energy Efficiency & Optimisation theme
INSERT INTO public.themes (name, pillar, sector, description, in_scope, out_of_scope)
VALUES (
  'Industrial Energy Efficiency & Optimisation',
  'Energy Transition',
  'Industrial',
  'Asset-light software and services for industrial energy efficiency, targeting compliance with EU regulations and operational optimization',
  ARRAY[
    'Software-based energy management systems',
    'Industrial IoT and monitoring solutions', 
    'Energy analytics and optimization platforms',
    'Compliance and reporting tools for EU regulations',
    'Asset-light service models',
    'Platform consolidation opportunities'
  ],
  ARRAY[
    'Hardware-heavy solutions',
    'Capital-intensive infrastructure',
    'Residential energy efficiency',
    'Transportation efficiency',
    'Pure consulting without technology'
  ]
);

-- Create framework categories
INSERT INTO public.framework_categories (code, name, description, weight, display_order)
VALUES 
  ('A', 'Market Attractiveness', 'Total Addressable Market, Platform Potential, and Growth Metrics', 30, 1),
  ('B', 'Investment Attractiveness', 'Platform potential, competitive dynamics, and exit environment', 35, 2),
  ('C', 'Risk Assessment', 'Regulatory, timing, and macro sensitivity factors', 35, 3);

-- Create framework criteria for category A
INSERT INTO public.framework_criteria (category_id, code, name, description, objective, weight, display_order, scoring_rubric, ai_prompt)
SELECT 
  cat.id,
  'A1',
  'TAM',
  'Total Addressable Market analysis',
  'Assess the size of the total addressable market',
  10,
  1,
  '{"1": {"label": "Low", "description": "TAM < €1bn"}, "3": {"label": "Medium", "description": "TAM €1-5bn"}, "5": {"label": "High", "description": "TAM > €5bn"}}'::jsonb,
  'Analyze the total addressable market size for this theme'
FROM public.framework_categories cat WHERE cat.code = 'A';

INSERT INTO public.framework_criteria (category_id, code, name, description, objective, weight, display_order, scoring_rubric, ai_prompt)
SELECT 
  cat.id,
  'A2',
  'Platform Potential (SOM)',
  'Serviceable Obtainable Market for platform business',
  'Evaluate realistic market capture potential',
  10,
  2,
  '{"1": {"label": "Low", "description": "SOM < €50m"}, "3": {"label": "Medium", "description": "SOM €50-100m"}, "5": {"label": "High", "description": "SOM > €100m"}}'::jsonb,
  'Assess the serviceable obtainable market and platform potential'
FROM public.framework_categories cat WHERE cat.code = 'A';

INSERT INTO public.framework_criteria (category_id, code, name, description, objective, weight, display_order, scoring_rubric, ai_prompt)
SELECT 
  cat.id,
  'A3',
  'CAGR',
  'Compound Annual Growth Rate',
  'Assess market growth trajectory',
  10,
  3,
  '{"1": {"label": "Low", "description": "CAGR < 5%"}, "3": {"label": "Medium", "description": "CAGR 5-15%"}, "5": {"label": "High", "description": "CAGR > 15%"}}'::jsonb,
  'Evaluate the compound annual growth rate of the market'
FROM public.framework_categories cat WHERE cat.code = 'A';

-- Create framework criteria for category B
INSERT INTO public.framework_criteria (category_id, code, name, description, objective, weight, display_order, scoring_rubric, ai_prompt)
SELECT 
  cat.id,
  'B1',
  'Platform & Strategic M&A Potential',
  'Consolidation and platform building opportunities',
  'Evaluate buy-and-build potential',
  12,
  4,
  '{"1": {"label": "Low", "description": "Limited consolidation potential"}, "3": {"label": "Medium", "description": "Some M&A opportunities"}, "5": {"label": "High", "description": "Clear platform/consolidation play"}}'::jsonb,
  'Assess platform building and M&A consolidation opportunities'
FROM public.framework_categories cat WHERE cat.code = 'B';

INSERT INTO public.framework_criteria (category_id, code, name, description, objective, weight, display_order, scoring_rubric, ai_prompt)
SELECT 
  cat.id,
  'B2',
  'Competitive Landscape & Moat Potential',
  'Market structure and defensibility',
  'Assess competitive dynamics and moat building potential',
  12,
  5,
  '{"1": {"label": "Low", "description": "Highly competitive, low moats"}, "3": {"label": "Medium", "description": "Moderate competition, some differentiation"}, "5": {"label": "High", "description": "Clear differentiation and moat potential"}}'::jsonb,
  'Analyze competitive landscape and potential for building defensible moats'
FROM public.framework_categories cat WHERE cat.code = 'B';

INSERT INTO public.framework_criteria (category_id, code, name, description, objective, weight, display_order, scoring_rubric, ai_prompt)
SELECT 
  cat.id,
  'B3',
  'Exit Environment',
  'Strategic and financial buyer landscape',
  'Evaluate exit opportunities and timeline',
  11,
  6,
  '{"1": {"label": "Low", "description": "Limited exit options"}, "3": {"label": "Medium", "description": "Some strategic interest"}, "5": {"label": "High", "description": "Strong strategic and financial buyer interest"}}'::jsonb,
  'Assess the exit environment including strategic and financial buyers'
FROM public.framework_categories cat WHERE cat.code = 'B';

-- Create framework criteria for category C
INSERT INTO public.framework_criteria (category_id, code, name, description, objective, weight, display_order, scoring_rubric, ai_prompt)
SELECT 
  cat.id,
  'C1',
  'Regulatory Dependency',
  'Regulatory risk and dependency assessment',
  'Evaluate regulatory risks and dependencies',
  12,
  7,
  '{"1": {"label": "High Risk", "description": "High regulatory uncertainty"}, "3": {"label": "Medium Risk", "description": "Some regulatory risks"}, "5": {"label": "Low Risk", "description": "Stable regulatory environment"}}'::jsonb,
  'Assess regulatory dependency and associated risks'
FROM public.framework_categories cat WHERE cat.code = 'C';

INSERT INTO public.framework_criteria (category_id, code, name, description, objective, weight, display_order, scoring_rubric, ai_prompt)
SELECT 
  cat.id,
  'C2',
  'Market Timing',
  'Investment timing and market readiness',
  'Assess optimal investment timing',
  12,
  8,
  '{"1": {"label": "Poor Timing", "description": "Market not ready, >3 years"}, "3": {"label": "Medium Timing", "description": "Moderate timing, 18 months - 3 years"}, "5": {"label": "Optimal Timing", "description": "Market ready, <18 months"}}'::jsonb,
  'Evaluate market timing and investment window'
FROM public.framework_categories cat WHERE cat.code = 'C';

INSERT INTO public.framework_criteria (category_id, code, name, description, objective, weight, display_order, scoring_rubric, ai_prompt)
SELECT 
  cat.id,
  'C3',
  'Macro Sensitivity',
  'Macroeconomic sensitivity assessment',
  'Assess exposure to macroeconomic cycles',
  11,
  9,
  '{"1": {"label": "High Sensitivity", "description": "Highly cyclical"}, "3": {"label": "Medium Sensitivity", "description": "Some macro exposure"}, "5": {"label": "Low Sensitivity", "description": "Defensive, counter-cyclical"}}'::jsonb,
  'Analyze sensitivity to macroeconomic conditions'
FROM public.framework_categories cat WHERE cat.code = 'C';