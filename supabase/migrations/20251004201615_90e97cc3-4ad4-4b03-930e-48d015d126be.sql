-- Insert Pillars
INSERT INTO public.taxonomy_pillars (name, description, display_order) VALUES
('Decarbonisation', 'Companies reducing direct greenhouse gas emissions across mobility, buildings, industry, and agriculture', 1),
('Energy Transition', 'Companies enabling the shift to renewable energy through generation, transmission, storage, and services', 2),
('Resource Sustainability', 'Companies improving resource efficiency through water, waste, circular economy, land conservation, and pollution reduction', 3);

-- Insert Sectors
INSERT INTO public.taxonomy_sectors (pillar_id, name, description, display_order) VALUES
((SELECT id FROM taxonomy_pillars WHERE name = 'Decarbonisation'), 'Mobility', 'Transport decarbonisation and electrification', 1),
((SELECT id FROM taxonomy_pillars WHERE name = 'Decarbonisation'), 'Buildings', 'Building energy efficiency and decarbonisation', 2),
((SELECT id FROM taxonomy_pillars WHERE name = 'Decarbonisation'), 'Industry', 'Industrial process efficiency and emissions reduction', 3),
((SELECT id FROM taxonomy_pillars WHERE name = 'Decarbonisation'), 'Agriculture', 'Agricultural emissions reduction and sustainable farming', 4),
((SELECT id FROM taxonomy_pillars WHERE name = 'Energy Transition'), 'Renewable Energy Generation', 'Renewable energy development and operations', 1),
((SELECT id FROM taxonomy_pillars WHERE name = 'Energy Transition'), 'Energy Transmission', 'Electrical grid infrastructure and management', 2),
((SELECT id FROM taxonomy_pillars WHERE name = 'Energy Transition'), 'Energy Storage', 'Battery and energy storage systems', 3),
((SELECT id FROM taxonomy_pillars WHERE name = 'Resource Sustainability'), 'Water Management', 'Water treatment, efficiency, and reuse', 1),
((SELECT id FROM taxonomy_pillars WHERE name = 'Resource Sustainability'), 'Waste & Circular Economy', 'Waste reduction and circular business models', 2),
((SELECT id FROM taxonomy_pillars WHERE name = 'Resource Sustainability'), 'Land & Conservation', 'Ecosystem services and land management', 3),
((SELECT id FROM taxonomy_pillars WHERE name = 'Resource Sustainability'), 'Pollution Reduction', 'Air, soil, and water pollution control', 4),
((SELECT id FROM taxonomy_pillars WHERE name = 'Resource Sustainability'), 'Climate Technology', 'Cross-cutting climate innovation and technology', 5);

