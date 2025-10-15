export interface ProcessedSignalData {
  signal_id: string;
  title: string;
  countries: string;
  signal_type: 'regulatory' | 'market' | 'deal_funding' | 'news';
  deal_size: string;
  published_date: string;
  source: string;
  source_url?: string;
  days_old: number;
  content_snippet: string;
  is_featured?: boolean;
}

export const PROCESSED_SIGNALS_DATA: ProcessedSignalData[] = [
  {
    signal_id: "sig_1757239683880_0",
    title: "EU explores EU-wide purchasing programme for permanent carbon removals",
    countries: "EU",
    signal_type: "regulatory",
    deal_size: "",
    published_date: "2025-08-27T08:00:00Z",
    source: "DG CLIMA (European Commission)",
    source_url: "https://climate.ec.europa.eu/eu-action/carbon-removal_en",
    days_old: 11,
    content_snippet: "DG CLIMA has initiated studies evaluating the design of an EU-wide purchasing programme to promote permanent carbon dioxide removals (CDR). The studies highlight investment needs and propose mechanisms to stimulate demand for permanent CDR technologies.",
    is_featured: true
  },
  {
    signal_id: "sig_1757239683880_1",
    title: "European climate tech funding drops to 5-year low in Q1 2025",
    countries: "EU",
    signal_type: "market",
    deal_size: "",
    published_date: "2025-09-05T08:00:00Z",
    source: "The Next Web",
    days_old: 2,
    content_snippet: "Despite strong public support for climate action, European climate tech funding reached a 5-year low in Q1 2025. Industry leaders urge renewed investment to avoid loss of technological leadership.",
    is_featured: true
  },
  {
    signal_id: "sig_1757239683880_2",
    title: "EU faces 'colossal' clean tech investment gap",
    countries: "EU",
    signal_type: "market",
    deal_size: "",
    published_date: "2025-08-31T09:00:00Z",
    source: "BusinessGreen",
    days_old: 7,
    content_snippet: "ECNO highlights a 'colossal' investment gap in EU clean tech. The investment lag imperils the EU's competitive position versus the US and China, and threatens climate targets.",
    is_featured: true
  },
  {
    signal_id: "sig_1757239683880_3",
    title: "EU high-level climate action summit confirmed for 30 September 2025",
    countries: "EU; BE",
    signal_type: "news",
    deal_size: "",
    published_date: "2025-09-01T12:00:00Z",
    source: "DG CLIMA (European Commission)",
    days_old: 6,
    content_snippet: "The European Commission will host a high-level climate summit in Brussels. The event emphasizes economic and social benefits of climate action, with participation from EU officials and industry leaders.",
    is_featured: true
  },
  {
    signal_id: "sig_1757239683880_4",
    title: "Norway unveils €1.5B electric ferry expansion",
    countries: "NO",
    signal_type: "regulatory",
    deal_size: "€1.5 billion",
    published_date: "2025-09-05T10:20:00Z",
    source: "Mercury News",
    days_old: 2,
    content_snippet: "Norway announced a €1.5 billion state-backed initiative to accelerate deployment of electric ferries for domestic maritime transport by 2028. Regional ferry operators must replace 30% of diesel routes.",
    is_featured: true
  },
  {
    signal_id: "sig_1757239683880_5",
    title: "UK launches pilot to fast-track EV charger installations",
    countries: "UK",
    signal_type: "regulatory",
    deal_size: "",
    published_date: "2025-09-03T10:30:00Z",
    source: "Reuters",
    days_old: 4,
    content_snippet: "UK government launched pilot program to fast-track public EV charger installations in 8 cities, temporarily waiving certain grid connection approvals. Targets over 15,000 new rapid charging points."
  },
  {
    signal_id: "sig_1757239683880_6",
    title: "Solar panel prices hit 7-year low in Europe",
    countries: "EU; CN",
    signal_type: "market",
    deal_size: "",
    published_date: "2025-09-02T12:10:00Z",
    source: "PV Tech",
    days_old: 5,
    content_snippet: "Average spot prices for Tier 1 solar modules in Europe have dropped to lowest level since 2018, now below €0.15/W. Attributed to oversupply from Chinese manufacturers and weak European demand."
  },
  {
    signal_id: "sig_1757239683880_7",
    title: "EU updates Energy Storage Directive to mandate flexibility adoption",
    countries: "EU",
    signal_type: "regulatory",
    deal_size: "",
    published_date: "2025-09-03T18:00:00Z",
    source: "Bloomberg",
    days_old: 4,
    content_snippet: "European Parliament adopted reforms requiring member states to add grid-scale storage capacity equal to at least 15% of peak load by 2030. All new grid connections above 2 MW must include storage provisions."
  },
  {
    signal_id: "sig_1757239683880_9",
    title: "Germany launches €5B carbon contracts for difference scheme",
    countries: "DE",
    signal_type: "regulatory",
    deal_size: "€5 billion",
    published_date: "2025-09-06T07:45:00Z",
    source: "Bloomberg",
    days_old: 1,
    content_snippet: "German government rolled out €5 billion CCfD scheme to incentivize decarbonization of hard-to-abate industrial sectors. Companies in chemicals, steel, and cement can apply for 15-year carbon price guarantees."
  },
  {
    signal_id: "sig_1757239683880_10",
    title: "Benelux forms circular economy alliance",
    countries: "BE; NL; LU",
    signal_type: "regulatory",
    deal_size: "",
    published_date: "2025-09-04T08:40:00Z",
    source: "Circular Online",
    days_old: 3,
    content_snippet: "Belgium, Netherlands, and Luxembourg formed a Circular Economy Alliance to harmonize recycling standards and share digital infrastructure across the region."
  },
  {
    signal_id: "sig_1757239683880_11",
    title: "UK streamlines consenting for onshore wind projects",
    countries: "UK",
    signal_type: "regulatory",
    deal_size: "",
    published_date: "2025-09-05T13:25:00Z",
    source: "Windpower Monthly",
    days_old: 2,
    content_snippet: "UK government implemented new fast-track consenting process for onshore wind, clearing more than 12 major projects in the last week. Benefits include reduced documentation and digital permitting."
  },
  {
    signal_id: "sig_1757239683880_12",
    title: "EU awards €99m grant for water efficiency infrastructure",
    countries: "EU; ES; PT",
    signal_type: "regulatory",
    deal_size: "€99 million",
    published_date: "2025-09-03T11:50:00Z",
    source: "WaterTech Online",
    days_old: 4,
    content_snippet: "EU allocated €99 million in grant funding to consortium developing next-generation digital water efficiency and monitoring infrastructure, focusing on Spain, France, and Italy."
  },
  {
    signal_id: "sig_1757239683880_13",
    title: "German battery recycler Accurec raises €65m Series C",
    countries: "DE; EU",
    signal_type: "deal_funding",
    deal_size: "€65 million",
    published_date: "2025-09-02T09:30:00Z",
    source: "Reuters",
    days_old: 5,
    content_snippet: "Accurec closed €65 million Series C round led by EU climate investment vehicles. Funds will scale proprietary lithium-ion battery recycling capacity and digital traceability software."
  },
  {
    signal_id: "sig_1757239683880_15",
    title: "French retrofit software company raises €28m Series B",
    countries: "FR",
    signal_type: "deal_funding",
    deal_size: "€28 million",
    published_date: "2025-09-04T10:00:00Z",
    source: "DealStreet Asia",
    days_old: 3,
    content_snippet: "Lyon-based company specializing in AI-powered building energy management closed €28 million Series B from European growth funds. Platform used in over 10,000 buildings."
  },
  {
    signal_id: "sig_1757239683880_16",
    title: "Sweden launches green bioenergy certificate scheme",
    countries: "SE",
    signal_type: "regulatory",
    deal_size: "",
    published_date: "2025-09-04T13:00:00Z",
    source: "Bioenergy International",
    days_old: 3,
    content_snippet: "Swedish government launched new green certificate scheme to accelerate clean bioenergy production. Market-based scheme commences Q4 2025 to incentivize flexible, distributed bioenergy generation."
  },
  {
    signal_id: "sig_1757239469787_4",
    title: "UK: Energy users 'could save £5bn a year' if gas plants removed from market",
    countries: "UK",
    signal_type: "market",
    deal_size: "£5bn",
    published_date: "2025-09-05T00:00:00.000Z",
    source: "Carbon Brief Daily",
    days_old: 2,
    content_snippet: "UK government could save energy users £5bn annually by overhauling electricity market to stop gas-fired power stations from setting wholesale price, according to Greenpeace-commissioned report."
  },
  {
    signal_id: "sig_1757239469787_5",
    title: "Siemens Energy wins multi-billion contract for Baltic Sea power hub",
    countries: "DE; DK",
    signal_type: "news",
    deal_size: "€7bn",
    published_date: "2025-09-05T00:00:00.000Z",
    source: "Carbon Brief Daily",
    days_old: 2,
    content_snippet: "€7bn Danish-German electricity hub on Bornholm island gaining momentum. Siemens Energy won order worth more than €1bn to supply four converters to transmit offshore wind power from Baltic Sea."
  },
  {
    signal_id: "sig_1757239240849_2",
    title: "UK faces mounting stockpile of used EV batteries",
    countries: "UK",
    signal_type: "market",
    deal_size: "",
    published_date: "2025-09-07T04:00:09.000Z",
    source: "Financial Times",
    days_old: 0,
    content_snippet: "Industry experts warn that tens of thousands of used batteries are piling up because recycling capacity is scarce."
  },
  {
    signal_id: "sig_1757239240849_3",
    title: "UK should stop investing in carbon capture for power, adviser says",
    countries: "UK",
    signal_type: "regulatory",
    deal_size: "",
    published_date: "2025-09-06T15:27:02.000Z",
    source: "Financial Times",
    days_old: 1,
    content_snippet: "Octopus chief says 'enormous amounts' of public money spent on carbon capture technology should be saved."
  },
  {
    signal_id: "sig_1757153228538_0",
    title: "EU ETS expansion set to cover road transport and buildings from 2027",
    countries: "EU",
    signal_type: "regulatory",
    deal_size: "€90 billion",
    published_date: "2025-09-05T09:00:00Z",
    source: "EU Climate Action",
    days_old: 2,
    content_snippet: "EU Emissions Trading System will expand in 2027 to cover emissions from road transport and buildings. EU's green tech exports reached €90 billion in 2024."
  },
  {
    signal_id: "sig_1757153228538_4",
    title: "EU proposes new 2040 climate targets under amendment plan",
    countries: "EU",
    signal_type: "regulatory",
    deal_size: "",
    published_date: "2025-09-03T12:00:00Z",
    source: "Linklaters ESG Newsletter",
    days_old: 4,
    content_snippet: "European Commission proposed new binding climate targets for 2040, mandating steeper emission cuts than current 2030 goals. Industry sectors must prepare for accelerated decarbonisation."
  },
  {
    signal_id: "sig_1757153228538_5",
    title: "China and EU issue joint statement on climate collaboration",
    countries: "EU; CN",
    signal_type: "news",
    deal_size: "",
    published_date: "2025-09-03T12:00:00Z",
    source: "Linklaters ESG Newsletter",
    days_old: 4,
    content_snippet: "At Beijing EU-China summit, both sides pledged to accelerate renewables, facilitate tech transfers, improve carbon markets, and deepen methane emissions management."
  }
];
