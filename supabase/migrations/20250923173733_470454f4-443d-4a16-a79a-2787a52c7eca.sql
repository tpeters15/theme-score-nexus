-- Insert comprehensive detailed scores for Industrial Energy Efficiency & Optimisation
-- Using valid scores: 1, 3, or 5 only
INSERT INTO detailed_scores (theme_id, criteria_id, score, confidence, notes, analyst_notes, update_source)
SELECT 
  t.id as theme_id,
  fc.id as criteria_id,
  CASE fc.code
    WHEN 'A1' THEN 5  -- Market Attractiveness - Market Size & Growth (High)
    WHEN 'A2' THEN 3  -- Market Attractiveness - Competitive Landscape (Medium)
    WHEN 'B1' THEN 5  -- Fund Fit - Business Model Alignment (High)
    WHEN 'B2' THEN 5  -- Fund Fit - Strategic Alignment (High)
    WHEN 'C1' THEN 3  -- Investability - Market Fragmentation (Medium)
    WHEN 'C2' THEN 5  -- Investability - Exit Environment (High)
    WHEN 'D1' THEN 3  -- Risk Profile - Technology Risk (Medium)
    WHEN 'D2' THEN 1  -- Risk Profile - Regulatory Risk (Low risk = good for investment)
    WHEN 'E1' THEN 5  -- Right to Win - Team & Network (High)
    ELSE 3
  END as score,
  CASE fc.code
    WHEN 'A1' THEN 'High'
    WHEN 'A2' THEN 'Medium'
    WHEN 'B1' THEN 'High'
    WHEN 'B2' THEN 'High'
    WHEN 'C1' THEN 'Medium'
    WHEN 'C2' THEN 'High'
    WHEN 'D1' THEN 'Medium'
    WHEN 'D2' THEN 'High'
    WHEN 'E1' THEN 'High'
    ELSE 'Medium'
  END as confidence,
  CASE fc.code
    WHEN 'A1' THEN 'Large addressable market driven by EU regulations and energy cost pressures. Industrial energy costs represent 20-30% of total operational expenses.'
    WHEN 'A2' THEN 'Fragmented market with mix of software providers, service companies, and equipment manufacturers. Consolidation opportunities exist.'
    WHEN 'B1' THEN 'Perfect alignment with decarbonisation thesis. Strong ROI models with 2-4 year payback periods typical.'
    WHEN 'B2' THEN 'Strategic fit with portfolio companies and network. Cross-selling opportunities with other energy services.'
    WHEN 'C1' THEN 'Market fragmentation creates challenges but also consolidation opportunities for well-positioned players.'
    WHEN 'C2' THEN 'Strong exit environment with strategic acquirers (utilities, industrial services) and financial buyers active.'
    WHEN 'D1' THEN 'Mature technologies with proven track record. IoT and AI integration adding new capabilities.'
    WHEN 'D2' THEN 'Regulatory tailwinds from EU taxonomy, CSRD, and national energy efficiency mandates.'
    WHEN 'E1' THEN 'Strong team expertise in industrial operations and energy management. Extensive network in target sectors.'
    ELSE 'Standard assessment criteria'
  END as notes,
  CASE fc.code
    WHEN 'A1' THEN 'Market size estimated at €15-20B in Europe with 8-12% CAGR driven by regulatory mandates'
    WHEN 'A2' THEN 'Top 10 players control <30% market share, significant white space for growth'
    WHEN 'B1' THEN 'Demonstrated ROI of 15-25% typical, strong alignment with impact investing principles'
    WHEN 'B2' THEN 'Synergies with existing portfolio in smart building and energy management sectors'
    WHEN 'C1' THEN 'Fragmentation creates M&A opportunities but also competitive pricing pressure'
    WHEN 'C2' THEN 'Recent exits: Schneider Electric acquisitions, Siemens portfolio expansion'
    WHEN 'D1' THEN 'Core technologies mature, differentiation through AI/ML and integration capabilities'
    WHEN 'D2' THEN 'Strong regulatory support from EU Energy Efficiency Directive and national policies'
    WHEN 'E1' THEN 'Team has direct experience with industrial energy audits and efficiency implementations'
    ELSE 'Standard evaluation pending detailed analysis'
  END as analyst_notes,
  'manual' as update_source
