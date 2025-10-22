export interface FrameworkCategory {
  id: string;
  name: string;
  code: string; // A, B, C, D, E
  description: string;
  weight: number;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface FrameworkCriteria {
  id: string;
  category_id: string;
  name: string;
  code: string; // A1, A2, B1, etc.
  description: string;
  objective: string;
  weight: number;
  display_order: number;
  scoring_rubric: Json; // Database stores as JSON
  ai_prompt: string;
  created_at: string;
  updated_at: string;
}

export interface ScoringRubric {
  1: { label: string; description: string };
  3: { label: string; description: string };
  5: { label: string; description: string };
}

// Database JSON types
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface DetailedScore {
  id: string;
  theme_id: string;
  criteria_id: string;
  score: number | null; // Database stores as number
  confidence: string | null; // Database stores as string
  notes?: string;
  ai_research_data?: Json;
  analyst_notes?: string;
  updated_by?: string;
  updated_at: string;
  update_source: string; // Database stores as string
}

export interface ResearchDocument {
  id: string;
  theme_id: string;
  criteria_id: string;
  title: string;
  description?: string;
  document_type: string; // 'ai_research', 'market_report', 'analysis', etc.
  file_path?: string;
  file_size?: number;
  mime_type?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface FrameworkCategoryWithCriteria extends FrameworkCategory {
  criteria: FrameworkCriteria[];
}

export interface DetailedScoreWithCriteria extends DetailedScore {
  criteria: FrameworkCriteria;
}

export interface ThemeWithDetailedScores {
  id: string;
  name: string;
  pillar: string;
  sector: string;
  description?: string;
  in_scope?: string[];
  out_of_scope?: string[];
  keywords?: string[];
  created_at: string;
  updated_at: string;
  // Market data
  tam_value?: number | null;
  tam_currency?: string | null;
  cagr_percentage?: number | null;
  cagr_period_start?: number | null;
  cagr_period_end?: number | null;
  market_maturity?: string | null;
  categories: FrameworkCategoryWithCriteria[];
  detailed_scores: DetailedScoreWithCriteria[];
  research_documents: ResearchDocument[];
  overall_score: number;
  overall_confidence: 'High' | 'Medium' | 'Low';
}

export type UserRole = 'admin' | 'analyst';

export interface UserRoleInfo {
  id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
}