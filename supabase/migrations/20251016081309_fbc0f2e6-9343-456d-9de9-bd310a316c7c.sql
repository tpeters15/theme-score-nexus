-- Map 3 water efficiency signals to Water Efficiency theme
INSERT INTO theme_signals (theme_id, processed_signal_id, relevance_score, ai_analysis)
VALUES 
  (
    'aa637432-d6c1-47c8-94b8-2bad7e55f5d0',
    '093240a7-e4ec-47f7-8b57-7a439e475e3e',
    0.95,
    'Italy''s severe water infrastructure crisis showcases critical demand for leak detection and non-revenue water solutions. Directly relevant to water efficiency platform targets in Southern Europe.'
  ),
  (
    'aa637432-d6c1-47c8-94b8-2bad7e55f5d0',
    '12108f88-747f-4fb0-b1e9-cd489018078c',
    0.98,
    'EU €99M digital water efficiency grant program validates market opportunity for IoT sensors, AI analytics, and SaaS models - core business archetypes in water efficiency thesis.'
  ),
  (
    'aa637432-d6c1-47c8-94b8-2bad7e55f5d0',
    '85ea74a9-e1e4-4ed2-a8c4-fb9b3f39fd13',
    0.85,
    'Wastewater treatment acquisition demonstrates active M&A market in industrial water efficiency segment, aligning with buy-and-build investment strategy.'
  )
ON CONFLICT (theme_id, processed_signal_id) DO NOTHING;