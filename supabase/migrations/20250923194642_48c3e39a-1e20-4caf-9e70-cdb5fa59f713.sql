-- Update category weights to reflect that only A, B, C are scored
-- D and E are qualitative content only

UPDATE public.framework_categories 
SET weight = 33.33 
WHERE code IN ('A', 'B');

UPDATE public.framework_categories 
SET weight = 33.34 
WHERE code = 'C';

UPDATE public.framework_categories 
SET weight = 0 
WHERE code IN ('D', 'E');