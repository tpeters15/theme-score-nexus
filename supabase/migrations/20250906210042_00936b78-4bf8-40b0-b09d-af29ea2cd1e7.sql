-- Drop existing themes table and recreate with proper hierarchy
DROP TABLE IF EXISTS themes CASCADE;

-- Create themes table with 3-level hierarchy
CREATE TABLE themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  pillar TEXT NOT NULL,
  sector TEXT NOT NULL,
  description TEXT,
  in_scope TEXT[],
  out_of_scope TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for hierarchy navigation
CREATE INDEX idx_themes_pillar ON themes(pillar);
CREATE INDEX idx_themes_sector ON themes(sector);
CREATE INDEX idx_themes_pillar_sector ON themes(pillar, sector);

-- Insert the complete theme taxonomy
-- Decarbonisation Pillar
-- Mobility Sector
INSERT INTO themes (name, pillar, sector, description, in_scope, out_of_scope) VALUES
('EV Charging Infrastructure', 'Decarbonisation', 'Mobility', 'Companies whose PRIMARY business is EV charging infrastructure', 
  ARRAY['Public charging network operators', 'Depot and fleet charging EPC providers', 'Charging-as-a-Service platforms', 'Grid connection specialists for EV charging', 'Charging uptime optimization software', 'Charging payment and access platforms'],
  ARRAY['Charging hardware manufacturers (OEMs)', 'Companies where charging is secondary to fleet services', 'Electrical contractors without EV specialization', 'General parking operators adding chargers']),

('Fleet Electrification Services', 'Decarbonisation', 'Mobility', 'Managing the complete transition of commercial fleets to electric vehicles',
  ARRAY['Fleet electrification consulting and planning', 'Managed charging services for fleet operators', 'Fleet financing and leasing platforms', 'TCO optimization and route planning software', 'Fleet telematics focused on EV performance'],
  ARRAY['Pure charging infrastructure providers', 'Vehicle manufacturers', 'General fleet management without EV focus', 'Traditional vehicle leasing companies']),

('Alternative Fuel Infrastructure & Services', 'Decarbonisation', 'Mobility', 'Enabling deployment of low-carbon fuel infrastructure',
  ARRAY['Hydrogen refueling station EPC/O&M', 'Biofuel distribution and logistics services', 'Alternative fuel compliance and certification', 'Safety and training services for alternative fuels', 'Alternative fuel fleet management platforms'],
  ARRAY['Fuel production facilities', 'Electrolyzer manufacturers', 'Feedstock producers', 'Research-stage fuel technologies']),

('Public & Shared Transport Digital Platforms', 'Decarbonisation', 'Mobility', 'Digital platforms optimizing public and shared transport',
  ARRAY['Multi-modal journey planning apps', 'Transit fleet management software', 'MaaS (Mobility-as-a-Service) platforms', 'Digital ticketing and payment systems', 'Micromobility sharing platforms', 'Paratransit optimization software'],
  ARRAY['Vehicle manufacturers', 'Traditional taxi companies', 'Transit infrastructure construction', 'Consumer ride-hailing without sustainability focus']),

('Logistics Decarbonisation Platforms', 'Decarbonisation', 'Mobility', 'Software reducing emissions in freight and delivery',
  ARRAY['Route optimization for lower emissions', 'Digital freight matching and pooling', 'Last-mile delivery optimization', 'Supply chain emissions tracking', 'Green logistics marketplaces'],
  ARRAY['Logistics companies without tech platform', 'Warehouse automation', 'Traditional 3PL providers', 'General supply chain software without emissions focus']),

('Battery Lifecycle Services', 'Decarbonisation', 'Mobility', 'Managing EV battery health and end-of-life',
  ARRAY['Battery diagnostics and health monitoring', 'Second-life battery deployment services', 'Battery collection and logistics', 'Pre-processing for recycling', 'Battery-as-a-Service platforms'],
  ARRAY['Battery cell manufacturing', 'Chemical recycling plants', 'Raw material mining/refining', 'New battery R&D']),

