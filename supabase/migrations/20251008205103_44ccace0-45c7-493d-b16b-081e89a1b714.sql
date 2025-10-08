-- Insert remaining themes (Buildings, Industry, Agriculture - Part 3)
DO $$
DECLARE
  sector_buildings_id uuid;
  sector_industry_id uuid;
  sector_agriculture_id uuid;
BEGIN
  SELECT id INTO sector_buildings_id FROM taxonomy_sectors WHERE name = 'Buildings';
  SELECT id INTO sector_industry_id FROM taxonomy_sectors WHERE name = 'Industry';
  SELECT id INTO sector_agriculture_id FROM taxonomy_sectors WHERE name = 'Agriculture';

  INSERT INTO taxonomy_themes (sector_id, name, description, impact, in_scope, out_of_scope, common_edge_cases, key_identifiers, is_active, version) VALUES
  
  -- BUILDINGS THEMES
  (sector_buildings_id, 'Building Control & Optimization',
    'Companies providing intelligent building management systems, energy optimization software, and automated control solutions that actively reduce energy consumption and emissions in commercial and residential buildings.',
    'Reduces building emissions through real-time optimization of HVAC, lighting, and other systems based on occupancy, weather, and grid conditions, typically achieving 20-40% energy savings without capital upgrades.',
    ARRAY['Building management and automation systems (including DR capability)', 'HVAC control and optimization platforms', 'Energy monitoring and analytics software with control capabilities', 'Smart thermostat platforms and intelligent climate control', 'Occupancy-based control and space optimization systems', 'Continuous commissioning and fault detection services', 'Building performance optimization services', 'Integrated workplace management systems with energy focus', 'Smart building platforms with automated load shedding'],
    ARRAY['Passive monitoring without active control capabilities', 'Manual energy audits without ongoing optimization', 'HVAC equipment manufacturing (→ Building Retrofits)', 'Building materials or insulation (→ Building Retrofits)', 'Pure compliance reporting without optimization', 'Multi-site energy analytics and performance optimization (→ Industrial & Commercial Energy Efficiency)', 'Demand response aggregation for commercial buildings (→ Industrial & Commercial Energy Efficiency)'],
    'IoT platforms with building focus → Include if energy optimization is primary value; Property management software → Include only if active energy management included; Demand response → Include only if DR is integrated feature of building automation, not standalone service',
    ARRAY['BMS', 'BAS', 'HVAC optimization', 'occupancy sensors', 'demand response', 'FDD', 'predictive maintenance', 'commissioning'],
    true, 2),

  (sector_buildings_id, 'Building Retrofits',
    'Companies manufacturing efficient equipment and providing physical building envelope improvements, insulation upgrades, and efficiency installations that reduce energy demand through passive and active measures in existing building stock across commercial and residential properties.',
    'Reduces building energy consumption by improving thermal performance, air tightness, and equipment efficiency, addressing the massive emissions from existing buildings that cannot be solved through controls alone.',
    ARRAY['Heat pump and efficient HVAC equipment manufacturing', 'Insulation installation and weatherization services', 'Window and door replacement services', 'Air sealing and building envelope contractors', 'Whole-building retrofit coordination and project management', 'Retrofit assessment and energy audit services', 'Digital platforms connecting homeowners with retrofit contractors', 'Financing platforms for retrofit projects', 'Heat pump installation when part of broader retrofit', 'Ventilation system upgrades and heat recovery'],
    ARRAY['Building materials manufacturing (insulation, windows) without installation services', 'New construction services', 'General construction without efficiency focus', 'Standalone HVAC replacement without envelope work', 'Smart controls without physical improvements (→ Building Control & Optimization)'],
    'HVAC installers offering insulation → Include if comprehensive retrofit approach; General contractors adding efficiency → Include if specialized retrofit division; Materials distributors → Only include if providing installation services',
    ARRAY['Building retrofit', 'deep retrofit', 'insulation', 'weatherization', 'air sealing', 'heat recovery ventilation', 'MVHR', 'EnerPHit'],
    true, 2),

  (sector_buildings_id, 'Residential Decarbonisation',
    'Companies providing integrated platforms, technologies, and services that enable comprehensive home energy transitions including electrification, renewable energy, and smart home energy management for residential customers.',
    'Accelerates residential decarbonisation by simplifying the complex journey from fossil fuel dependence to all-electric homes powered by renewable energy, addressing market barriers of complexity, upfront cost, and contractor coordination.',
    ARRAY['Residential solar and battery installation services', 'Heat pump sales and installation for homes', 'Integrated home energy platforms combining multiple technologies', 'Home energy assessment and planning services', 'Smart home energy management systems', 'Home electrification consulting and project management', 'Residential energy-as-a-service offerings', 'Community solar platforms serving residential customers', 'Residential VPP platforms marketed to homeowners', 'Smart home energy apps with DR participation', 'Home battery optimization with grid services'],
    ARRAY['Equipment manufacturing - solar panels (→ Renewable Energy EPC), heat pumps (→ Building Retrofits), batteries (→ Storage Integration)', 'Commercial building services', 'Utility companies without specific residential programs', 'General HVAC contractors without decarbonisation focus', 'Home automation without energy focus', 'Residential demand response aggregation (→ Smart Grid & Demand Response) - these serve utilities, not homeowners'],
    'Solar installers adding batteries → Include as integrated offering expands; HVAC companies installing heat pumps → Include if part of electrification strategy; Residential VPP/DR → Include if homeowner-facing platform; exclude if purely wholesale aggregation',
    ARRAY['Home electrification', 'residential solar', 'home battery', 'home energy management', 'residential VPP', 'community solar'],
    true, 2),

  (sector_buildings_id, 'Sustainable Construction Materials',
    'Companies producing, distributing, or enabling the use of low-carbon and circular construction materials including bio-based materials, recycled content, and carbon-negative products that reduce the embodied carbon of buildings.',
    'Reduces construction emissions by replacing carbon-intensive materials (concrete, steel) with low-carbon alternatives, utilizing waste streams, and sequestering carbon in building materials, addressing the 11% of global emissions from building materials.',
    ARRAY['Low-carbon concrete and cement production', 'Mass timber and engineered wood manufacturing', 'Bio-based building material production', 'Recycled and reclaimed material processing and distribution', 'Material marketplace platforms for sustainable materials', 'Embodied carbon calculation and optimization tools', 'Construction waste recycling and recovery services', 'Modular and prefabricated low-carbon building systems', 'Carbon-storing material technologies'],
    ARRAY['Traditional building material production without sustainability focus', 'General construction companies using materials', 'Forestry operations and logging without processing', 'Mining and raw material extraction (limestone quarrying, ore extraction)', 'Architectural design services'],
    'Concrete companies with low-carbon products → Include if separate product line; Timber companies entering mass timber → Include if CLT/engineered wood focus; Waste companies processing C&D waste → Include if producing building materials',
    ARRAY['Low-carbon concrete', 'mass timber', 'CLT', 'bio-based materials', 'recycled materials', 'embodied carbon', 'EPD', 'material passports'],
    true, 2),

  -- INDUSTRY THEMES
  (sector_industry_id, 'Industrial & Commercial Energy Efficiency',
    'Companies providing technologies, software, and services that reduce energy consumption across industrial and commercial operations through process optimization, equipment efficiency, demand management, and behavioral change.',
    'Reduces emissions by decreasing energy demand in manufacturing facilities and commercial buildings through operational optimization, equipment efficiency improvements, and intelligent load management, addressing industrial and commercial sectors that account for ~40% of global electricity consumption.',
    ARRAY['Equipment efficiency improvements (motors, compressed air, HVAC)', 'Waste heat recovery systems and cogeneration', 'Industrial process optimization and control systems', 'Industrial and commercial energy auditing services', 'Energy monitoring and submetering platforms', 'Demand response and load flexibility platforms for C&I customers', 'Virtual power plant (VPP) aggregation of C&I assets', 'Multi-site energy analytics and benchmarking', 'Energy performance contracting and measurement & verification'],
    ARRAY['Building automation systems for HVAC/lighting control (→ Building Control & Optimization)', 'Residential energy management (→ Residential Decarbonisation)', 'Renewable energy procurement platforms (→ Renewable Energy Procurement & Trading)', 'Industrial electrification and fuel switching (→ Industrial Electrification & Heat)', 'Emissions monitoring without energy optimization (→ Industrial Emissions Management)', 'Grid operator DERMS platforms (→ Smart Grid & Demand Response)'],
    'VPP/DR platforms → Include if C&I customers are primary users; exclude if utility-facing; Platforms serving both industrial and commercial → Include (both in scope); Energy management platforms → Include if focused on consumption optimization',
    ARRAY['Industrial energy management', 'process optimization', 'demand response', 'C&I VPP', 'load flexibility', 'motor efficiency', 'waste heat recovery'],
    true, 2),

  (sector_industry_id, 'Industrial Electrification & Heat',
    'Companies manufacturing electrification equipment and enabling the transition from fossil fuel-based industrial heating to electric alternatives including heat pumps, electric boilers, and other electrification technologies for industrial processes.',
    'Eliminates direct industrial emissions by replacing natural gas, coal, and oil-fired heating with electric systems powered by increasingly clean grids, addressing hard-to-abate industrial heat that represents ~10% of global emissions.',
    ARRAY['Industrial heat pump system design and installation', 'Electric boiler and furnace installation services', 'Process electrification consulting and engineering', 'High-temperature heat pump development and deployment', 'Thermal energy storage systems for industrial use', 'Electric heating system integration and controls', 'Feasibility studies for industrial electrification', 'Hybrid heating systems combining electric and other sources', 'Industrial flexibility services for electrified processes'],
    ARRAY['Heat pump manufacturing without installation services', 'Residential or commercial heat pumps (→ Building themes)', 'General electrical contracting without specialization', 'Energy efficiency without fuel switching (→ Industrial Energy Efficiency)', 'Hydrogen for heating (→ Alternative Fuels)'],
    'HVAC companies entering industrial → Include if specialized industrial division; Heat pump manufacturers with projects → Include if turnkey solutions offered; Hydrogen vs electric heating → Classify based on primary technology approach',
    ARRAY['Industrial heat pumps', 'electric boilers', 'process electrification', 'thermal storage', 'power-to-heat', 'sector coupling'],
    true, 2),

  (sector_industry_id, 'Industrial Emissions Management',
    'Companies providing comprehensive solutions for monitoring, reporting, verifying, and physically mitigating industrial emissions including greenhouse gases, air pollutants, and fugitive emissions across industrial facilities.',
    'Reduces industrial emissions through continuous monitoring enabling targeted reduction strategies, regulatory compliance, and physical abatement of emissions at the source, addressing both climate and air quality impacts.',
    ARRAY['Continuous emissions monitoring systems and software', 'Fugitive emissions detection and quantification services', 'Industrial carbon accounting and reporting platforms', 'Emissions control equipment installation and maintenance', 'Methane detection and mitigation services', 'Flare gas recovery and management systems', 'VOC control and recovery services', 'Regulatory compliance software and consulting', 'Integrated monitoring + abatement solutions', 'Emissions monitoring equipment manufacturing (CEMS hardware, sensors, analyzers)', 'Emissions control equipment manufacturing (scrubbers, filters, catalytic converters)'],
    ARRAY['Sensor/equipment manufacturing only (without services/systems)', 'General environmental consulting without emissions focus', 'Energy efficiency without emissions focus (→ Industrial Energy Efficiency)', 'Process changes for emissions reduction (→ other relevant themes)', 'Carbon capture and storage (→ would be separate theme if included)', 'Ambient air quality monitoring (→ Air Quality Monitoring & Control)'],
    'Environmental consulting firms → Include if industrial emissions is primary focus; Oil & gas service companies → Include emissions-specific services only; IoT sensor companies → Include only with full solution not just hardware',
    ARRAY['CEMS', 'fugitive emissions', 'LDAR', 'carbon accounting', 'methane mitigation', 'flare management', 'MRV', 'emissions compliance'],
    true, 2),

  -- AGRICULTURE THEMES
  (sector_agriculture_id, 'Precision Agriculture',
    'Companies manufacturing precision farming equipment and providing data-driven technologies, analytics platforms, and smart farming solutions that optimize agricultural inputs, improve yields, and reduce environmental impact through precise application of resources.',
    'Reduces agricultural emissions and environmental impact by optimizing fertilizer use (reducing N2O emissions), minimizing water consumption, reducing pesticide application, and improving overall farm efficiency through data-driven decision making.',
    ARRAY['Precision agriculture equipment manufacturing (sensors, drones, variable rate application systems)', 'Farm management software and data platforms', 'Variable rate technology and application systems', 'Agricultural drone services and imagery analytics', 'Satellite-based crop monitoring platforms', 'IoT sensor networks for agriculture', 'Yield optimization and prediction tools', 'Irrigation management and optimization systems', 'Agricultural robotics and automation', 'Digital agronomy and advisory platforms'],
    ARRAY['General agricultural machinery without precision/digital capabilities', 'Seed and chemical production', 'Traditional farm equipment dealers', 'Food processing and distribution', 'Livestock management without precision focus', 'Alternative protein production'],
    'Equipment manufacturers with software → Include entire company, classify by primary revenue; Drone companies serving agriculture → Include if agriculture is primary market; Input suppliers with precision services → Include service division separately',
    ARRAY['Precision farming', 'smart farming', 'AgTech', 'variable rate application', 'agricultural IoT', 'satellite imagery', 'NDVI'],
    true, 2),

  (sector_agriculture_id, 'Regenerative Farming',
    'Companies manufacturing biological inputs and providing services, platforms that enable regenerative agricultural practices including soil health improvement, carbon sequestration, biodiversity enhancement, and ecosystem restoration on farmland.',
    'Transforms agriculture from emissions source to carbon sink through practices that rebuild soil organic matter, increase biodiversity, improve water retention, and sequester atmospheric carbon in soils while maintaining or improving yields.',
    ARRAY['Biological input and soil amendment manufacturing (biofertilizers, inoculants, soil conditioners)', 'Regenerative agriculture consulting and advisory services', 'Biological and organic input suppliers', 'Carbon credit development and verification for farms', 'Soil health testing and monitoring services', 'Cover crop and rotation planning platforms', 'Regenerative grazing management services', 'Agroforestry design and implementation', 'Farmer education and transition support programs', 'Ecosystem services marketplaces for agriculture'],
    ARRAY['Conventional farming services without regenerative focus', 'General agricultural machinery', 'Land acquisition and management', 'Traditional crop insurance', 'Food brands sourcing regeneratively (unless providing services)'],
    'Organic input suppliers → Include if supporting regenerative transition; Carbon credit developers → Include if agriculture-focused; Food companies with farmer programs → Include only if services offered broadly',
    ARRAY['Regenerative agriculture', 'soil health', 'soil carbon', 'carbon farming', 'biofertilizers', 'cover crops', 'no-till', 'agroforestry'],
    true, 2);
END $$;