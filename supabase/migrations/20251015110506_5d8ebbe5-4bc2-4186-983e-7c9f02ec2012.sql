-- Step 6: Upload research document for Green Workforce & Skills theme

INSERT INTO research_documents (
  theme_id,
  title,
  description,
  document_type,
  file_path,
  created_by,
  mime_type
) VALUES (
  '2fa96ad6-d24d-4a75-b89a-6e1899a00693',
  'Green Workforce & Skills - Full PE Thematic Research Report',
  'Comprehensive 50-page research report covering market sizing (£0.6bn TAM, £0.06bn SOM), regulatory landscape (EPBD zero-emission targets, RED II installer certification, EED auditor mandates), skills shortage urgency (750,000 heat pump installers needed by 2030), investability assessment (30 platform targets, 17.5% Top 3 share), business model archetypes (Corporate Training, Certification, Marketplace, AR/VR), and detailed framework scoring. Investment recommendation: WATCH, Score 2.8/5.0. Includes red-team analysis highlighting policy fragility risk (Spain subsidy cuts, UK Green Deal/Homes Grant failures), quality oversight scandals (NAO non-compliance, Learndirect intervention), SOM scale mismatch, and integration complexity across diverse accreditation systems. Platform value creation model: 2.85x MOIC, 24% IRR through buy-and-build. October 2025.',
  'market_report',
  'Green_Workforce_Skills_Full_Report.pdf',
  auth.uid(),
  'application/pdf'
);