('Marine Decarbonisation Platforms', 'Decarbonisation', 'Mobility', 'Digital solutions reducing maritime emissions',
  ARRAY['Voyage optimization software', 'Port call optimization platforms', 'Maritime emissions MRV systems', 'Green shipping marketplaces', 'Vessel performance monitoring'],
  ARRAY['Ship building or retrofitting', 'Marine fuel production', 'Port infrastructure development', 'Shipping companies']);

-- Buildings Sector
INSERT INTO themes (name, pillar, sector, description, in_scope, out_of_scope) VALUES
('Building Control & Optimization Systems', 'Decarbonisation', 'Buildings', 'Active building management systems optimizing energy',
  ARRAY['Building Management Systems (BMS)', 'HVAC optimization software', 'Smart thermostat platforms', 'Demand response aggregation', 'Occupancy-based control systems', 'Building performance analytics with control'],
  ARRAY['Passive monitoring without control', 'Manual energy audits', 'Hardware manufacturing', 'Pure compliance reporting tools']),

('Building Retrofit & Envelope Services', 'Decarbonisation', 'Buildings', 'Physical building improvements to reduce energy demand',
  ARRAY['Insulation installation services', 'Window and glazing upgrades', 'Air sealing contractors', 'Whole-building retrofit packages', 'Digital retrofit marketplaces', 'Retrofit project management platforms'],
  ARRAY['Materials manufacturing', 'General construction', 'New build developers', 'HVAC system installation']),

('Residential Decarbonisation Platforms', 'Decarbonisation', 'Buildings', 'Integrated platforms for home energy transition',
  ARRAY['Home energy assessment and planning platforms', 'Heat pump installation and financing bundles', 'Integrated solar + storage + EV charging', 'Home energy subscription services', 'Residential VPP operators', 'Green home warranty/insurance platforms'],
  ARRAY['Single-product installers', 'Traditional HVAC contractors', 'Utility companies', 'Mortgage providers']),

('Green Building Materials & Supply Chain', 'Decarbonisation', 'Buildings', 'Platforms providing low-carbon building materials',
  ARRAY['Low-carbon materials marketplaces', 'Embodied carbon tracking platforms', 'Sustainable materials distribution', 'Reclaimed materials platforms', 'Green building product certification'],
  ARRAY['Primary materials manufacturing', 'Traditional building supplies', 'Construction companies', 'Mining and extraction']);

-- Industry Sector
INSERT INTO themes (name, pillar, sector, description, in_scope, out_of_scope) VALUES
('Industrial Energy Efficiency & Optimisation', 'Decarbonisation', 'Industry', 'Reducing industrial energy consumption',
  ARRAY['Industrial energy management software', 'AI-driven process optimization', 'Compressed air optimization', 'Motor and drive efficiency services', 'Waste heat recovery services', 'Energy audit and implementation services'],
  ARRAY['Equipment manufacturing', 'Basic automation without efficiency focus', 'General industrial IoT', 'Electrification projects']),

('Industrial Electrification & Heat Services', 'Decarbonisation', 'Industry', 'Transitioning from fossil fuels to electric heating',
  ARRAY['Industrial heat pump integration services', 'Electric boiler/furnace installation', 'Process electrification consulting', 'High-temperature heat pump services', 'Thermal storage integration'],
  ARRAY['Heat pump manufacturing', 'Power generation', 'Traditional boiler services', 'General electrical contractors']),

('Industrial Emissions Monitoring & MRV', 'Decarbonisation', 'Industry', 'Real-time emissions tracking and compliance',
  ARRAY['Continuous emissions monitoring systems (CEMS)', 'Carbon accounting for manufacturing', 'Regulatory compliance software', 'Emissions reduction planning tools', 'Supply chain emissions tracking'],
  ARRAY['Sensor manufacturing', 'General ERP systems', 'Financial reporting tools', 'Emissions control hardware']);

