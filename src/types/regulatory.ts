export interface Regulation {
  id: string;
  title: string;
  description: string;
  jurisdiction: string;
  regulation_type: string;
  status: string;
  impact_level: string;
  compliance_deadline?: string;
  effective_date?: string;
  source_url?: string;
  analysis_url?: string;
  regulatory_body: string;
  key_provisions: string[];
  relevance_score: number;
  impact_description: string;
  criteria_impacts: string[];
  affected_themes?: string[]; // Theme names for display
  theme_ids?: string[]; // Theme IDs for filtering
}

export interface ThemeRegulation {
  id: string;
  theme_id: string;
  regulation_id: string;
  relevance_score: number;
  impact_description: string;
  criteria_impacts: string[];
  created_at: string;
  updated_at: string;
}