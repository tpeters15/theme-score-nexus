export interface TaxonomyPillar {
  id: string;
  name: string;
  description?: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface TaxonomySector {
  id: string;
  pillar_id: string;
  name: string;
  description?: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface TaxonomyBusinessModel {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface TaxonomyTheme {
  id: string;
  sector_id: string;
  name: string;
  description?: string;
  impact?: string;
  in_scope?: string[];
  out_of_scope?: string[];
  example_companies?: string[];
  common_edge_cases?: string;
  key_identifiers?: string[];
  version: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TaxonomyThemeBusinessModel {
  id: string;
  theme_id: string;
  business_model_id: string;
  created_at: string;
}
