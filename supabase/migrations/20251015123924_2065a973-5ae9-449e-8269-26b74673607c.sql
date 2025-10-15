-- Link regulations to Green Workforce & Skills theme (using valid relevance_score 1-5 range)
INSERT INTO theme_regulations (theme_id, regulation_id, relevance_score, impact_description, criteria_impacts)
VALUES
('2fa96ad6-d24d-4a75-b89a-6e1899a00693', '4c4d8455-f7fd-4362-8490-8214203fda5d', 5, 
 'RED II Article 18 certification requirements create direct compliance demand for installer training programs. Mandatory for all heat pump, solar PV, and biomass installations across EU-27, driving stable B2B demand for accredited training providers.',
 ARRAY['C1']),
('2fa96ad6-d24d-4a75-b89a-6e1899a00693', '40f6be73-7182-46a2-a690-6a8b2aa291cb', 5,
 'EPBD recast creates urgent skills shortage crisis - EU needs 750,000 additional heat pump installers by 2030. Binding renovation targets and zero-emission building mandates drive massive multi-year demand for workforce training, particularly in building retrofit and heat pump installation.',
 ARRAY['A1', 'A3', 'C1', 'D1']),
('2fa96ad6-d24d-4a75-b89a-6e1899a00693', 'eb9075e3-f94b-4aeb-8be4-7b44a9c09b2a', 4,
 'Pact for Skills aims to deliver 3 million green training opportunities by 2025, providing public-private partnership framework and potential co-funding for training platforms. Supports market development but not binding.',
 ARRAY['C1', 'D1']),
('2fa96ad6-d24d-4a75-b89a-6e1899a00693', '6bb7d14d-eaa3-4649-b0aa-a2d5221af489', 5,
 'EED recast Article 22 mandates availability of qualified energy auditors and building professionals. Creates compliance-driven demand for energy efficiency certification and training programs, particularly for HVAC, BMS, and commissioning skills.',
 ARRAY['A1', 'C1']),
('2fa96ad6-d24d-4a75-b89a-6e1899a00693', 'db8d1c57-d819-4f8d-97c2-860caa828a53', 3,
 'Just Transition Fund and Social Climate Fund provide €65bn+ funding for worker reskilling in green sectors. Creates public funding opportunities for training providers but depends on national program design and procurement processes.',
 ARRAY['C1', 'D2']);