-- Agriculture Sector
INSERT INTO themes (name, pillar, sector, description, in_scope, out_of_scope) VALUES
('Precision Agriculture & Data Platforms', 'Decarbonisation', 'Agriculture', 'Digital platforms optimizing farm operations',
  ARRAY['Variable rate application systems', 'Crop monitoring and analytics platforms', 'Soil health monitoring networks', 'Farm management software with sustainability', 'Agricultural IoT platforms', 'Satellite/drone imagery analytics'],
  ARRAY['Agricultural machinery manufacturing', 'Seed/chemical production', 'Traditional farm equipment dealers', 'Food processing', 'Alternative protein manufacturing']),

('Regenerative Farming Services', 'Decarbonisation', 'Agriculture', 'Services supporting regenerative agriculture',
  ARRAY['Regenerative agriculture consulting', 'Cover crop and rotation planning services', 'Biological/organic input suppliers', 'Carbon credit development for farms', 'Sustainable grazing management', 'Agroforestry services'],
  ARRAY['Conventional farming services', 'Heavy machinery', 'Land acquisition', 'Traditional crop insurance', 'Alternative protein production']);

-- Energy Transition Pillar
-- Clean Energy Services Sector
INSERT INTO themes (name, pillar, sector, description, in_scope, out_of_scope) VALUES
('Renewable Energy EPC & O&M', 'Energy Transition', 'Clean Energy Services', 'Building and maintaining renewable energy assets',
  ARRAY['Solar/wind installation services', 'O&M service providers', 'Performance optimization services', 'Repowering and upgrade services', 'Drone inspection services', 'Cleaning and maintenance robotics'],
  ARRAY['Panel/turbine manufacturing', 'Project development/ownership', 'Utilities', 'Raw materials suppliers']),

('Energy Management & Optimization Software', 'Energy Transition', 'Clean Energy Services', 'Software for energy monitoring and trading',
  ARRAY['Energy management systems for C&I', 'Virtual Power Plant software', 'Energy trading and risk management', 'Renewable energy forecasting', 'PPA management platforms', 'Energy procurement software'],
  ARRAY['Hardware manufacturing', 'Physical trading desks', 'Utilities', 'Building-specific BMS']),

('Clean Energy Advisory & Development Services', 'Energy Transition', 'Clean Energy Services', 'Professional services for renewable projects',
  ARRAY['Permitting and interconnection consulting', 'Environmental impact assessments', 'PPA structuring advisory', 'Technical due diligence services', 'Grid integration studies', 'Community solar platforms'],
  ARRAY['Project ownership/development', 'Legal services', 'General management consulting', 'Financial advisory without energy focus']),

('Green Workforce & Skills Platforms', 'Energy Transition', 'Clean Energy Services', 'Training and deploying clean energy workers',
  ARRAY['Renewable energy technician training', 'Green jobs marketplaces', 'Certification management for clean energy', 'VR/AR training for energy workers', 'Contractor aggregation platforms'],
  ARRAY['General job boards', 'Traditional trade schools', 'Corporate training without green focus', 'University programs']);

-- Energy Transmission Sector
INSERT INTO themes (name, pillar, sector, description, in_scope, out_of_scope) VALUES
('Grid Infrastructure & Connection Services', 'Energy Transition', 'Energy Transmission', 'Physical services connecting renewables to grid',
  ARRAY['Grid connection EPC services', 'Substation construction/upgrades', 'Interconnection queue management', 'Grid protection and testing services', 'Transmission line services'],
  ARRAY['Utility ownership', 'High-voltage equipment manufacturing', 'Traditional electrical contractors', 'Telecom infrastructure']),

('Smart Grid & Demand Response Platforms', 'Energy Transition', 'Energy Transmission', 'Digital platforms for grid flexibility',
  ARRAY['Demand response aggregation platforms', 'Grid analytics and optimization software', 'Distributed energy resource management', 'Grid flexibility marketplaces', 'Advanced metering infrastructure software', 'Microgrid control systems'],
  ARRAY['Meter manufacturing', 'Traditional SCADA without smart features', 'Utility billing systems', 'Consumer energy apps']),

