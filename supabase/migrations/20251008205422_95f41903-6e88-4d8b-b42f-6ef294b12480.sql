-- Insert remaining 22 themes from Energy Transition and Resource Sustainability
DO $$
DECLARE
  sector_clean_energy_id uuid;
  sector_transmission_id uuid;
  sector_storage_id uuid;
  sector_water_id uuid;
  sector_circular_id uuid;
  sector_land_id uuid;
  sector_pollution_id uuid;
BEGIN
  SELECT id INTO sector_clean_energy_id FROM taxonomy_sectors WHERE name = 'Clean Energy Services';
  SELECT id INTO sector_transmission_id FROM taxonomy_sectors WHERE name = 'Energy Transmission';
  SELECT id INTO sector_storage_id FROM taxonomy_sectors WHERE name = 'Energy Storage';
  SELECT id INTO sector_water_id FROM taxonomy_sectors WHERE name = 'Water Management';
  SELECT id INTO sector_circular_id FROM taxonomy_sectors WHERE name = 'Circular Economy';
  SELECT id INTO sector_land_id FROM taxonomy_sectors WHERE name = 'Land & Conservation';
  SELECT id INTO sector_pollution_id FROM taxonomy_sectors WHERE name = 'Pollution Reduction';

  INSERT INTO taxonomy_themes (sector_id, name, description, impact, in_scope, out_of_scope, common_edge_cases, key_identifiers, is_active, version) VALUES
  
  -- CLEAN ENERGY SERVICES (6 themes)
  (sector_clean_energy_id, 'Renewable Energy EPC & O&M',
    'Companies that design, manufacture, procure, construct, install, operate, and maintain renewable energy assets including solar, wind, and other clean energy installations across utility-scale, commercial, and residential applications.',
    'Accelerates renewable energy deployment by providing the specialized engineering, construction, maintenance capabilities, and equipment required to bring clean energy projects from concept to long-term operation, addressing the execution gap between renewable energy development and operational assets.',
    ARRAY['Renewable energy equipment manufacturing (solar panels, wind turbines, inverters, balance of system)', 'Solar PV installation services (utility, C&I, residential)', 'Wind farm construction and installation services', 'Balance of plant engineering and construction', 'Renewable energy commissioning and testing services', 'O&M service providers for solar and wind assets', 'Performance monitoring and optimization services', 'Repowering and upgrade services for existing assets', 'Cleaning, inspection, and maintenance services', 'Repair services for damaged or underperforming assets', 'Robotic and drone-based inspection and maintenance'],
    ARRAY['Raw materials and component mining (silicon, rare earths)', 'Project development and ownership without operational services', 'Utility operations', 'Energy storage installation (→ Storage Integration & O&M)', 'Renewable energy procurement platforms and PPA management software (→ Renewable Energy Procurement & Trading)'],
    'Manufacturers with service divisions → Include entire company, classify by primary revenue; Developers with construction teams → Include if construction services sold externally; EPC firms adding storage → Classify by dominant revenue stream',
    ARRAY['EPC', 'BOP', 'solar installation', 'wind turbine installation', 'O&M', 'commissioning', 'repowering', 'preventive maintenance'],
    true, 2),

  (sector_clean_energy_id, 'Renewable Energy Procurement & Trading',
    'Companies providing platforms, analytics, and advisory services that enable organizations to source, contract, and manage renewable energy procurement through power purchase agreements, renewable energy certificates, and clean energy marketplace platforms.',
    'Accelerates renewable energy deployment by reducing transaction costs and information asymmetries in corporate renewable procurement, enabling more organizations to become offtakers of clean energy projects and creating liquid markets for renewable energy attributes.',
    ARRAY['Renewable PPA management and analytics platforms', 'Virtual PPA (VPPA) structuring and advisory', 'Renewable energy marketplace and project matching platforms', 'Renewable energy certificate (REC) trading and tracking platforms', 'Corporate renewable energy sourcing advisory services', 'Renewable energy procurement risk management tools', 'Green tariff and utility program optimization platforms'],
    ARRAY['On-site renewable installation (→ Renewable Energy EPC & O&M)', 'Energy storage systems (→ Storage themes)', 'Energy efficiency and demand management (→ Industrial Energy Efficiency)', 'Building energy management systems (→ Building Control & Optimization)', 'Demand response and VPP platforms (→ Industrial Energy Efficiency or Smart Grid)'],
    'Companies offering BOTH procurement and efficiency → Classify by primary revenue (>60% rule); Energy retailers with renewable options → Include only if B2B procurement platform focus',
    ARRAY['PPA management', 'VPPA', 'renewable marketplace', 'REC trading', 'offtake agreements', 'corporate renewable sourcing'],
    true, 2),

  (sector_clean_energy_id, 'Clean Energy Advisory & Development',
    'Companies providing specialized professional services that enable renewable energy projects including permitting, interconnection, environmental assessment, technical due diligence, PPA structuring, community engagement, and development services.',
    'Accelerates renewable deployment by navigating complex regulatory, technical, and stakeholder challenges that often delay or prevent projects, reducing development timelines and de-risking investments in clean energy infrastructure.',
    ARRAY['Renewable energy project developers offering services to third parties', 'Permitting and regulatory consulting for renewable projects', 'Environmental impact assessment and mitigation services', 'Interconnection and grid integration consulting', 'PPA structuring and negotiation advisory', 'Technical due diligence and independent engineering', 'Resource assessment and site evaluation services', 'Community solar platform development and management', 'Stakeholder engagement and community consultation', 'Renewable energy feasibility studies', 'Environmental compliance and monitoring services'],
    ARRAY['Pure project development and ownership without service offerings to others', 'General legal services without renewable specialization', 'Management consulting without energy focus', 'Financial advisory without renewable technical expertise', 'Land acquisition services', 'EPC services (→ Renewable Energy EPC & O&M)'],
    'Engineering firms with consulting arms → Include if renewable advisory is distinct service; Developers offering services → Include if services sold to other developers; PPA structuring advisory → Include if providing project development services',
    ARRAY['Renewable consulting', 'permitting', 'EIA', 'interconnection', 'PPA advisory', 'technical due diligence', 'community solar'],
    true, 2),

  (sector_clean_energy_id, 'Green Workforce & Skills',
    'Companies providing training, certification, workforce development, and recruitment services specifically for the renewable energy and clean technology sectors, building the skilled labor force required for energy transition.',
    'Addresses critical workforce bottlenecks limiting renewable deployment speed by training technicians, connecting workers to green jobs, and upskilling existing workforce for clean energy careers, enabling faster infrastructure buildout.',
    ARRAY['Renewable energy technician training programs', 'Solar and wind installer certification and education', 'Green jobs recruitment and marketplace platforms', 'Contractor aggregation and quality assurance networks', 'VR/AR training for renewable energy workers', 'Safety training specialized for renewables', 'Workforce development platforms for clean energy', 'Apprenticeship program management', 'Continuing education for energy professionals', 'Skills assessment and credentialing services'],
    ARRAY['General job boards without green focus', 'Traditional trade schools without renewable specialization', 'Corporate HR training platforms', 'University degree programs', 'Non-energy specific workforce development'],
    'Trade schools adding solar courses → Include if renewable energy becomes major program; Job boards with green categories → Include only if green jobs are primary focus; Equipment manufacturers with training → Include if training offered commercially',
    ARRAY['Renewable energy training', 'solar training', 'green jobs', 'certification programs', 'NABCEP', 'workforce development'],
    true, 2),

  -- ENERGY TRANSMISSION (3 themes)
  (sector_transmission_id, 'Grid Infrastructure & Connection',
    'Companies manufacturing equipment and providing engineering, construction, installation, and integration services for electrical transmission and distribution infrastructure that connects renewable energy generation to the grid and modernizes electrical networks.',
    'Enables renewable energy integration by building and upgrading the physical electrical infrastructure required to transmit clean power from generation sites to consumption points, addressing grid capacity constraints that limit renewable deployment.',
    ARRAY['Transmission and distribution equipment manufacturing (transformers, switchgear, cables, protection systems)', 'Grid connection EPC services for renewable projects', 'Substation design, construction, and upgrade services', 'Transmission and distribution line installation', 'Interconnection engineering and project management', 'Grid protection equipment installation and commissioning', 'Underground cable installation services', 'Grid reinforcement and capacity upgrade services', 'Testing and commissioning of grid infrastructure', 'Greenfield and brownfield electrical infrastructure development'],
    ARRAY['Utility ownership and operations', 'General electrical contracting without grid focus', 'Telecommunications infrastructure', 'Renewable energy generation equipment installation (→ Renewable Energy EPC)'],
    'Electrical contractors → Include only if specialized in transmission/distribution; Utilities with construction divisions → Include if services offered to third parties; Renewable EPC firms doing grid work → Classify by dominant revenue source',
    ARRAY['Grid connection', 'interconnection', 'transmission infrastructure', 'substation construction', 'switchgear', 'underground cabling'],
    true, 2),

  (sector_transmission_id, 'Smart Grid & Demand Response',
    'Companies providing digital platforms, software systems, and analytics that enable grid flexibility, distributed energy resource management, demand response programs, and intelligent grid operations for utilities and system operators to accommodate variable renewable generation.',
    'Enables higher renewable penetration by using digital technology to balance supply and demand dynamically, manage distributed resources, and maintain grid stability with variable generation, overcoming the intermittency challenge of renewables.',
    ARRAY['Demand response aggregation platforms serving utilities and system operators', 'Distributed energy resource management systems (DERMS) for grid operators', 'Grid analytics and optimization software for utilities', 'Distribution management systems (DMS)', 'Advanced metering infrastructure software platforms', 'Microgrid control and management systems', 'Grid flexibility marketplaces for wholesale/utility markets', 'Power flow modeling and simulation tools', 'Outage management and restoration systems', 'Grid edge intelligence and optimization platforms for utilities'],
    ARRAY['Smart meter hardware manufacturing', 'Traditional SCADA systems without smart grid capabilities', 'Utility billing and customer information systems', 'C&I customer energy apps (→ Energy Management & Optimization)', 'Building-level demand response (→ Building Control & Optimization)'],
    'VPP/DERMS platforms → Include if utility/ISO operators are the primary users for grid operations; Residential DR aggregators → Include only if purely wholesale aggregation with no customer interface; Building platforms offering DR → Exclude',
    ARRAY['Smart grid', 'DMS', 'demand response', 'DERMS', 'VPP', 'AMI', 'microgrid', 'grid flexibility marketplace', 'grid analytics'],
    true, 2),

  (sector_transmission_id, 'Grid Operations & Maintenance',
    'Companies providing specialized operations, maintenance, inspection, and asset management services for electrical transmission and distribution infrastructure to ensure reliable and efficient grid performance.',
    'Maintains grid reliability and capacity for renewable integration by preventing outages, optimizing asset performance, and extending infrastructure lifespan through proactive maintenance, reducing grid constraints on clean energy deployment.',
    ARRAY['Vegetation management services for transmission corridors', 'Drone and aerial inspection services for grid infrastructure', 'Predictive maintenance and condition monitoring platforms', 'Grid asset management software and services', 'Storm response and emergency restoration services', 'Thermographic and diagnostic inspection services', 'Pole inspection and maintenance services', 'Underground cable fault detection and location', 'Asset lifecycle management and replacement planning', 'Grid resilience assessment and hardening services'],
    ARRAY['Electrical equipment manufacturing', 'Utility operations and control centers', 'General landscaping without grid specialization', 'Construction of new infrastructure (→ Grid Infrastructure & Connection)', 'Grid planning and engineering (→ Clean Energy Advisory)'],
    'General tree services → Include only if transmission/distribution is primary market; Drone companies → Include if grid inspection is specialized offering; Utilities with maintenance arms → Include if services offered to other utilities',
    ARRAY['Vegetation management', 'grid inspection', 'drone inspection', 'predictive maintenance', 'asset health monitoring', 'storm response'],
    true, 2),

  -- ENERGY STORAGE (2 themes)
  (sector_storage_id, 'Storage Integration & O&M',
    'Companies that manufacture battery systems, design, install, integrate, commission, operate, and maintain battery energy storage systems across utility-scale, commercial, industrial, and residential applications, enabling storage deployment and long-term performance.',
    'Accelerates energy storage adoption by providing the manufacturing, engineering, installation, and operational expertise required to deploy reliable battery systems that enable renewable energy firming, grid services, and resilience, making variable renewables dispatchable.',
    ARRAY['Battery systems and component manufacturing (cells, modules, packs, inverters, thermal management)', 'Raw material processing for batteries (lithium refining, cathode production, anode materials)', 'Battery storage system design and engineering services', 'Storage installation and commissioning services', 'Hybrid renewable + storage integration services', 'Storage O&M and performance management services', 'Safety system installation and monitoring', 'Residential storage installation networks', 'Storage-as-a-Service providers', 'Repowering and retrofit services for storage assets', 'Battery augmentation and capacity expansion services', 'Grid-forming and grid-following inverter integration'],
    ARRAY['Lithium/cobalt/nickel mining (extractive operations)', 'Project development and ownership without operational services', 'Utilities owning storage assets without service offerings', 'Battery recycling and second-life (→ Battery Lifecycle)', 'EV battery manufacturing (→ Battery Lifecycle)'],
    'Solar installers adding storage → Include if storage becomes significant offering; Storage manufacturers with services → Include entire company, classify by primary revenue; Companies spanning integration and software → Classify here if physical installation/O&M dominates',
    ARRAY['BESS', 'energy storage installation', 'storage EPC', 'storage commissioning', 'STaaS', 'battery O&M', 'hybrid systems'],
    true, 2),

  (sector_storage_id, 'Storage Software & Analytics',
    'Companies providing software platforms, analytics tools, and optimization systems that maximize the operational and financial performance of battery energy storage assets through intelligent dispatch, trading, and performance management.',
    'Increases storage deployment economics by optimizing revenue streams, extending asset life through intelligent operation, and enabling participation in multiple value streams simultaneously, improving the business case for storage investments.',
    ARRAY['Battery management system software (cloud-based platforms)', 'Storage dispatch optimization and trading platforms', 'Revenue stacking and value optimization software', 'Battery analytics and diagnostic platforms', 'Performance monitoring and warranty management tools', 'Storage aggregation and VPP platforms (software only)', 'Market participation and bidding platforms', 'Predictive maintenance software for storage systems', 'Energy arbitrage and price forecasting tools', 'Multi-site storage portfolio management software'],
    ARRAY['Embedded firmware for BMS hardware (unless cloud platform offered)', 'Physical energy trading operations', 'Project finance and investment platforms', 'General energy management software (→ Energy Management & Optimization)', 'Hardware manufacturing and installation (→ Storage Integration & O&M)'],
    'BMS companies → Include software platforms, exclude hardware-embedded firmware only; VPP platforms with storage → Include if storage is primary asset class, software-only offering; Companies with both software and integration → Classify here only if software revenue dominates',
    ARRAY['BMS software', 'storage optimization', 'energy arbitrage', 'revenue stacking', 'storage trading', 'VPP', 'battery diagnostics', 'SOH'],
    true, 2);

  -- Continued with Resource Sustainability themes...
END $$;