
-- Update Water Efficiency theme with enhanced keywords and description

UPDATE taxonomy_themes
SET 
  keywords = ARRAY[
    'water audits',
    'fixture efficiency',
    'smart meters',
    'AMI',
    'AMR',
    'precision irrigation',
    'leak detection',
    'NRW',
    'non-revenue water',
    'pressure management',
    'greywater',
    'rainwater harvesting',
    'WaterSense',
    'water reuse',
    'IoT monitoring',
    'DMA',
    'district metered area',
    'irrigation scheduling',
    'soil moisture sensors',
    'water footprint',
    'closed-loop cooling',
    'industrial water recycling',
    'membrane treatment',
    'water-as-a-service',
    'smart water meters',
    'water analytics',
    'water conservation',
    'drip irrigation',
    'building water efficiency',
    'water management platform',
    'acoustic leak detection'
  ],
  description = 'Companies providing auditing, consulting, efficiency technologies, and implementation services that reduce water consumption in buildings, agriculture, industry, and landscapes through behavioral change, fixture upgrades, and system optimization. Market characterized by four business model archetypes: (1) Utility Network Efficiency—leak detection, pressure management, and smart DMA analytics reducing non-revenue water by 10-20%, (2) Precision Irrigation—soil-moisture sensing and drip/SDI retrofits achieving 10-40% irrigation water savings, (3) Industrial Water Efficiency—closed-loop cooling, membrane treatment, and water-as-a-service models delivering 30-50% withdrawal reductions at water-intensive sites, and (4) Building Water Efficiency—smart metering, fixture retrofits, and greywater reuse cutting potable demand by 10-20%+. Investment opportunity anchored by €5.6bn TAM, 7% CAGR, and extreme fragmentation (Top 3: 15% share) creating buy-and-build potential across ~100 platform targets. Value proposition balanced between 60% ROI-driven demand (£100+ household savings, industrial cost reduction) and 40% compliance-driven (EU Water Reuse Regulation, Drinking Water Directive leakage mandates by 2026), providing resilience to policy shifts. Target platform economics: €20-50M revenue potential, 15-30% EBITDA margins through recurring SaaS/service contracts, exiting at 3-6x revenue to strategic buyers (utilities, building systems conglomerates, infrastructure funds). Primary risks: moderate competitive moats requiring scale to defend, transitioning market maturity with adoption uncertainties, and medium data confidence on retention/switching costs.',
  updated_at = NOW()
WHERE id = 'aa637432-d6c1-47c8-94b8-2bad7e55f5d0';
