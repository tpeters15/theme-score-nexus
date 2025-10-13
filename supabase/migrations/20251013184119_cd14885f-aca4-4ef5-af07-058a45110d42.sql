-- First, clear existing criteria and categories to rebuild from scratch
DELETE FROM detailed_scores;
DELETE FROM framework_criteria;
DELETE FROM framework_categories;

-- Create Categories with proper weights
-- A, B, C, D are scored (with weights)
-- E, F are qualitative (no weights)
INSERT INTO framework_categories (code, name, description, weight, display_order) VALUES
('A', 'Market Attractiveness', 'Evaluate market size, growth, and revenue potential', 30.00, 1),
('B', 'Investability', 'Assess market maturity, fragmentation, competition, and exit opportunities', 35.00, 2),
('C', 'Regulatory & Policy', 'Evaluate regulatory landscape and dependency risks', 20.00, 3),
('D', 'Economic Risk', 'Assess market timing, adoption risks, and macroeconomic sensitivity', 15.00, 4),
('E', 'Impact', 'Qualitative assessment of environmental and social impact potential', 0.00, 5),
('F', 'Fund Right to Win', 'Qualitative assessment of fund competitive advantages', 0.00, 6);

-- Get category IDs for criteria insertion
DO $$
DECLARE
  cat_a_id uuid;
  cat_b_id uuid;
  cat_c_id uuid;
  cat_d_id uuid;
  cat_e_id uuid;
  cat_f_id uuid;