('Grid Operations & Maintenance Services', 'Energy Transition', 'Energy Transmission', 'Maintaining transmission infrastructure',
  ARRAY['Vegetation management services', 'Drone/satellite line inspection', 'Predictive maintenance for grid assets', 'Storm response services', 'Grid asset management software'],
  ARRAY['Equipment manufacturing', 'Utility operations', 'General landscaping', 'Traditional maintenance']);

-- Energy Storage Sector
INSERT INTO themes (name, pillar, sector, description, in_scope, out_of_scope) VALUES
('Storage Integration & O&M Services', 'Energy Transition', 'Energy Storage', 'Deploying and maintaining battery systems',
  ARRAY['BESS installation and commissioning', 'Storage O&M services', 'Hybrid renewable + storage integration', 'Storage safety and compliance services', 'Residential storage installation networks', 'Storage-as-a-Service providers'],
  ARRAY['Battery cell manufacturing', 'Inverter manufacturing', 'Project development/ownership', 'Raw materials mining']),

('Storage Software & Optimization Platforms', 'Energy Transition', 'Energy Storage', 'Software maximizing storage value',
  ARRAY['Battery management systems software', 'Storage trading and dispatch optimization', 'Battery analytics and diagnostics', 'Warranty and performance management', 'Storage VPP platforms', 'Revenue stacking optimization'],
  ARRAY['Hardware embedded firmware only', 'Physical trading desks', 'Project finance', 'General energy software']);

-- Resource Sustainability Pillar
-- Water Management Sector
INSERT INTO themes (name, pillar, sector, description, in_scope, out_of_scope) VALUES
('Water Treatment & Reuse Services', 'Resource Sustainability', 'Water Management', 'Treating and recycling water',
  ARRAY['Industrial water treatment services', 'Wastewater treatment technology', 'Water reuse and recycling systems', 'Modular/containerized treatment', 'Biotreatment services', 'Point-of-use treatment systems'],
  ARRAY['Municipal water utilities', 'Large-scale desalination plants', 'Chemical manufacturing', 'Bottled water companies']),

('Smart Water Infrastructure & Analytics', 'Resource Sustainability', 'Water Management', 'Digital platforms for water optimization',
  ARRAY['Smart water meter platforms', 'Leak detection and prediction systems', 'Water network digital twins', 'Consumption analytics platforms', 'Pressure management systems', 'Water quality monitoring networks'],
  ARRAY['Pipe manufacturing', 'Meter hardware manufacturing', 'Traditional SCADA systems', 'Physical infrastructure construction']),

('Water Efficiency Services', 'Resource Sustainability', 'Water Management', 'Services reducing water consumption',
  ARRAY['Water audit and reduction consulting', 'Irrigation optimization services', 'Leak repair services', 'Water recycling system installation', 'Rainwater harvesting systems', 'Water-efficient fixture programs'],
  ARRAY['Plumbing supplies manufacturing', 'General plumbing services', 'Landscape design without water focus', 'Pool maintenance']);

-- Circular Economy Sector
INSERT INTO themes (name, pillar, sector, description, in_scope, out_of_scope) VALUES
('Recycling & Material Recovery Services', 'Resource Sustainability', 'Circular Economy', 'Collecting and processing recyclables',
  ARRAY['E-waste collection and processing', 'Plastics recycling services', 'Metal recovery services', 'Textile recycling', 'Construction waste recycling', 'Material sorting technology services'],
  ARRAY['Landfill operations', 'Incineration', 'Raw materials trading', 'Chemical recycling R&D']),

('Circular Logistics & Reverse Supply Chain', 'Resource Sustainability', 'Circular Economy', 'Enabling product returns and refurbishment',
  ARRAY['Take-back program platforms', 'Refurbishment and repair networks', 'Remanufacturing services', 'Returns optimization software', 'Asset recovery services', 'Circular supply chain software'],
  ARRAY['Traditional forward logistics', 'New product manufacturing', 'Warranty services only', 'Linear retail models']),

('Circular Business Model Platforms', 'Resource Sustainability', 'Circular Economy', 'Enabling sharing and rental models',
  ARRAY['B2B equipment sharing platforms', 'Product-as-a-Service enablement', 'Rental and subscription platforms', 'Peer-to-peer sharing marketplaces', 'Circular design software', 'Material exchange marketplaces'],
  ARRAY['Traditional retail', 'Linear subscription boxes', 'Software-as-a-Service', 'Financial leasing only']),