FROM themes t
CROSS JOIN framework_criteria fc
WHERE t.name = 'Industrial Energy Efficiency & Optimisation'
ON CONFLICT (theme_id, criteria_id) DO UPDATE SET
  score = EXCLUDED.score,
  confidence = EXCLUDED.confidence,
  notes = EXCLUDED.notes,
  analyst_notes = EXCLUDED.analyst_notes,
  updated_at = now();

-- Insert research documents (without created_by since it requires auth)
INSERT INTO research_documents (theme_id, criteria_id, title, description, document_type)
SELECT 
  t.id as theme_id,
  fc.id as criteria_id,
  CASE 
    WHEN fc.code = 'A1' THEN 'EU Industrial Energy Efficiency Market Analysis 2024'
    WHEN fc.code = 'A2' THEN 'Competitive Landscape: Energy Management Software Providers'
    WHEN fc.code = 'B1' THEN 'ROI Analysis: Industrial Energy Efficiency Investments'
    WHEN fc.code = 'C1' THEN 'Market Fragmentation Study: Opportunities for Consolidation'
    WHEN fc.code = 'D2' THEN 'Regulatory Impact Assessment: EU Energy Efficiency Directive'
  END as title,
  CASE 
    WHEN fc.code = 'A1' THEN 'Comprehensive market sizing and growth projections for industrial energy efficiency solutions across EU27'
    WHEN fc.code = 'A2' THEN 'Analysis of key players, market positioning, and competitive dynamics in the energy management software space'
    WHEN fc.code = 'B1' THEN 'Financial modeling and ROI case studies from recent industrial energy efficiency implementations'
    WHEN fc.code = 'C1' THEN 'Assessment of market structure, key players, and consolidation opportunities'
    WHEN fc.code = 'D2' THEN 'Analysis of current and upcoming regulations affecting industrial energy efficiency requirements'
  END as description,
  'market_analysis' as document_type
FROM themes t
CROSS JOIN framework_criteria fc
WHERE t.name = 'Industrial Energy Efficiency & Optimisation'
  AND fc.code IN ('A1', 'A2', 'B1', 'C1', 'D2');

-- Insert regulatory linkages
INSERT INTO theme_regulations (theme_id, regulation_id, relevance_score, impact_description, criteria_impacts)
SELECT 
  t.id as theme_id,
  r.id as regulation_id,
  CASE 
    WHEN r.title ILIKE '%energy efficiency%' THEN 95
    WHEN r.title ILIKE '%industrial%' OR r.title ILIKE '%carbon%' THEN 85
    WHEN r.title ILIKE '%taxonomy%' OR r.title ILIKE '%disclosure%' THEN 75
    ELSE 60
  END as relevance_score,
  CASE 
    WHEN r.title ILIKE '%energy efficiency%' THEN 'Direct regulatory driver for industrial energy efficiency investments and mandatory audits'
    WHEN r.title ILIKE '%industrial%' THEN 'Creates compliance requirements driving demand for energy management solutions'
    WHEN r.title ILIKE '%taxonomy%' THEN 'Defines eligible activities and technical screening criteria for sustainable investments'
    ELSE 'Indirect regulatory influence on industrial decarbonisation requirements'
  END as impact_description,
  CASE 
    WHEN r.title ILIKE '%energy efficiency%' THEN ARRAY['A1', 'A2', 'D2']
    WHEN r.title ILIKE '%industrial%' THEN ARRAY['A1', 'B1', 'D2']
    WHEN r.title ILIKE '%taxonomy%' THEN ARRAY['B1', 'B2', 'D2']
    ELSE ARRAY['D2']
  END as criteria_impacts
FROM themes t
CROSS JOIN regulations r
WHERE t.name = 'Industrial Energy Efficiency & Optimisation'
  AND (
    r.title ILIKE '%energy efficiency%' OR
    r.title ILIKE '%industrial%' OR
    r.title ILIKE '%carbon%' OR
    r.title ILIKE '%taxonomy%' OR
    r.title ILIKE '%disclosure%'
  )
ON CONFLICT (theme_id, regulation_id) DO UPDATE SET
  relevance_score = EXCLUDED.relevance_score,
  impact_description = EXCLUDED.impact_description,
  criteria_impacts = EXCLUDED.criteria_impacts,
  updated_at = now();