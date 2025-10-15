-- Update score rationales for Green Workforce & Skills theme

-- A1: TAM
UPDATE detailed_scores 
SET notes = 'TAM of €0.6bn falls below the €1bn threshold, qualifying as a niche market under our rubric.',
    updated_at = now()
WHERE id = '69ee611c-bca6-4564-868d-7da7fb9716b7';

-- A2: SOM
UPDATE detailed_scores 
SET notes = 'SOM of €0.06bn (€60M) is below the €0.1bn minimum threshold for sufficient platform revenue potential.',
    updated_at = now()
WHERE id = '65585fde-0a3f-4af8-9413-4c0d179af449';

-- A3: CAGR
UPDATE detailed_scores 
SET notes = 'CAGR of 8% falls within the 5-10% range, representing solid growth under our framework.',
    updated_at = now()
WHERE id = '78f7e1c3-909d-400e-82d9-5f0300524768';

-- A4: Market Maturity
UPDATE detailed_scores 
SET notes = 'Early market maturity indicates VC-dominated environment, not yet ready for PE investment strategies.',
    updated_at = now()
WHERE id = '063137e4-9e32-45e8-9815-ba3fbb7042b9';

-- B1: Market Fragmentation
UPDATE detailed_scores 
SET notes = 'High fragmentation with top 3 players holding only 17.5% share creates ideal structure for platform building and bolt-on acquisitions.',
    updated_at = now()
WHERE id = 'cb9f644c-5a50-468a-ad18-1e212b166104';

-- B2: Competitive Moat
UPDATE detailed_scores 
SET notes = 'Moderate moat strength suggests differentiation is possible with medium switching costs or proprietary advantages.',
    updated_at = now()
WHERE id = '5c91226e-780a-404e-9c28-bfee2f0caf0a';

-- B3: Exit Quality
UPDATE detailed_scores 
SET notes = 'Viable exit quality indicates 2-5 relevant M&A transactions in recent years, providing adequate liquidity options.',
    updated_at = now()
WHERE id = '7caae6ff-bec8-4595-947e-de8b85c17aa6';

-- C1: Regulatory Landscape
UPDATE detailed_scores 
SET notes = 'With only 40% compliance-driven demand, the market is primarily ROI-driven and resilient to policy changes.',
    updated_at = now()
WHERE id = '7a772689-84a0-4ff0-b9fc-cf7c0fe3c832';

-- C2: Market Timing (Timing Risk)
UPDATE detailed_scores 
SET notes = 'Early maturity with 8% CAGR and moderate regulatory support represents viable but not optimal timing for PE entry.',
    updated_at = now()
WHERE id = '8b717a8c-5a34-4ddb-9730-439c1de44544';