('Sustainable Materials & Packaging', 'Resource Sustainability', 'Circular Economy', 'Eco-friendly material alternatives',
  ARRAY['Sustainable packaging distributors', 'Biomaterial supply platforms', 'Packaging optimization software', 'Reusable packaging systems', 'Material traceability platforms', 'Compostable materials distribution'],
  ARRAY['Virgin plastic production', 'Primary materials manufacturing', 'Traditional packaging companies', 'Paper mills', 'Alternative protein manufacturing']),

('Upcycling & Remanufacturing Services', 'Resource Sustainability', 'Circular Economy', 'Transforming waste into higher value',
  ARRAY['Industrial remanufacturing services', 'Upcycled consumer goods', 'Component harvesting and resale', 'Waste-to-product platforms', 'Creative reuse services'],
  ARRAY['Basic recycling', 'Downcycling operations', 'Craft/artisan businesses', 'Energy recovery from waste']);

-- Land & Conservation Sector
INSERT INTO themes (name, pillar, sector, description, in_scope, out_of_scope) VALUES
('Natural Capital & Ecosystem Services', 'Resource Sustainability', 'Land & Conservation', 'Monetizing ecosystem services',
  ARRAY['Carbon credit platforms', 'Biodiversity credit platforms', 'Natural capital accounting software', 'Conservation finance platforms', 'Ecosystem services marketplaces', 'Impact verification services'],
  ARRAY['Land acquisition', 'Traditional conservation NGOs', 'Government programs', 'Academic research']),

('Ecosystem Restoration Services', 'Resource Sustainability', 'Land & Conservation', 'Actively restoring degraded ecosystems',
  ARRAY['Reforestation services', 'Wetland restoration contractors', 'Coastal restoration services', 'Mine site rehabilitation', 'Urban greening services', 'Native plant nurseries for restoration'],
  ARRAY['Landscaping for aesthetics', 'Traditional forestry', 'Agricultural services', 'Land development']),

('Sustainable Land Management Platforms', 'Resource Sustainability', 'Land & Conservation', 'Technology for sustainable forestry',
  ARRAY['Forest inventory platforms', 'Precision forestry software', 'Fire risk management systems', 'Sustainable harvest planning', 'Land use optimization platforms', 'Deforestation monitoring'],
  ARRAY['Timber harvesting operations', 'Pulp and paper production', 'Agricultural machinery', 'Real estate development']);

-- Pollution Reduction Sector
INSERT INTO themes (name, pillar, sector, description, in_scope, out_of_scope) VALUES
('Air Quality Monitoring & Control', 'Resource Sustainability', 'Pollution Reduction', 'Monitoring and reducing air pollution',
  ARRAY['Air quality monitoring networks', 'Indoor air quality services', 'Industrial emissions control services', 'Mobile emissions testing', 'Air purification services', 'Pollution forecasting platforms'],
  ARRAY['Sensor manufacturing only', 'HVAC without air quality focus', 'Weather monitoring', 'Consumer air purifiers']),

('Soil Remediation Services', 'Resource Sustainability', 'Pollution Reduction', 'Cleaning contaminated land',
  ARRAY['Brownfield remediation services', 'Bioremediation contractors', 'Soil washing services', 'Groundwater treatment services', 'Environmental site assessments', 'Phytoremediation services'],
  ARRAY['Agricultural soil improvement', 'Landscaping', 'Mining operations', 'Waste disposal']),

('Industrial Emissions Control Services', 'Resource Sustainability', 'Pollution Reduction', 'Capturing industrial pollutants',
  ARRAY['Fugitive emissions detection', 'Scrubber installation and maintenance', 'Methane capture services', 'VOC control services', 'Flare gas recovery services', 'Emissions control optimization'],
  ARRAY['Equipment manufacturing', 'Basic industrial maintenance', 'Safety equipment only', 'Monitoring without mitigation']);