-- Delete any existing mappings first to start fresh
DELETE FROM theme_signals WHERE theme_id IN (
  '59276a29-119b-4412-86ae-4725472eb380',
  'cd3dd655-ed9c-42ea-80a1-0bee29dd00b3',
  '138d8cdd-a174-4b51-83df-ebcc3d0e2d73',
  '0a2cff00-5987-472c-8255-ac10f02e5d87',
  'f68542c4-647a-4ff0-b2f1-830d9ee7f99c'
);

-- Theme 1: EV Charging Infrastructure
INSERT INTO theme_signals (theme_id, processed_signal_id, relevance_score, ai_analysis) VALUES
('59276a29-119b-4412-86ae-4725472eb380', 'a7024c8e-09a6-4d09-ae3b-21facf9678f8', 0.95, 'Milepost £47.42M growth equity - Direct EV charging operator demonstrating strong capital flows into charging infrastructure'),
('59276a29-119b-4412-86ae-4725472eb380', 'a3030b32-58a0-4309-8676-c13a847d24ea', 0.75, 'Gridserve solar & storage - Battery storage increasingly integrated with EV charging to manage grid load'),
('59276a29-119b-4412-86ae-4725472eb380', '62f4ff77-debb-47ca-9233-5e5cc9151029', 0.70, 'LC Engineers £51.12M - Engineering firms critical for EV charging network design and installation');

-- Theme 2: Renewable Energy EPC & O&M
INSERT INTO theme_signals (theme_id, processed_signal_id, relevance_score, ai_analysis) VALUES
('cd3dd655-ed9c-42ea-80a1-0bee29dd00b3', 'a3030b32-58a0-4309-8676-c13a847d24ea', 0.95, 'Gridserve 139 MW acquisition - Direct renewable energy operations and maintenance transaction'),
('cd3dd655-ed9c-42ea-80a1-0bee29dd00b3', '62f4ff77-debb-47ca-9233-5e5cc9151029', 0.80, 'LC Engineers - Engineering services for renewable project construction and commissioning'),
('cd3dd655-ed9c-42ea-80a1-0bee29dd00b3', 'a7024c8e-09a6-4d09-ae3b-21facf9678f8', 0.65, 'Milepost - Infrastructure development parallel to renewable energy buildout');

-- Theme 3: Grid Infrastructure & Connection  
INSERT INTO theme_signals (theme_id, processed_signal_id, relevance_score, ai_analysis) VALUES
('138d8cdd-a174-4b51-83df-ebcc3d0e2d73', 'a3030b32-58a0-4309-8676-c13a847d24ea', 0.90, 'Gridserve - Grid connection infrastructure for distributed renewable resources'),
('138d8cdd-a174-4b51-83df-ebcc3d0e2d73', '62f4ff77-debb-47ca-9233-5e5cc9151029', 0.75, 'LC Engineers - Grid infrastructure engineering and design services'),
('138d8cdd-a174-4b51-83df-ebcc3d0e2d73', 'a7024c8e-09a6-4d09-ae3b-21facf9678f8', 0.70, 'Milepost - EV charging requires grid upgrades and connection capacity');

-- Theme 4: Recycling & Material Recovery
INSERT INTO theme_signals (theme_id, processed_signal_id, relevance_score, ai_analysis) VALUES
('0a2cff00-5987-472c-8255-ac10f02e5d87', 'c96cf1de-b2bb-4479-ba0f-ffa53c606264', 0.95, 'Accurec €65M - Battery recycling and materials recovery driven by EU regulations'),
('0a2cff00-5987-472c-8255-ac10f02e5d87', 'a3030b32-58a0-4309-8676-c13a847d24ea', 0.70, 'Gridserve - Battery storage end-of-life creates recycling opportunities'),
('0a2cff00-5987-472c-8255-ac10f02e5d87', '62f4ff77-debb-47ca-9233-5e5cc9151029', 0.60, 'LC Engineers - Engineering for recycling facility design and operations');

-- Theme 5: Industrial & Commercial Energy Efficiency
INSERT INTO theme_signals (theme_id, processed_signal_id, relevance_score, ai_analysis) VALUES
('f68542c4-647a-4ff0-b2f1-830d9ee7f99c', '62f4ff77-debb-47ca-9233-5e5cc9151029', 0.85, 'LC Engineers - Energy efficiency consulting and implementation services'),
('f68542c4-647a-4ff0-b2f1-830d9ee7f99c', 'a3030b32-58a0-4309-8676-c13a847d24ea', 0.75, 'Gridserve - Commercial energy management through storage optimization'),
('f68542c4-647a-4ff0-b2f1-830d9ee7f99c', 'c96cf1de-b2bb-4479-ba0f-ffa53c606264', 0.65, 'Accurec - Industrial process optimization in recycling operations');