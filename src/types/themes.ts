export interface Theme {
  id: string;
  name: string;
  pillar: string;
  sector: string;
  description?: string;
  in_scope?: string[];
  out_of_scope?: string[];
  created_at: string;
  updated_at: string;
}

export interface Attribute {
  id: string;
  name: string;
  weight: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Score {
  id: string;
  theme_id: string;
  attribute_id: string;
  score: number;
  confidence: 'High' | 'Medium' | 'Low';
  notes?: string;
  updated_by: string;
  updated_at: string;
  update_source: 'manual' | 'llm_research' | 'market_signal';
}

export interface ScoreHistory {
  id: string;
  score_id: string;
  previous_score: number;
  new_score: number;
  previous_confidence?: 'High' | 'Medium' | 'Low';
  new_confidence: 'High' | 'Medium' | 'Low';
  previous_notes?: string;
  new_notes?: string;
  updated_by: string;
  updated_at: string;
  update_reason?: string;
  update_source: 'manual' | 'llm_research' | 'market_signal';
}

export interface ThemeWithScores extends Theme {
  scores: (Score & { attribute: Attribute })[];
  weighted_total_score: number;
  overall_confidence: 'High' | 'Medium' | 'Low';
}

export const SCORE_THRESHOLDS = {
  HIGH: 70,
  MEDIUM: 40,
} as const;

export const DEFAULT_ATTRIBUTES: Omit<Attribute, 'id' | 'created_at' | 'updated_at'>[] = [
  { name: 'Market Attractiveness', weight: 25, description: 'Market Size, Growth CAGR' },
  { name: 'Fund Fit', weight: 25, description: 'Business Model Alignment, IAP fit' },
  { name: 'Investability', weight: 25, description: 'Fragmentation, Competition, Exit Environment' },
  { name: 'Risk Profile', weight: 15, description: 'Technology/Regulatory/Market Risk' },
  { name: 'Right to Win', weight: 5, description: 'Team Expertise, Network Access' },
  { name: 'Impact', weight: 5, description: 'Impact Collinearity, Scale' },
];

export const PILLAR_COLORS = {
  'Decarbonisation': 'bg-green-100 text-green-800 border-green-200',
  'Energy Transition': 'bg-blue-100 text-blue-800 border-blue-200',
  'Resource Sustainability': 'bg-emerald-100 text-emerald-800 border-emerald-200',
} as const;