-- Insert Themes (Part 1: Decarbonisation - Mobility)
INSERT INTO public.taxonomy_themes (sector_id, name, description, impact, in_scope, out_of_scope, example_companies, common_edge_cases, key_identifiers) VALUES
(
  (SELECT id FROM taxonomy_sectors WHERE name = 'Mobility'),
  'EV Charging Infrastructure',
  'Companies that develop, manufacture, install, operate, or manage electric vehicle charging infrastructure and its supporting ecosystem, enabling mass EV adoption by addressing the critical infrastructure gap in transport electrification.',
  'Reduces transport emissions by removing the primary barrier to EV adoption (charging anxiety), enabling the transition from internal combustion engines to electric vehicles across passenger and commercial segments.',
  ARRAY['EV charger and EVSE hardware manufacturing and components', 'Public and private charging network deployment and operations', 'Charge point operators (CPO) and e-mobility service providers (EMSP)', 'Charging management software, payment, and roaming platforms', 'Smart charging, load management, and V2G solutions', 'Installation, commissioning, and maintenance services', 'Grid connection and electrical infrastructure for EV charging', 'Charging-as-a-Service (CaaS) and other charging business models', 'Battery swapping infrastructure and mobile charging services'],
  ARRAY['Electric vehicle manufacturers (except dedicated charging divisions)', 'General electrical contractors without EV specialization', 'Utility companies without dedicated charging operations', 'Fleet management without charging infrastructure (→ Fleet Electrification)', 'Parking operators without primary charging focus'],
  ARRAY['ChargePoint (network operator)', 'Tritium (hardware manufacturer)', 'Driivz (software platform)', 'Qmerit (installation services)', 'Electrify America (infrastructure owner)'],
  'Vehicle OEM charging networks → Include if operated as distinct unit serving external customers; Fleet operators with private charging → Classify in Fleet Electrification if fleet services dominate; Parking/retail operators adding charging → Include if charging revenue >30% or strategic focus; Software serving multiple mobility sectors → Classify by primary customer segment; Battery swapping vs charging → Include here unless integrated with fleet services',
  ARRAY['CPO', 'EMSP', 'EVSE', 'OCPP', 'V2G', 'DC fast charging', 'depot charging', 'charging-as-a-service']
),
(
  (SELECT id FROM taxonomy_sectors WHERE name = 'Mobility'),
  'Fleet Electrification',
  'Companies that enable and manage the transition of commercial vehicle fleets from internal combustion to electric powertrains, providing comprehensive services from planning through operations to accelerate fleet decarbonization.',
  'Reduces transport emissions by addressing the unique barriers to commercial fleet electrification (TCO analysis, route planning, depot charging, vehicle selection), enabling rapid scale deployment of electric vehicles in high-mileage commercial applications.',
  ARRAY['Fleet electrification consulting and transition planning services', 'Managed charging services for fleet operators', 'Depot charging design, installation, and operations', 'Fleet management software with EV-specific capabilities', 'EV fleet financing, leasing, and procurement platforms', 'Route optimization and duty cycle analysis tools', 'Fleet telematics and performance monitoring systems', 'Battery health management for fleet vehicles', 'Fleet-as-a-Service and turnkey electrification offerings'],
  ARRAY['Pure EV charging infrastructure without fleet focus (→ EV Charging Infrastructure)', 'Electric vehicle manufacturing', 'Traditional fleet management without electrification focus', 'General vehicle leasing without EV specialization', 'Logistics operations without fleet ownership/management (→ Logistics Decarbonisation)'],
  ARRAY['The Mobility House (managed charging)', 'Electriphi (fleet planning software)', 'Highland Fleets (FaaS)', 'Lightning eMotors (fleet solutions)', 'Motive (EV fleet management)'],
  'Charging companies serving fleets → Include if fleet-specific services dominate; Telematics companies adding EV features → Include if EV fleet is primary focus; Bus operators electrifying own fleet → Include if offering services to other operators; Logistics companies with electric fleets → Classify in Logistics Decarbonisation if goods movement is primary; Companies combining fleet and stationary storage → Classify by dominant revenue stream',
  ARRAY['FaaS', 'TCO optimization', 'depot charging', 'managed charging', 'duty cycle analysis', 'V2X']
),
(
  (SELECT id FROM taxonomy_sectors WHERE name = 'Mobility'),
  'Alternative Fuels',
  'Companies developing, producing, distributing, and enabling the use of low-carbon alternatives to fossil fuels including hydrogen, biofuels, e-fuels, and ammonia across transport and industrial applications.',
  'Decarbonizes hard-to-electrify sectors (aviation, shipping, heavy transport, industrial heat) by replacing fossil fuels with lower-carbon alternatives, enabling emissions reduction where direct electrification is not technically or economically feasible.',
  ARRAY['Alternative fuel production equipment and electrolyzer manufacturing', 'Hydrogen production facilities and electrolyzer operations', 'Biofuel production from waste, crops, or synthetic biology', 'E-fuel and synthetic fuel production facilities', 'Alternative fuel distribution and logistics infrastructure', 'Hydrogen refueling station development and operations', 'Fuel cell manufacturing and integration', 'Alternative fuel storage and transportation solutions', 'Fuel conversion technology and retrofit services', 'Carbon capture for blue hydrogen production'],
  ARRAY['Electric vehicle charging infrastructure (→ EV Charging Infrastructure)', 'Natural gas distribution without hydrogen blending', 'Traditional fossil fuel refining and distribution', 'Feedstock extraction and farming (crop farming for biofuels, natural gas extraction)', 'Industrial gas production for non-fuel uses'],
  ARRAY['Plug Power (hydrogen infrastructure)', 'Neste (renewable diesel)', 'Infinium (e-fuels)', 'ITM Power (electrolyzers)', 'Ballard Power (fuel cells)'],
  'Industrial gas companies adding hydrogen → Include if fuel applications dominate; Utilities with hydrogen blending → Include if dedicated hydrogen business unit; Waste companies producing biogas → Include if upgrading to transportation fuel; Electrolyzer manufacturers vs operators → Both included but classify by primary business; Aviation companies using SAF → Only include if producing or distributing fuel; Equipment manufacturers for fuel production → Include if specialized for alternative fuels',
  ARRAY['Green hydrogen', 'blue hydrogen', 'HRS', 'SAF (sustainable aviation fuel)', 'renewable diesel', 'e-fuels', 'power-to-X', 'electrolyzers', 'ammonia fuel']
);