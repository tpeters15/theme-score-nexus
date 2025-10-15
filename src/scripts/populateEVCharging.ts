import { supabase } from "@/integrations/supabase/client";

export async function populateEVChargingTheme() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // 1. Update theme basic data
  const { data: theme, error: themeError } = await supabase
    .from('taxonomy_themes')
    .update({
      tam_value: 80,
      tam_currency: 'GBP',
      cagr_percentage: 21,
      cagr_period_start: 2024,
      cagr_period_end: 2030,
      market_maturity: 'TRANSITIONING'
    })
    .eq('id', '59276a29-119b-4412-86ae-4725472eb380')
    .select()
    .single();

  if (themeError) throw themeError;
  console.log('Updated theme:', theme);

  // 2. Get criteria mapping
  const { data: criteria } = await supabase
    .from('framework_criteria')
    .select('id, code');

  const criteriaMap = criteria?.reduce((acc, c) => ({ ...acc, [c.code]: c.id }), {} as Record<string, string>) || {};

  // 3. Populate scores
  const scores = {
    'A1': { score: 5, notes: "€80bn significantly exceeds the €5bn threshold for expansive market classification" },
    'A2': { score: 5, notes: "€2.2bn PE-addressable SOM substantially exceeds the €0.3bn threshold for high potential classification" },
    'A3': { score: 5, notes: "21% CAGR significantly exceeds the 10% threshold for rapid growth classification" },
    'A4': { score: 3, notes: "Transitioning maturity directly maps to the growth phase rubric (mix of VC and early PE activity)" },
    'B1': { score: 5, notes: "High fragmentation with top 3 holding only 10.5% share creates ideal structure for platform building and bolt-on acquisitions" },
    'B2': { score: 3, notes: "Moderate moat strength indicates medium competitive intensity with viable differentiation opportunities through switching costs or proprietary technology" },
    'B3': { score: 3, notes: "Viable exit quality directly corresponds to medium exit environment with 2-5 relevant M&A transactions in recent years" },
    'C1': { score: 5, notes: "Only 35% compliance-driven demand falls well below the 40% threshold, indicating primarily ROI-driven market resilient to policy changes" },
    'C2': { score: 5, notes: "Excellent timing with transitioning maturity, >15% CAGR, and strong regulatory support creates optimal PE investment window" },
    'C3': { score: 3, notes: "Mixed demand drivers with majority ROI-driven but significant discretionary component creates moderate cyclicality exposure" },
    'C4': { score: 3, notes: "Mix of medium to medium-high confidence across critical research tools with no major data gaps represents manageable research concerns" }
  };

  for (const [code, data] of Object.entries(scores)) {
    const criteriaId = criteriaMap[code];
    if (!criteriaId) continue;

    await supabase.from('detailed_scores').upsert({
      theme_id: '59276a29-119b-4412-86ae-4725472eb380',
      criteria_id: criteriaId,
      score: data.score,
      confidence: 'MEDIUM',
      notes: data.notes,
      updated_by: user.id,
      update_source: 'manual'
    }, { onConflict: 'theme_id,criteria_id' });
  }
  console.log('Updated scores');

  // 4. Create regulations
  const regulations = [
    {
      title: "Regulation (EU) 2023/1804 on Deployment of Alternative Fuels Infrastructure (AFIR)",
      description: "Member States must meet strict EV charging-rollout targets on the TEN-T network and urban areas with incremental targets each year from 2024 through 2030. Charging stations must also be \"smart\" and connected via national data platforms.",
      jurisdiction: "EU",
      regulation_type: "infrastructure",
      status: "in_force",
      source_url: "https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX%3A02023R1804-20250414",
      compliance_deadline: "2030-12-31",
      regulatory_body: "Regulation (EU) 2023/1804",
      impact: "Strong incentive to invest in charging networks; member states will be pushing that build-out aggressively. Projects aligned with AFIR targets can rely on legal \"must-build\" demand.",
      relevance: 5
    },
    {
      title: "The Building etc. (Amendment) (England) (No. 2) Regulations 2022 (SI 2022/984)",
      description: "All new residential dwellings must have one chargepoint per home; new non-residential buildings with >10 parking spaces must install EV chargepoints on 20% of spaces and EV-ready wiring on all spaces.",
      jurisdiction: "UK",
      regulation_type: "infrastructure",
      status: "in_force",
      source_url: "",
      compliance_deadline: "2022-06-30",
      regulatory_body: "SI 2022/984",
      impact: "Mandatory demand for chargers in construction, driving adoption of chargepoint supply in building sector and raising underlying market size.",
      relevance: 5
    },
    {
      title: "The Electric Vehicles (Smart Charge Points) Regulations 2021",
      description: "All new home and workplace chargers must be \"smart\"—capable of receiving tariffs and responding. From 1 July 2022 all new private chargepoints must meet technical \"smart\" standards; large public and workplace chargepoints have staggered deadlines.",
      jurisdiction: "UK",
      regulation_type: "infrastructure",
      status: "in_force",
      source_url: "",
      compliance_deadline: "2025-04-30",
      regulatory_body: "The Electric Vehicles (Smart Charge Points) Regulations 2021",
      impact: "Adds compliance cost to chargers (favoring higher-end CPOs) and integrates EV charging load management into energy markets, but does not by itself drive large additional volume of chargers.",
      relevance: 3
    },
    {
      title: "Ladesäulenverordnung (LSV)",
      description: "Price transparency (publish €/kWh and €/minute), standardized billing information, mandatory smart-metering or equivalent on new chargers, and grid-access priority settings for chargers.",
      jurisdiction: "DE",
      regulation_type: "infrastructure",
      status: "in_force",
      source_url: "",
      compliance_deadline: "2023-12-31",
      regulatory_body: "Ladesäulenverordnung (LSV)",
      impact: "Creates some compliance work for operators but also levels the playing field. It indirectly supports investment by clarifying rules and requiring open-access networks.",
      relevance: 3
    },
    {
      title: "Ladeinfrastrukturgesetz (LadInfraG 2023)",
      description: "Tenants have a right to request a charger, planning/regulatory barriers are reduced, and reference values for connection capacity are set.",
      jurisdiction: "DE",
      regulation_type: "infrastructure",
      status: "in_force",
      source_url: "",
      compliance_deadline: "2023-07-31",
      regulatory_body: "Ladeinfrastrukturgesetz (LadInfraG 2023)",
      impact: "Lowers soft-costs of installation and may open new retrofit markets. Helps unlock private-sector investment by making permitting faster.",
      relevance: 3
    }
  ];

  for (const reg of regulations) {
    const { data: regulation } = await supabase
      .from('regulations')
      .upsert({
        title: reg.title,
        description: reg.description,
        jurisdiction: reg.jurisdiction,
        regulation_type: reg.regulation_type,
        status: reg.status,
        source_url: reg.source_url,
        compliance_deadline: reg.compliance_deadline,
        regulatory_body: reg.regulatory_body
      }, { onConflict: 'title,jurisdiction' })
      .select()
      .single();

    if (regulation) {
      await supabase.from('theme_regulations').upsert({
        theme_id: '59276a29-119b-4412-86ae-4725472eb380',
        regulation_id: regulation.id,
        impact_description: reg.impact,
        relevance_score: reg.relevance
      }, { onConflict: 'theme_id,regulation_id' });
    }
  }
  console.log('Created regulations');

  return { success: true };
}

// Auto-run on import in dev
if (import.meta.env.DEV) {
  populateEVChargingTheme().then(() => console.log('✅ Done')).catch(console.error);
}
