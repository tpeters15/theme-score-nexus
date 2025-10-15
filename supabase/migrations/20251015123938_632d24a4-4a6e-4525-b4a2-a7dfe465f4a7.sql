-- Update taxonomy_themes with complete keywords and description
UPDATE taxonomy_themes
SET 
  keywords = ARRAY[
    'green skills training', 'workforce development', 'installer certification', 'heat pump training',
    'solar PV training', 'EPBD compliance', 'RED II certification', 'building retrofit skills',
    'energy auditor training', 'HVAC training', 'BMS training', 'commissioning training',
    'vocational training', 'LMS platforms', 'EdTech', 'job marketplaces', 'green jobs',
    'VR/AR training', 'simulation training', 'apprenticeship programs', 'reskilling',
    'upskilling', 'renewable energy training', 'energy efficiency training', 'climate jobs',
    'contractor training', 'installer accreditation', 'certification bodies', 'skills shortage',
    'labor market', 'workforce transition', 'SaaS training platforms', 'placement services',
    'quality assurance', 'field training', 'technical training'
  ],
  description = 'Asset-light training platforms, job marketplaces, and digital upskilling solutions addressing Europe''s green workforce shortage. Key business model archetypes include: (1) SaaS Training Platforms (LMS/certification portals, 70-80% gross margins, £50-200k ACV); (2) Tech-Enabled Staffing/Marketplaces (job matching for green trades, 40-60% margins, network effects); (3) VR/AR Simulation Training (immersive modules for installers, 70-80% margins but high R&D); and (4) Commissioning/QA SaaS (building operations optimization, 10-30% energy savings). Investment thesis targets fragmented buy-and-build opportunity with ~30 viable platform targets (£3-20M revenue) before consolidation begins, capturing 40% compliance-driven demand (EPBD, RED II, EED mandates) plus 60% ROI-resilient revenue. Market timing optimal as EPBD creates urgent 2030 deadline for 750,000 additional heat pump installers. Overall recommendation: WATCH (2.8/5.0 weighted score) - attractive fragmentation and policy tailwinds offset by weak moats, small SOM (€0.06bn), thin exit environment, and high policy volatility risk.',
  updated_at = now()
WHERE id = '2fa96ad6-d24d-4a75-b89a-6e1899a00693';