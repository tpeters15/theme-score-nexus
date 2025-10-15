-- Step 2: Link regulations to Green Workforce & Skills theme

INSERT INTO theme_regulations (
  theme_id,
  regulation_id,
  relevance_score,
  impact_description,
  criteria_impacts
) VALUES
(
  '2fa96ad6-d24d-4a75-b89a-6e1899a00693',
  'fba53515-7ca3-4806-972d-e9fbfd636d91', -- RED II
  5,
  'Primary compliance driver creating mandatory installer certification requirements for renewable heating/cooling technologies. RED III updates (2023) tighten standards for solar PV, heat pump, and biomass installers, directly mandating accredited training programs. Drives 40% of compliance-driven market demand (representing ~€240M of total €0.6bn TAM). Certification prerequisite for accessing renewable energy subsidies creates captive demand for training providers with approved accreditation.',
  ARRAY['A1', 'A2', 'C1', 'C2']
),
(
  '2fa96ad6-d24d-4a75-b89a-6e1899a00693',
  '5b83f3fb-01a2-4404-9204-8075a89ca233', -- EPBD
  5,
  'Core demand driver creating massive skills shortage: EU needs 750,000 additional heat pump installers by 2030 to meet zero-emission building targets. Mandates national renovation roadmaps and MEPS standards driving sustained 8% CAGR through 2050. Creates long-term structural demand for HVAC, building retrofit, energy management, and commissioning training. Largest single regulatory catalyst for theme with multi-decade runway.',
  ARRAY['A1', 'A2', 'A3', 'B1', 'C1', 'C2']
),
(
  '2fa96ad6-d24d-4a75-b89a-6e1899a00693',
  'e10b0ff1-3433-454a-b437-cd64d90fcf45', -- Pact for Skills
  4,
  'Framework enabling private B2B training market development through employer pledges and industry-led consortia. Target: 3 million+ workers upskilled in green skills by 2030. Creates market structure for training providers to access co-funding and establish long-term contracts with large employers. Supports platform value proposition by legitimizing private sector role in workforce development versus public institutions.',
  ARRAY['A2', 'B1', 'C2']
),
(
  '2fa96ad6-d24d-4a75-b89a-6e1899a00693',
  'fc0362a1-eb44-4ab7-8f50-ed072cfab6be', -- EED
  4,
  'Compliance lever requiring large enterprises to conduct energy audits every 4 years (Article 8) and promoting qualified installer certifications (Articles 11-17). Creates recurring demand for energy auditor training and certification programs. 11.7% energy consumption reduction target by 2030 accelerates need for efficiency professionals. Represents ~15% of compliance-driven training demand.',
  ARRAY['A1', 'C1', 'C2']
),
(
  '2fa96ad6-d24d-4a75-b89a-6e1899a00693',
  'f3031b76-fc94-466a-8e10-efa9f375c0e6', -- Just Transition & Social Climate Funds
  3,
  'Funding enabler providing €17.5bn (Just Transition) + €65bn+ (Social Climate Fund 2026-2032) for workforce transition support. Enables public-private partnerships where B2B training providers can access co-funding for green skills delivery in coal/carbon-intensive regions (Poland, Germany, Romania priority). Creates revenue opportunity but requires navigating public procurement complexity. Moderate impact as supplementary revenue stream rather than core demand driver.',
  ARRAY['A2', 'C2']
);