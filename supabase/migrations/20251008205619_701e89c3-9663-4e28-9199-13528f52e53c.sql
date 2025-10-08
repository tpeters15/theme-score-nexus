-- Insert final 11 Resource Sustainability themes
DO $$
DECLARE
  sector_water_id uuid;
  sector_circular_id uuid;
  sector_land_id uuid;
  sector_pollution_id uuid;
BEGIN
  SELECT id INTO sector_water_id FROM taxonomy_sectors WHERE name = 'Water Management';
  SELECT id INTO sector_circular_id FROM taxonomy_sectors WHERE name = 'Circular Economy';
  SELECT id INTO sector_land_id FROM taxonomy_sectors WHERE name = 'Land & Conservation';
  SELECT id INTO sector_pollution_id FROM taxonomy_sectors WHERE name = 'Pollution Reduction';

  INSERT INTO taxonomy_themes (sector_id, name, description, impact, in_scope, out_of_scope, common_edge_cases, key_identifiers, is_active, version) VALUES
  
  -- WATER MANAGEMENT (3 themes)
  (sector_water_id, 'Water Treatment & Reuse',
    'Companies manufacturing treatment equipment and providing technologies, systems, and services that treat wastewater, enable water reuse and recycling, and deliver clean water solutions across industrial, municipal, and commercial applications.',
    'Reduces freshwater extraction and wastewater discharge by enabling circular water use through advanced treatment technologies, addressing water scarcity and pollution in water-stressed regions and water-intensive industries.',
    ARRAY['Water treatment equipment and systems manufacturing', 'Industrial wastewater treatment system design and supply', 'Water recycling and reuse system installation', 'Membrane treatment technology deployment', 'Modular and containerized treatment solutions', 'Biological treatment system operations', 'Zero liquid discharge system providers', 'Point-of-use and point-of-entry treatment systems', 'Water treatment chemicals and consumables (if bundled with service)', 'Treatment system O&M and performance optimization', 'Desalination plant operations (non-municipal scale)'],
    ARRAY['Large municipal water utilities', 'Mega-scale desalination plants (>100MGD without services)', 'Treatment chemical manufacturing only (without systems/services)', 'Pump and valve manufacturing without treatment systems', 'Bottled water and beverage companies'],
    'Equipment manufacturers with services → Include entire company, classify by primary revenue; Engineering firms with water practice → Include if water treatment specialized; Utilities with industrial divisions → Include industrial service arms',
    ARRAY['Water treatment', 'wastewater treatment', 'water reuse', 'membrane filtration', 'RO', 'MBR', 'ZLD', 'desalination'],
    true, 2),

  (sector_water_id, 'Smart Water Infrastructure & Analytics',
    'Companies manufacturing smart water hardware and providing digital platforms, IoT sensors, analytics software, and intelligent systems that monitor, detect leaks, optimize operations, and improve water network efficiency through data-driven management.',
    'Reduces water loss and consumption through real-time monitoring, leak detection, pressure optimization, and predictive analytics, addressing the 30-50% water loss in aging distribution systems and enabling more efficient water use.',
    ARRAY['Smart water hardware manufacturing (meters, sensors, monitoring equipment)', 'Smart water meter platforms and analytics', 'Leak detection and localization systems', 'Water network digital twin and modeling platforms', 'Pressure management and optimization systems', 'Water quality monitoring sensor networks', 'Consumption analytics and customer engagement platforms', 'Predictive maintenance for water infrastructure', 'Network optimization software', 'Water data management and analytics platforms', 'Non-revenue water reduction solutions'],
    ARRAY['Traditional SCADA without analytics/intelligence', 'Pipe and infrastructure manufacturing', 'Physical infrastructure construction', 'General IoT platforms without water specialization'],
    'Meter manufacturers with software → Include entire company, classify by primary revenue; General IoT companies → Include only if water is primary vertical; Utilities with platforms → Include if offered to other utilities',
    ARRAY['Smart water', 'leak detection', 'smart meters', 'AMI', 'pressure management', 'digital twin', 'water quality monitoring', 'NRW'],
    true, 2),

  (sector_water_id, 'Water Efficiency',
    'Companies providing auditing, consulting, efficiency technologies, and implementation services that reduce water consumption in buildings, agriculture, industry, and landscapes through behavioral change, fixture upgrades, and system optimization.',
    'Reduces water consumption at point of use through efficiency improvements, eliminating wasteful practices and deploying water-saving technologies, addressing demand-side water scarcity without requiring new supply infrastructure.',
    ARRAY['Water audit and efficiency consulting services', 'Smart irrigation system installation and management', 'Water-efficient fixture retrofit programs', 'Leak detection and repair services', 'Rainwater harvesting system design and installation', 'Greywater system implementation', 'Landscape water management services', 'Industrial water efficiency consulting', 'Water efficiency program management for utilities', 'Water conservation training and certification'],
    ARRAY['Fixture and irrigation equipment manufacturing only (without services)', 'General plumbing services without efficiency focus', 'Landscape design without water focus', 'Swimming pool maintenance', 'Agricultural equipment manufacturing (→ Precision Agriculture if tech-enabled)'],
    'Irrigation companies → Include if water efficiency/smart irrigation focused; Plumbing companies → Include only if specialized in efficiency retrofits; Agricultural water → Classify in Precision Agriculture if farm-focused',
    ARRAY['Water efficiency', 'water conservation', 'smart irrigation', 'water audits', 'rainwater harvesting', 'greywater', 'water stewardship'],
    true, 2),

  -- CIRCULAR ECONOMY (5 themes)
  (sector_circular_id, 'Recycling & Material Recovery',
    'Companies manufacturing equipment, operating facilities, and providing consulting services for collection, sorting, processing, and recovery of materials from waste streams, including electronics, plastics, metals, textiles, and construction materials into secondary raw materials for manufacturing.',
    'Reduces resource extraction, manufacturing emissions, and landfill waste by recovering valuable materials from discarded products and reintroducing them into production cycles, displacing virgin material production.',
    ARRAY['Recycling equipment manufacturing (sorting systems, processing equipment, robotics)', 'E-waste collection and processing operations', 'Plastic recycling facilities and services', 'Metal recovery and scrap processing operations', 'Textile recycling and fiber recovery services', 'Construction waste recycling facilities', 'Material recovery facility (MRF) operations', 'Automated sorting technology deployment', 'Precious metal and critical mineral recovery', 'Battery recycling (if not EV-focused - see Battery Lifecycle)', 'Composite material separation and recycling', 'Chemical and advanced recycling operations (if commercial facilities exist)', 'Waste management consulting, auditing, and program implementation services for enterprises'],
    ARRAY['Landfill operations without material recovery', 'Waste incineration and waste-to-energy', 'Raw material trading without processing', 'Virgin material production', 'Pure R&D without commercial operations'],
    'Waste management companies → Include only material recovery operations; Sorting technology providers → Include if providing services not just equipment sales; Battery recycling → Classify in Battery Lifecycle if EV batteries',
    ARRAY['Recycling', 'material recovery', 'e-waste', 'WEEE', 'plastics recycling', 'metal recovery', 'textile recycling', 'automated sorting'],
    true, 2),

  (sector_circular_id, 'Circular Logistics & Reverse Supply Chain',
    'Companies providing infrastructure, platforms, and services that enable product returns, refurbishment, remanufacturing, and reverse logistics, creating closed-loop systems for product lifecycle extension and material recovery.',
    'Extends product lifespans and enables material recovery by creating efficient systems to collect used products, assess condition, refurbish or harvest components, and reintroduce them to markets, displacing new production.',
    ARRAY['Take-back and reverse logistics program management', 'Refurbishment and remanufacturing services', 'IT asset disposition and refurbishment services', 'Returns optimization software and platforms', 'Trade-in and buyback platform operators', 'Repair network coordination and management', 'Asset recovery and redistribution services', 'Circular supply chain software and tracking platforms', 'Product authenticity and condition assessment services', 'Recommerce marketplace platforms'],
    ARRAY['Traditional forward logistics without circularity focus', 'New product manufacturing', 'Warranty services only without reuse focus', 'Pure retail returns (without refurbishment/reuse)', 'Financial leasing without product recovery'],
    'Logistics companies with reverse flows → Include if circular focus is primary; Manufacturers with refurbishment → Include if offered as separate service; Marketplaces → Include if secondary/refurbished is primary inventory',
    ARRAY['Reverse logistics', 'refurbishment', 'remanufacturing', 'ITAD', 'returns optimization', 'trade-in', 'recommerce', 'circular supply chain'],
    true, 2),

  (sector_circular_id, 'Sharing & Reuse Models',
    'Companies providing digital platforms, services, and infrastructure that enable sharing economy models, rental systems, product-as-a-service, and asset utilization optimization, maximizing the use of existing products and reducing demand for new production.',
    'Reduces resource consumption and manufacturing emissions by maximizing utilization of existing products through sharing, rental, and subscription models, displacing demand for new production and extending effective product lifespans through access-based consumption.',
    ARRAY['B2B equipment and tool sharing platforms', 'Product-as-a-Service platform enablement software', 'Peer-to-peer rental and sharing marketplaces', 'Circular design software and consulting', 'Asset utilization optimization platforms', 'Subscription and rental management software', 'Material exchange and surplus marketplaces', 'Sharing infrastructure services (storage, logistics, cleaning)', 'PaaS transition consulting and implementation services', 'Circular business model advisory'],
    ARRAY['Product manufacturing - even if sold via PaaS (classify by product type in relevant theme)', 'Software-as-a-Service without physical product component', 'Traditional financial leasing without product stewardship', 'Pure consumer rental (cars, apartments) without sustainability/circularity focus', 'Reusable product manufacturing (→ Sustainable Materials & Packaging)'],
    'Consumer rental platforms → Include only if circularity/sustainability is core value prop; SaaS companies → Exclude unless enabling physical product sharing/PaaS; Manufacturers offering PaaS → Classify in relevant product theme',
    ARRAY['Sharing economy', 'PaaS', 'equipment sharing', 'rental platforms', 'asset utilization', 'subscription models', 'circular design'],
    true, 2),

  (sector_circular_id, 'Sustainable Materials & Packaging',
    'Companies manufacturing and distributing sustainable material alternatives including bio-based materials, compostable products, reusable packaging systems, and low-impact materials that replace conventional petroleum-based and resource-intensive materials across applications.',
    'Reduces fossil fuel consumption, plastic pollution, and resource extraction by replacing conventional materials with renewable, biodegradable, reusable, or lower-impact alternatives derived from sustainable sources.',
    ARRAY['Sustainable packaging material manufacturing (compostable, bio-based, recycled content)', 'Reusable packaging system manufacturing and operations', 'Bio-based and compostable material production', 'Sustainable materials distribution and supply platforms', 'Packaging optimization software and consulting services', 'Material traceability and certification platforms', 'Alternative material commercialization and production', 'Sustainable materials marketplaces', 'Packaging design services for sustainability', 'Material innovation and substitution services'],
    ARRAY['Virgin plastic production without bio-based/recycled content', 'Traditional packaging companies without sustainability focus', 'Paper mills and conventional material production', 'Agricultural feedstock production without material processing', 'Material recycling operations (→ Recycling & Material Recovery)', 'Platforms enabling product sharing (→ Sharing & Reuse Models)'],
    'Packaging companies adding sustainable lines → Include if sustainability is significant business; Recycled content packaging → Include if packaging production is primary business; Reusable vs sharing platforms → Reusable containers = here',
    ARRAY['Sustainable packaging', 'compostable', 'bio-based materials', 'reusable packaging', 'bioplastics', 'material traceability', 'FSC'],
    true, 2),

  (sector_circular_id, 'Upcycling & Remanufacturing',
    'Companies transforming waste materials and used products into higher-value goods through creative reuse, remanufacturing, and upcycling processes that create value from materials otherwise destined for disposal.',
    'Diverts waste from landfills while creating economic value by transforming discarded materials and products into new goods of equal or higher quality, displacing virgin production and creating circular value chains.',
    ARRAY['Industrial remanufacturing services and facilities', 'Component harvesting and resale operations', 'Upcycled product manufacturing and brands', 'Waste-to-product transformation platforms', 'Industrial symbiosis facilitation and networks', 'Remanufacturing certification and standards', 'Material upcycling technology and processes', 'By-product valorization services', 'Remanufacturing equipment and tooling'],
    ARRAY['Basic mechanical recycling (→ Recycling & Material Recovery)', 'Downcycling operations (lower value outputs)', 'Artisan/craft businesses without scale', 'Energy recovery from waste (waste-to-energy)', 'Simple sorting without transformation'],
    'Recycling companies → Include here if output is higher value than input; Refurbishment services → Classify in Reverse Logistics if focus is returns/resale; Manufacturing with recycled content → Include if transforming waste into premium products',
    ARRAY['Upcycling', 'remanufacturing', 'industrial symbiosis', 'waste valorization', 'component harvesting', 'cascading use'],
    true, 2),

  -- LAND & CONSERVATION (3 themes)
  (sector_land_id, 'Natural Capital & Ecosystem Services',
    'Companies developing markets, platforms, and verification services that monetize ecosystem services including carbon sequestration, biodiversity credits, water quality, and other nature-based solutions, creating financial incentives for conservation and restoration.',
    'Accelerates conservation and restoration by creating revenue streams from ecosystem services, enabling landowners and communities to be compensated for environmental stewardship and making nature protection economically competitive with extractive land uses.',
    ARRAY['Carbon credit development and project management', 'Biodiversity credit platforms and marketplaces', 'Natural capital accounting software and services', 'Ecosystem services verification and certification', 'Carbon and biodiversity credit trading platforms', 'Impact measurement and MRV technology', 'Conservation finance structuring and advisory', 'Registry and standard-setting services', 'Remote sensing and monitoring for nature credits', 'Payment for ecosystem services program management'],
    ARRAY['Land acquisition and ownership without credit development', 'Traditional conservation NGOs without market mechanisms', 'Government conservation programs', 'Academic research without commercialization', 'Carbon capture technology (industrial, not nature-based)'],
    'Agricultural carbon credits → Include here if credits are primary business; Forest owners selling credits → Include if credit development is active business; Technology providers → Include if specifically for nature-based credit markets',
    ARRAY['Carbon credits', 'biodiversity credits', 'natural capital accounting', 'PES', 'nature-based solutions', 'MRV', 'carbon registries'],
    true, 2),

  (sector_land_id, 'Ecosystem Restoration',
    'Companies providing active restoration services including reforestation, wetland restoration, coastal rehabilitation, and habitat reconstruction that physically restore degraded ecosystems to functional ecological states.',
    'Reverses ecosystem degradation by actively rebuilding natural habitats, restoring ecological functions, sequestering carbon, improving water quality, and enhancing biodiversity in areas damaged by human activity or natural disasters.',
    ARRAY['Reforestation and afforestation services', 'Wetland and peatland restoration contractors', 'Coastal and marine habitat restoration services', 'Mine site and industrial rehabilitation services', 'Urban greening and ecological infrastructure services', 'Native plant nurseries for restoration (not ornamental)', 'Ecological engineering and design services', 'Restoration monitoring and adaptive management', 'Seed collection and native species propagation', 'Restoration project management and consulting'],
    ARRAY['Landscaping for aesthetics without ecological function', 'Traditional forestry and timber operations', 'Agricultural services (→ Agriculture themes)', 'Land development and construction', 'Ornamental horticulture and gardening'],
    'Forestry companies with restoration → Include if restoration is distinct service line; Landscape architects → Include only if ecological restoration is primary focus; Nurseries → Include if native species for restoration',
    ARRAY['Reforestation', 'wetland restoration', 'habitat restoration', 'rewilding', 'mine rehabilitation', 'urban greening', 'native species'],
    true, 2),

  (sector_land_id, 'Sustainable Land Management',
    'Companies providing technology platforms, monitoring systems, and advisory services for sustainable forestry, land use optimization, and landscape-level conservation planning that balance economic use with ecological preservation.',
    'Enables sustainable land use by providing data, analytics, and decision support for forest management, land use planning, and landscape conservation, preventing deforestation and degradation while maintaining productive use.',
    ARRAY['Forest inventory and monitoring platforms', 'Precision forestry software and analytics', 'Sustainable harvest planning and optimization', 'Fire risk assessment and management systems', 'Land use planning and decision support tools', 'Deforestation monitoring and alert systems', 'Forest certification and compliance services', 'Timber traceability and supply chain platforms', 'Forest carbon accounting and reporting', 'Landscape-level conservation planning tools'],
    ARRAY['Timber harvesting operations and logging', 'Pulp and paper production', 'Agricultural machinery and services (→ Agriculture themes)', 'Real estate development', 'Fire suppression equipment manufacturing'],
    'Forestry companies with software → Include software division if offered commercially; Carbon credit developers → Classify in Natural Capital if credits are primary; Fire detection technology → Include if wildfire/forest management focused',
    ARRAY['Sustainable forestry', 'forest monitoring', 'precision forestry', 'fire risk management', 'deforestation monitoring', 'REDD+'],
    true, 2),

  -- POLLUTION REDUCTION (2 themes)
  (sector_pollution_id, 'Air Quality Monitoring & Control',
    'Companies providing monitoring systems, analytics platforms, and mitigation services for ambient and indoor air quality that measure, forecast, and reduce air pollution exposure in communities and buildings (excluding industrial point-source emissions).',
    'Reduces health impacts from air pollution by enabling real-time monitoring, pollution forecasting, exposure reduction, and air purification in populated areas, addressing the public health crisis of ambient air pollution.',
    ARRAY['Air quality sensor and monitoring equipment manufacturing', 'Air quality monitoring networks and platforms', 'Indoor air quality monitoring and improvement services', 'Air pollution forecasting and analytics platforms', 'Community air quality monitoring programs', 'Air purification services and solutions', 'Mobile emissions testing and monitoring', 'Air quality data platforms and APIs', 'Pollution exposure assessment tools', 'Clean air zone management and planning'],
    ARRAY['Industrial facility emissions monitoring (→ Industrial Emissions Management)', 'HVAC systems without air quality focus (→ Building themes)', 'Weather monitoring and forecasting', 'Consumer air purifier sales without service', 'Automotive emissions testing for compliance only'],
    'Industrial emissions monitoring → Classify in Industrial Emissions Management; HVAC companies with IAQ → Include if air quality is primary value proposition; Environmental consulting → Include if air quality specialized',
    ARRAY['Air quality monitoring', 'ambient air quality', 'AQI', 'PM2.5', 'indoor air quality', 'air pollution forecasting', 'air purification'],
    true, 2),

  (sector_pollution_id, 'Soil Remediation',
    'Companies providing assessment, treatment, and cleanup services for contaminated soil and groundwater at brownfield sites, industrial facilities, and polluted land, restoring sites to safe and productive use.',
    'Enables redevelopment of contaminated land by removing or containing pollutants, reducing health risks, preventing pollution spread, and returning degraded sites to economic and ecological productivity.',
    ARRAY['Brownfield remediation and cleanup services', 'Bioremediation and natural attenuation services', 'Soil treatment and decontamination services', 'Groundwater remediation and monitoring', 'Environmental site assessment and investigation', 'Phytoremediation and ecological remediation', 'In-situ and ex-situ treatment technologies', 'Contamination monitoring and long-term management', 'Remediation engineering and design services', 'Site closure and regulatory compliance services'],
    ARRAY['Agricultural soil improvement and fertilization (→ Agriculture themes)', 'Landscaping and soil preparation for construction', 'Mining operations and mineral extraction', 'Waste disposal and landfill operations', 'Construction and site development'],
    'Environmental consulting firms → Include if remediation is core service; Construction companies with remediation → Include if specialized environmental division; Agricultural soil health → Classify in Regenerative Farming',
    ARRAY['Soil remediation', 'brownfield redevelopment', 'bioremediation', 'phytoremediation', 'groundwater remediation', 'environmental site assessment', 'PFAS'],
    true, 2);

END $$;