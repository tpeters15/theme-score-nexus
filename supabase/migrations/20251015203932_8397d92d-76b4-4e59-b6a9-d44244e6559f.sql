-- Update framework categories to correct structure
UPDATE framework_categories 
SET name = 'Market Attractiveness', code = 'A'
WHERE code = 'A';

UPDATE framework_categories 
SET name = 'Investability', code = 'B'
WHERE code = 'B';

UPDATE framework_categories 
SET name = 'Regulatory Dependency & Economic Risk', code = 'C'
WHERE code = 'C';

-- Update criteria codes and names for Category A (Market Attractiveness)
UPDATE framework_criteria 
SET code = 'A1', name = 'Total Addressable Market (TAM)'
WHERE code = 'A1';

UPDATE framework_criteria 
SET code = 'A2', name = 'Serviceable Obtainable Market (SOM)'
WHERE code = 'A2';

UPDATE framework_criteria 
SET code = 'A3', name = 'CAGR'
WHERE code = 'A3';

UPDATE framework_criteria 
SET code = 'A4', name = 'Market Maturity'
WHERE code = 'A4';

-- Update criteria codes and names for Category B (Investability)
UPDATE framework_criteria 
SET code = 'B1', name = 'Market Fragmentation'
WHERE code = 'B1';

UPDATE framework_criteria 
SET code = 'B2', name = 'Competitive Moat'
WHERE code = 'B2';

UPDATE framework_criteria 
SET code = 'B3', name = 'Exit Quality'
WHERE code = 'B3';

-- Update criteria codes and names for Category C (Regulatory Dependency & Economic Risk)
UPDATE framework_criteria 
SET code = 'C1', name = 'Regulatory Dependency'
WHERE code = 'C1';

UPDATE framework_criteria 
SET code = 'C2', name = 'Timing Risk'
WHERE code = 'C2';

UPDATE framework_criteria 
SET code = 'C3', name = 'Macro Sensitivity'
WHERE code = 'C3';