BEGIN
  SELECT id INTO cat_a_id FROM framework_categories WHERE code = 'A';
  SELECT id INTO cat_b_id FROM framework_categories WHERE code = 'B';
  SELECT id INTO cat_c_id FROM framework_categories WHERE code = 'C';
  SELECT id INTO cat_d_id FROM framework_categories WHERE code = 'D';
  SELECT id INTO cat_e_id FROM framework_categories WHERE code = 'E';
  SELECT id INTO cat_f_id FROM framework_categories WHERE code = 'F';

  -- A. Market Attractiveness (3 criteria)
  INSERT INTO framework_criteria (category_id, code, name, description, objective, weight, display_order, scoring_rubric, ai_prompt) VALUES
  (cat_a_id, 'A1', 'Total Addressable Market (TAM)', 'Calculate TAM filtered for B2B/asset-light; confirm headroom for scaled platforms', 'Ensure the overall market size in Europe is large enough to support long-term growth', 33.33, 1,
   '{"1": {"label": "< €1B", "description": "Niche"}, "3": {"label": "€1-5B", "description": "Viable"}, "5": {"label": "> €5B", "description": "Expansive"}}'::jsonb,
   'Analyze the total addressable market size for this theme in Europe. Consider B2B and asset-light business models.'),
  
  (cat_a_id, 'A2', 'Platform Revenue Potential (SOM)', 'Estimate bottom-up (customers × adoption × ACV), validate with databases', 'Quantify realistic revenue potential for a single platform within 5 years', 33.33, 2,
   '{"1": {"label": "< €60m", "description": "Constrained"}, "3": {"label": "€60m - €100m", "description": "Sufficient"}, "5": {"label": "> €100m", "description": "High Potential"}}'::jsonb,
   'Estimate the platform revenue potential by calculating customers × adoption rate × average contract value.'),
  
  (cat_a_id, 'A3', 'Market Growth Rate (CAGR)', 'Triangulate CAGR across sources; review drivers and risks', 'Assess 5-year growth dynamics and tailwinds of the theme', 33.34, 3,
   '{"1": {"label": "<5%", "description": "Stagnant"}, "3": {"label": "5% - 10%", "description": "Solid"}, "5": {"label": ">10%", "description": "Rapid"}}'::jsonb,
   'Research the projected compound annual growth rate for this theme over the next 5 years.');

  -- B. Investability (4 criteria)
  INSERT INTO framework_criteria (category_id, code, name, description, objective, weight, display_order, scoring_rubric, ai_prompt) VALUES
  (cat_b_id, 'A4', 'Market Maturity', 'Analyze funding landscape, business model convergence, customer adoption', 'Assess whether the market has evolved to PE-scale companies with proven business models', 25.00, 1,
   '{"1": {"label": "Too Early", "description": "VC-Models; early stage funding primarily"}, "3": {"label": "Transitioning", "description": "Series C+ rounds occurring, some PE entries but mostly growth equity"}, "5": {"label": "Mature", "description": "Enterprise customers deploying at scale, early consolidation beginning"}}'::jsonb,
   'Evaluate the maturity of the market by analyzing the funding landscape, business model convergence, and level of enterprise customer adoption.'),
  
  (cat_b_id, 'B1', 'Market Fragmentation', 'Census viable targets; benchmark top players; assess M&A landscape', 'Confirm market offers actionable platform targets and bolt-ons', 25.00, 2,
   '{"1": {"label": "Few targets", "description": "Challenging"}, "3": {"label": "2-4 platforms", "description": "Viable"}, "5": {"label": "Multiple platforms + bolt-ons", "description": "Ideal"}}'::jsonb,
   'Research the number of viable platform companies and bolt-on acquisition targets in this market.'),
  
  (cat_b_id, 'B2', 'Competitive Landscape & Moat', 'Analyse basis of competition, switching costs, feasibility of moat-building', 'Assess if a platform can build a sustainable moat', 25.00, 3,
   '{"1": {"label": "Entrenched, price-led", "description": "Hostile"}, "3": {"label": "Strong incumbents", "description": "Competitive"}, "5": {"label": "Weak moats ripe for disruption", "description": "Favourable"}}'::jsonb,
   'Analyze the competitive dynamics, switching costs, and potential for building sustainable competitive advantages.'),
  
  (cat_b_id, 'B3', 'Exit Environment', 'Map recent deals, logical buyers, and motivations', 'Confirm a clear and liquid path to exit in 3-5 years', 25.00, 4,
   '{"1": {"label": "Few buyers", "description": "Illiquid"}, "3": {"label": "Moderate activity", "description": "Viable"}, "5": {"label": "Active M&A and logical acquirers", "description": "Robust"}}'::jsonb,
   'Research recent M&A activity, identify logical strategic and financial buyers, and assess exit viability.');

  -- C. Regulatory & Policy (2 criteria)
  INSERT INTO framework_criteria (category_id, code, name, description, objective, weight, display_order, scoring_rubric, ai_prompt) VALUES
  (cat_c_id, 'C1', 'Regulatory & Policy Landscape', 'Assess regulatory maturity and enforcement', 'Evaluate level and breadth of regulations and policy underlying theme', 50.00, 1,
   '{"1": {"label": "No binding regulatory frameworks", "description": ""}, "3": {"label": "Some fragmented non-binding regulatory frameworks", "description": ""}, "5": {"label": "At least one binding and implemented regulation", "description": ""}}'::jsonb,
   'Research binding regulations, policy frameworks, and enforcement mechanisms supporting this theme.'),
  
  (cat_c_id, 'C2', 'Regulatory Dependency', 'Analyse % demand from ROI vs regulation; review policy status and risks', 'Distinguish between regulation as tailwind vs. sole driver', 50.00, 2,
   '{"1": {"label": "Policy-only driver", "description": "High Risk"}, "3": {"label": "Mix of ROI and policy", "description": "Medium Risk"}, "5": {"label": "ROI-driven, policy accelerates", "description": "Low Risk"}}'::jsonb,
   'Evaluate the balance between regulatory-driven demand and economic ROI-driven adoption.');

  -- D. Economic Risk (2 criteria)
  INSERT INTO framework_criteria (category_id, code, name, description, objective, weight, display_order, scoring_rubric, ai_prompt) VALUES
  (cat_d_id, 'D1', 'Market Timing & Adoption Risk', 'Assess technology readiness, adoption signals, and customer barriers', 'Test whether the theme is at the optimal "tipping point"', 50.00, 1,
   '{"1": {"label": "Too early/too late", "description": "High Risk"}, "3": {"label": "Emerging, still costly/complex", "description": "Medium Risk"}, "5": {"label": "Proven, inflecting", "description": "Low Risk"}}'::jsonb,
   'Analyze technology maturity, customer adoption signals, and barriers to widespread adoption.'),
  
  (cat_d_id, 'D2', 'Macroeconomic Sensitivity', 'Classify value proposition (compliance, cost-savings, growth); map OPEX vs CAPEX spend', 'Evaluate resilience to downturns, inflation, and rates', 50.00, 2,
   '{"1": {"label": "Highly discretionary", "description": "High Risk"}, "3": {"label": "Some cyclical exposure", "description": "Medium Risk"}, "5": {"label": "Mission-critical, countercyclical", "description": "Low Risk"}}'::jsonb,
   'Assess whether demand is mission-critical or discretionary, and sensitivity to economic cycles.');

  -- E. Impact (4 qualitative criteria)
  INSERT INTO framework_criteria (category_id, code, name, description, objective, weight, display_order, scoring_rubric, ai_prompt) VALUES
  (cat_e_id, 'E1', 'Environmental Impact Scale', 'Quantify potential GHG reduction, resource savings, or environmental benefits', 'Assess the magnitude of environmental benefits achievable through this theme', 0.00, 1, NULL,
   'Evaluate the potential scale of environmental impact, including GHG emissions reduction and resource efficiency gains.'),
  
  (cat_e_id, 'E2', 'Social Impact Potential', 'Evaluate job creation, community benefits, and societal value', 'Assess social benefits and community impact potential of the theme', 0.00, 2, NULL,
   'Analyze potential social benefits including employment, community development, and quality of life improvements.'),
  
  (cat_e_id, 'E3', 'Impact Measurability', 'Assess availability of metrics, standards, and reporting frameworks', 'Evaluate the feasibility of measuring and reporting impact outcomes', 0.00, 3, NULL,
   'Review available frameworks, metrics, and standards for measuring and reporting impact.'),
  
  (cat_e_id, 'E4', 'Impact-Return Alignment', 'Evaluate correlation between commercial success and impact delivery', 'Assess whether business growth naturally drives impact at scale', 0.00, 4, NULL,
   'Analyze the alignment between revenue growth and environmental/social impact delivery.');

  -- F. Fund Right to Win (3 qualitative criteria)
  INSERT INTO framework_criteria (category_id, code, name, description, objective, weight, display_order, scoring_rubric, ai_prompt) VALUES
  (cat_f_id, 'F1', 'Team Expertise & Network', 'Evaluate fund team knowledge, sector experience, and connections', 'Assess the fund competitive advantages through team knowledge and connections', 0.00, 1, NULL,
   'Evaluate team sector expertise, operational experience, and network strength in this theme.'),
  
  (cat_f_id, 'F2', 'Value Creation Capability', 'Assess unique value-add services and support the fund can provide', 'Evaluate what unique value the fund can provide to portfolio companies in this theme', 0.00, 2, NULL,
   'Analyze the fund unique value creation capabilities, including operational support and strategic guidance.'),
  
  (cat_f_id, 'F3', 'Competitive Positioning', 'Compare fund advantages versus other investors targeting this theme', 'Evaluate the fund competitive advantages versus other investors', 0.00, 3, NULL,
   'Assess competitive differentiation, deal flow access, and positioning versus other PE/growth investors.');

END $$;