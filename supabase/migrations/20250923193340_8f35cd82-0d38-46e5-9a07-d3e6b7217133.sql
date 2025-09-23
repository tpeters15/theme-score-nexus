-- Add missing A4 - Market Maturity criterion to Market Attractiveness category

INSERT INTO public.framework_criteria (category_id, name, code, description, objective, weight, display_order, scoring_rubric, ai_prompt) VALUES
((SELECT id FROM public.framework_categories WHERE code = 'A'), 'Market Maturity', 'A4', 'Assessment of market development stage and customer adoption maturity', 'To evaluate whether the market is mature enough for scalable platform businesses to succeed.', 25.0, 4, '{"1": {"label": "Nascent", "description": "Early-stage market, low customer awareness/adoption"}, "3": {"label": "Developing", "description": "Growing market, increasing customer adoption"}, "5": {"label": "Mature", "description": "Established market, proven customer demand"}}', 'What is the current maturity level of this market? How advanced is customer awareness and adoption? Are there established market leaders and proven business models?');

-- Update weights for existing A1, A2, A3 criteria to account for the 4th criterion
UPDATE public.framework_criteria 
SET weight = 25.0 
WHERE category_id = (SELECT id FROM public.framework_categories WHERE code = 'A') 
AND code IN ('A1', 'A2', 'A3');