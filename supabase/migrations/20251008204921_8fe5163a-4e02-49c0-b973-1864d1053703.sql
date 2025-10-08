-- =====================================================
-- Insert all 39 themes with complete details (Part 2)
-- =====================================================
DO $$
DECLARE
  -- Sector IDs
  sector_mobility_id uuid;
  sector_buildings_id uuid;
  sector_industry_id uuid;
  sector_agriculture_id uuid;
  sector_clean_energy_id uuid;
  sector_transmission_id uuid;
  sector_storage_id uuid;
  sector_water_id uuid;
  sector_circular_id uuid;
  sector_land_id uuid;
  sector_pollution_id uuid;
BEGIN
  -- Get all sector IDs
  SELECT id INTO sector_mobility_id FROM taxonomy_sectors WHERE name = 'Mobility';
  SELECT id INTO sector_buildings_id FROM taxonomy_sectors WHERE name = 'Buildings';
  SELECT id INTO sector_industry_id FROM taxonomy_sectors WHERE name = 'Industry';
  SELECT id INTO sector_agriculture_id FROM taxonomy_sectors WHERE name = 'Agriculture';
  SELECT id INTO sector_clean_energy_id FROM taxonomy_sectors WHERE name = 'Clean Energy Services';
  SELECT id INTO sector_transmission_id FROM taxonomy_sectors WHERE name = 'Energy Transmission';
  SELECT id INTO sector_storage_id FROM taxonomy_sectors WHERE name = 'Energy Storage';
  SELECT id INTO sector_water_id FROM taxonomy_sectors WHERE name = 'Water Management';
  SELECT id INTO sector_circular_id FROM taxonomy_sectors WHERE name = 'Circular Economy';
  SELECT id INTO sector_land_id FROM taxonomy_sectors WHERE name = 'Land & Conservation';
  SELECT id INTO sector_pollution_id FROM taxonomy_sectors WHERE name = 'Pollution Reduction';

  -- Insert all themes
  INSERT INTO taxonomy_themes (sector_id, name, description, impact, in_scope, out_of_scope, common_edge_cases, key_identifiers, is_active, version) VALUES
  
  -- MOBILITY THEMES
  (sector_mobility_id, 'EV Charging Infrastructure', 
    'Companies that develop, manufacture, install, operate, or manage electric vehicle charging infrastructure and its supporting ecosystem, enabling mass EV adoption by addressing the critical infrastructure gap in transport electrification.',
    'Reduces transport emissions by removing the primary barrier to EV adoption (charging anxiety), enabling the transition from internal combustion engines to electric vehicles across passenger and commercial segments.',
    ARRAY['EV charger and EVSE hardware manufacturing and components', 'Public and private charging network deployment and operations', 'Charge point operators (CPO) and e-mobility service providers (EMSP)', 'Charging management software, payment, and roaming platforms', 'Smart charging, load management, and V2G solutions', 'Installation, commissioning, and maintenance services', 'Grid connection and electrical infrastructure for EV charging', 'Charging-as-a-Service (CaaS) and other charging business models', 'Battery swapping infrastructure and mobile charging services'],
    ARRAY['Electric vehicle manufacturers (except dedicated charging divisions)', 'General electrical contractors without EV specialization', 'Utility companies without dedicated charging operations', 'Fleet management without charging infrastructure (→ Fleet Electrification)', 'Parking operators without primary charging focus'],
    'Vehicle OEM charging networks → Include if operated as distinct unit serving external customers; Fleet operators with private charging → Classify in Fleet Electrification if fleet services dominate; Parking/retail operators adding charging → Include if charging revenue >30% or strategic focus',
    ARRAY['CPO', 'EMSP', 'EVSE', 'OCPP', 'V2G', 'DC fast charging', 'depot charging', 'charging-as-a-service'],
    true, 2),

  (sector_mobility_id, 'Fleet Electrification',
    'Companies that enable and manage the transition of commercial vehicle fleets from internal combustion to electric powertrains, providing comprehensive services from planning through operations to accelerate fleet decarbonization.',
    'Reduces transport emissions by addressing the unique barriers to commercial fleet electrification (TCO analysis, route planning, depot charging, vehicle selection), enabling rapid scale deployment of electric vehicles in high-mileage commercial applications.',
    ARRAY['Fleet electrification consulting and transition planning services', 'Managed charging services for fleet operators', 'Depot charging design, installation, and operations', 'Fleet management software with EV-specific capabilities', 'EV fleet financing, leasing, and procurement platforms', 'Route optimization and duty cycle analysis tools', 'Fleet telematics and performance monitoring systems', 'Battery health management for fleet vehicles', 'Fleet-as-a-Service and turnkey electrification offerings'],
    ARRAY['Pure EV charging infrastructure without fleet focus (→ EV Charging Infrastructure)', 'Electric vehicle manufacturing', 'Traditional fleet management without electrification focus', 'General vehicle leasing without EV specialization', 'Logistics operations without fleet ownership/management (→ Logistics Decarbonisation)'],
    'Charging companies serving fleets → Include if fleet-specific services dominate; Telematics companies adding EV features → Include if EV fleet is primary focus; Bus operators electrifying own fleet → Include if offering services to other operators',
    ARRAY['FaaS', 'TCO optimization', 'depot charging', 'managed charging', 'duty cycle analysis', 'V2X'],
    true, 2),

  (sector_mobility_id, 'Alternative Fuels',
    'Companies developing, producing, distributing, and enabling the use of low-carbon alternatives to fossil fuels including hydrogen, biofuels, e-fuels, and ammonia across transport and industrial applications.',
    'Decarbonizes hard-to-electrify sectors (aviation, shipping, heavy transport, industrial heat) by replacing fossil fuels with lower-carbon alternatives, enabling emissions reduction where direct electrification is not technically or economically feasible.',
    ARRAY['Alternative fuel production equipment and electrolyzer manufacturing', 'Hydrogen production facilities and electrolyzer operations', 'Biofuel production from waste, crops, or synthetic biology', 'E-fuel and synthetic fuel production facilities', 'Alternative fuel distribution and logistics infrastructure', 'Hydrogen refueling station development and operations', 'Fuel cell manufacturing and integration', 'Alternative fuel storage and transportation solutions', 'Fuel conversion technology and retrofit services', 'Carbon capture for blue hydrogen production'],
    ARRAY['Electric vehicle charging infrastructure (→ EV Charging Infrastructure)', 'Natural gas distribution without hydrogen blending', 'Traditional fossil fuel refining and distribution', 'Feedstock extraction and farming (crop farming for biofuels, natural gas extraction)', 'Industrial gas production for non-fuel uses'],
    'Industrial gas companies adding hydrogen → Include if fuel applications dominate; Utilities with hydrogen blending → Include if dedicated hydrogen business unit; Electrolyzer manufacturers vs operators → Both included but classify by primary business',
    ARRAY['Green hydrogen', 'blue hydrogen', 'HRS', 'SAF', 'renewable diesel', 'e-fuels', 'power-to-X', 'electrolyzers', 'ammonia fuel'],
    true, 2),

  (sector_mobility_id, 'Public & Shared Transport',
    'Companies that develop technology, operate services, or provide infrastructure enabling public transit, rail transport, shared mobility, and multi-modal transportation to reduce private vehicle use and improve sustainable urban mobility access.',
    'Reduces transport emissions by shifting trips from private vehicles to shared modes, increasing vehicle utilization rates, and optimizing transit operations to make sustainable transport more accessible and efficient than individual car ownership.',
    ARRAY['Shared micromobility services (bikes, e-bikes, scooters, mopeds)', 'Car-sharing and ride-pooling platforms', 'Multi-modal journey planning and MaaS platforms', 'Transit operations software and optimization systems', 'Transit ticketing and fare payment systems', 'Demand-responsive and paratransit services', 'Transit data analytics and passenger flow management', 'First/last-mile connectivity solutions', 'Public transit technology and management systems', 'Rail operations optimization and energy efficiency', 'Rail electrification consulting and services (exclude infrastructure construction)'],
    ARRAY['Transit operators and authorities (TfL, RATP, MTA, etc.)', 'Private ride-hailing without shared/pooling focus', 'Vehicle manufacturing for transit systems', 'Transit infrastructure construction (rails, stations)', 'Traditional taxi services without technology platform', 'Freight and goods delivery (→ Logistics Decarbonisation)'],
    'Ride-hailing companies with pooling → Include only if pooled/shared rides >50% of trips; Navigation apps with transit features → Include if public/shared transport is primary focus; E-scooter manufacturers vs operators → Classify operators here, manufacturers elsewhere',
    ARRAY['MaaS', 'micromobility', 'DRT', 'paratransit', 'ride-pooling', 'car-sharing', 'transit optimization'],
    true, 2),

  (sector_mobility_id, 'Logistics Decarbonisation',
    'Companies that optimize freight movement and last-mile delivery through technology platforms, route optimization, and sustainable logistics solutions to reduce emissions from goods transportation.',
    'Reduces freight emissions by optimizing routes, improving vehicle utilization, enabling modal shifts, and coordinating deliveries to eliminate empty miles and inefficient distribution patterns in the movement of goods.',
    ARRAY['Route optimization software for freight and delivery', 'Digital freight marketplaces and load matching platforms', 'Last-mile delivery optimization and management platforms', 'Supply chain emissions tracking and reporting tools', 'Urban consolidation and microhub operations', 'Parcel locker networks and alternative delivery points', 'Logistics orchestration and multi-carrier platforms', 'Reverse logistics optimization for returns', 'Freight pooling and collaborative logistics platforms'],
    ARRAY['Logistics companies without technology platform (traditional 3PLs)', 'Vehicle manufacturing for logistics', 'Warehouse automation without transport focus', 'Pure e-commerce platforms without logistics focus', 'Fleet electrification services (→ Fleet Electrification)'],
    'E-commerce companies with logistics arms → Include only if logistics offered to third parties; Traditional logistics companies adding digital → Include if platform is primary value; Fleet management for logistics → Classify in Fleet Electrification if EV focus',
    ARRAY['TMS', 'last-mile', 'middle-mile', 'load matching', 'digital freight', 'microhubs', 'PUDO'],
    true, 2),

  (sector_mobility_id, 'Battery Lifecycle',
    'Companies manufacturing batteries for electric vehicles and managing the complete lifecycle of batteries from manufacturing with recycled materials through second-life applications, collection, recycling, and material recovery, maximizing value and minimizing environmental impact of battery systems.',
    'Reduces environmental impact of electrification by extending battery useful life through second-life applications, recovering critical materials for new production, and preventing hazardous waste from entering landfills.',
    ARRAY['Battery collection and reverse logistics services', 'Battery recycling facilities and operations', 'Second-life battery deployment and integration', 'Battery diagnostic and testing services', 'Battery materials recovery and processing', 'Battery asset management platforms', 'Battery-as-a-Service offerings across applications', 'Battery refurbishment and remanufacturing', 'Battery passport and traceability solutions', 'Battery cell and module manufacturing for electric vehicles', 'Battery pack assembly for automotive applications', 'Raw material processing for battery production (cathode materials, electrolyte production)', 'EV battery manufacturing'],
    ARRAY['Mining of virgin materials for batteries', 'Electric vehicle manufacturing', 'Stationary storage deployment without lifecycle focus (→ Storage Integration)', 'Battery management systems for new batteries only', 'Stationary energy storage battery manufacturing (→ Storage Integration & O&M)', 'Mining of virgin materials'],
    'Battery manufacturers with recycling → Include if recycling is separate business unit; EV manufacturers with battery programs → Include if offered as service to others; Energy storage companies using second-life → Classify by primary business model',
    ARRAY['Battery recycling', 'second-life batteries', 'black mass', 'battery diagnostics', 'BaaS', 'SOH', 'urban mining'],
    true, 2),

  (sector_mobility_id, 'Marine Decarbonisation',
    'Companies developing technologies, manufacturing efficiency equipment, and providing operational solutions to reduce emissions from maritime shipping through voyage optimization, vessel efficiency improvements, alternative propulsion, and port operations enhancement.',
    'Addresses emissions from international shipping (3% of global emissions) by enabling operational efficiency, fuel optimization, and vessel performance improvements in a sector where electrification is not viable for long-distance oceangoing vessels, reducing the carbon intensity of global maritime trade.',
    ARRAY['Marine efficiency technology manufacturing (rotor sails, air lubrication systems, hull coatings, propulsion efficiency devices)', 'Voyage and route optimization software for shipping', 'Vessel performance monitoring and analytics platforms', 'Weather routing and just-in-time arrival systems', 'Hull performance management and cleaning services', 'Wind-assisted propulsion technology and deployment', 'Maritime emissions monitoring, reporting, and verification (MRV) systems', 'Shore power systems and cold ironing technology', 'Ballast water and fuel optimization systems'],
    ARRAY['Shipbuilding and ship design (naval architecture)', 'Traditional port operations without sustainability focus', 'Shipping line operators and vessel owners', 'Port infrastructure construction', 'General freight forwarding without optimization', 'Alternative marine fuel production and distribution (→ Alternative Fuels)', 'Cargo booking platforms without emissions optimization'],
    'Alternative fuel infrastructure → Include only if marine-specific systems engineering; Port operators with optimization → Include if offering software/services to other ports; Weather routing services → Include if emissions reduction is primary value proposition',
    ARRAY['Voyage optimization', 'CII', 'EEXI', 'SEEMP', 'rotor sails', 'air lubrication', 'just-in-time arrival', 'shore power', 'MRV systems'],
    true, 2),

  (sector_mobility_id, 'Aviation Decarbonisation',
    'Companies developing technologies, manufacturing efficiency equipment, and providing operational solutions to reduce emissions from aviation through flight optimization, air traffic management, aerodynamic improvements, and ground operations efficiency.',
    'Addresses emissions from aviation (2.5% of global emissions) by optimizing flight operations, improving aerodynamic efficiency, reducing fuel consumption, and enhancing air traffic flow in a sector where full electrification is decades away for commercial aviation, making flying progressively less carbon-intensive.',
    ARRAY['Aircraft efficiency technology manufacturing (winglets, drag reduction devices, weight reduction technologies)', 'Flight planning and optimization software', 'Continuous descent and arrival optimization systems', 'Contrail reduction and avoidance technology', 'Air traffic flow management and optimization', 'Aircraft performance monitoring and fuel efficiency analytics', 'Ground operations optimization (taxiing, APU reduction, gate management)', 'Aviation emissions tracking and carbon accounting platforms', 'Electric taxiing systems and ground support equipment', 'Single-engine taxiing and fuel efficiency technologies'],
    ARRAY['Aircraft manufacturing and design', 'Airport infrastructure construction', 'Airline operations and carriers', 'General aviation and business jets (unless focused on efficiency technology)', 'Sustainable aviation fuel (SAF) production and refining (→ Alternative Fuels)', 'SAF distribution and fuel infrastructure (→ Alternative Fuels, unless aviation-specific engineering)', 'Air traffic control authorities and governmental bodies', 'Electric aircraft manufacturers (nascent/R&D stage)'],
    'SAF infrastructure → Include only if specialized aviation fuel systems engineering; Airlines with optimization platforms → Include if offering software/services to other airlines; Electric aircraft companies → Currently too early stage; include only if operational efficiency focus',
    ARRAY['Flight optimization', 'CDO', 'contrail avoidance', 'air traffic flow management', 'single-engine taxi', 'APU reduction', 'CORSIA'],
    true, 2);

  -- Continue with more themes...
END $$;