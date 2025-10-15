export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      classification_batches: {
        Row: {
          batch_name: string
          company_count: number | null
          created_at: string
          id: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          batch_name: string
          company_count?: number | null
          created_at?: string
          id?: string
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          batch_name?: string
          company_count?: number | null
          created_at?: string
          id?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      classifications: {
        Row: {
          batch_id: string | null
          business_model: string | null
          classification_type: string | null
          company_id: string
          confidence_score: number | null
          context_metadata: Json | null
          created_at: string
          dealcloud_id: string | null
          id: string
          model_used: string | null
          n8n_execution_id: string | null
          perplexity_research: string | null
          pillar: string | null
          pitchbook_data: string | null
          preqin_data: string | null
          primary_theme: string | null
          rationale: string | null
          sector: string | null
          source_system: string
          sourcescrub_description: string | null
          status: string
          taxonomy_version: number | null
          theme_id: string | null
          updated_at: string | null
          website_summary: string | null
        }
        Insert: {
          batch_id?: string | null
          business_model?: string | null
          classification_type?: string | null
          company_id: string
          confidence_score?: number | null
          context_metadata?: Json | null
          created_at?: string
          dealcloud_id?: string | null
          id?: string
          model_used?: string | null
          n8n_execution_id?: string | null
          perplexity_research?: string | null
          pillar?: string | null
          pitchbook_data?: string | null
          preqin_data?: string | null
          primary_theme?: string | null
          rationale?: string | null
          sector?: string | null
          source_system: string
          sourcescrub_description?: string | null
          status?: string
          taxonomy_version?: number | null
          theme_id?: string | null
          updated_at?: string | null
          website_summary?: string | null
        }
        Update: {
          batch_id?: string | null
          business_model?: string | null
          classification_type?: string | null
          company_id?: string
          confidence_score?: number | null
          context_metadata?: Json | null
          created_at?: string
          dealcloud_id?: string | null
          id?: string
          model_used?: string | null
          n8n_execution_id?: string | null
          perplexity_research?: string | null
          pillar?: string | null
          pitchbook_data?: string | null
          preqin_data?: string | null
          primary_theme?: string | null
          rationale?: string | null
          sector?: string | null
          source_system?: string
          sourcescrub_description?: string | null
          status?: string
          taxonomy_version?: number | null
          theme_id?: string | null
          updated_at?: string | null
          website_summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "classifications_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "classification_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classifications_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classifications_theme_id_fkey"
            columns: ["theme_id"]
            isOneToOne: false
            referencedRelation: "taxonomy_themes"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          company_name: string | null
          created_at: string
          dealcloud_id: string | null
          description: string | null
          id: string
          updated_at: string | null
          website_domain: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          dealcloud_id?: string | null
          description?: string | null
          id?: string
          updated_at?: string | null
          website_domain: string
        }
        Update: {
          company_name?: string | null
          created_at?: string
          dealcloud_id?: string | null
          description?: string | null
          id?: string
          updated_at?: string | null
          website_domain?: string
        }
        Relationships: []
      }
      company_theme_mappings: {
        Row: {
          batch_id: string | null
          classification_method: string | null
          classified_at: string
          classified_by: string | null
          company_id: string
          confidence_score: number | null
          created_at: string | null
          id: string
          is_example: boolean
          is_positive_example: boolean
          is_primary: boolean
          notes: string | null
          theme_id: string
          updated_at: string | null
        }
        Insert: {
          batch_id?: string | null
          classification_method?: string | null
          classified_at?: string
          classified_by?: string | null
          company_id: string
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          is_example?: boolean
          is_positive_example?: boolean
          is_primary?: boolean
          notes?: string | null
          theme_id: string
          updated_at?: string | null
        }
        Update: {
          batch_id?: string | null
          classification_method?: string | null
          classified_at?: string
          classified_by?: string | null
          company_id?: string
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          is_example?: boolean
          is_positive_example?: boolean
          is_primary?: boolean
          notes?: string | null
          theme_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_theme_mappings_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "classification_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_theme_mappings_classified_by_fkey"
            columns: ["classified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_theme_mappings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_theme_mappings_theme_id_fkey"
            columns: ["theme_id"]
            isOneToOne: false
            referencedRelation: "taxonomy_themes"
            referencedColumns: ["id"]
          },
        ]
      }
      detailed_scores: {
        Row: {
          ai_research_data: Json | null
          analyst_notes: string | null
          confidence: string | null
          criteria_id: string | null
          id: string
          notes: string | null
          score: number | null
          theme_id: string | null
          update_source: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          ai_research_data?: Json | null
          analyst_notes?: string | null
          confidence?: string | null
          criteria_id?: string | null
          id?: string
          notes?: string | null
          score?: number | null
          theme_id?: string | null
          update_source?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          ai_research_data?: Json | null
          analyst_notes?: string | null
          confidence?: string | null
          criteria_id?: string | null
          id?: string
          notes?: string | null
          score?: number | null
          theme_id?: string | null
          update_source?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "detailed_scores_criteria_id_fkey"
            columns: ["criteria_id"]
            isOneToOne: false
            referencedRelation: "framework_criteria"
            referencedColumns: ["id"]
          },
        ]
      }
      framework_categories: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          display_order: number
          id: string
          name: string
          updated_at: string | null
          weight: number
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          display_order: number
          id?: string
          name: string
          updated_at?: string | null
          weight: number
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          display_order?: number
          id?: string
          name?: string
          updated_at?: string | null
          weight?: number
        }
        Relationships: []
      }
      framework_criteria: {
        Row: {
          ai_prompt: string | null
          category_id: string | null
          code: string
          created_at: string | null
          description: string | null
          display_order: number
          id: string
          name: string
          objective: string | null
          scoring_rubric: Json | null
          updated_at: string | null
          weight: number
        }
        Insert: {
          ai_prompt?: string | null
          category_id?: string | null
          code: string
          created_at?: string | null
          description?: string | null
          display_order: number
          id?: string
          name: string
          objective?: string | null
          scoring_rubric?: Json | null
          updated_at?: string | null
          weight: number
        }
        Update: {
          ai_prompt?: string | null
          category_id?: string | null
          code?: string
          created_at?: string | null
          description?: string | null
          display_order?: number
          id?: string
          name?: string
          objective?: string | null
          scoring_rubric?: Json | null
          updated_at?: string | null
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "framework_criteria_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "framework_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      intelligence_memos: {
        Row: {
          created_at: string | null
          created_by: string | null
          deals_section: string | null
          id: string
          market_news_section: string | null
          metadata: Json | null
          published_at: string | null
          regulatory_section: string | null
          signal_count: number | null
          status: string | null
          summary: string | null
          week_end_date: string
          week_start_date: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          deals_section?: string | null
          id?: string
          market_news_section?: string | null
          metadata?: Json | null
          published_at?: string | null
          regulatory_section?: string | null
          signal_count?: number | null
          status?: string | null
          summary?: string | null
          week_end_date: string
          week_start_date: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          deals_section?: string | null
          id?: string
          market_news_section?: string | null
          metadata?: Json | null
          published_at?: string | null
          regulatory_section?: string | null
          signal_count?: number | null
          status?: string | null
          summary?: string | null
          week_end_date?: string
          week_start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "intelligence_memos_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      n8n_research_runs: {
        Row: {
          completed_at: string | null
          criteria_ids: string[] | null
          error_message: string | null
          id: string
          n8n_execution_id: string | null
          results_summary: Json | null
          started_at: string | null
          started_by: string | null
          status: string | null
          theme_id: string | null
          webhook_url: string | null
        }
        Insert: {
          completed_at?: string | null
          criteria_ids?: string[] | null
          error_message?: string | null
          id?: string
          n8n_execution_id?: string | null
          results_summary?: Json | null
          started_at?: string | null
          started_by?: string | null
          status?: string | null
          theme_id?: string | null
          webhook_url?: string | null
        }
        Update: {
          completed_at?: string | null
          criteria_ids?: string[] | null
          error_message?: string | null
          id?: string
          n8n_execution_id?: string | null
          results_summary?: Json | null
          started_at?: string | null
          started_by?: string | null
          status?: string | null
          theme_id?: string | null
          webhook_url?: string | null
        }
        Relationships: []
      }
      processed_signals: {
        Row: {
          analysis_priority: number | null
          content_length: number | null
          content_snippet: string | null
          countries: string[] | null
          credibility_score: number | null
          days_old_when_processed: number | null
          extracted_deal_size: string | null
          has_pitchbook_data: boolean | null
          id: string
          is_featured: boolean | null
          memo_analysis: string | null
          memo_published_at: string | null
          memo_section: string | null
          processed_by: string | null
          processed_timestamp: string | null
          raw_signal_id: string
          signal_type_classified: string | null
          week_processed: string | null
        }
        Insert: {
          analysis_priority?: number | null
          content_length?: number | null
          content_snippet?: string | null
          countries?: string[] | null
          credibility_score?: number | null
          days_old_when_processed?: number | null
          extracted_deal_size?: string | null
          has_pitchbook_data?: boolean | null
          id?: string
          is_featured?: boolean | null
          memo_analysis?: string | null
          memo_published_at?: string | null
          memo_section?: string | null
          processed_by?: string | null
          processed_timestamp?: string | null
          raw_signal_id: string
          signal_type_classified?: string | null
          week_processed?: string | null
        }
        Update: {
          analysis_priority?: number | null
          content_length?: number | null
          content_snippet?: string | null
          countries?: string[] | null
          credibility_score?: number | null
          days_old_when_processed?: number | null
          extracted_deal_size?: string | null
          has_pitchbook_data?: boolean | null
          id?: string
          is_featured?: boolean | null
          memo_analysis?: string | null
          memo_published_at?: string | null
          memo_section?: string | null
          processed_by?: string | null
          processed_timestamp?: string | null
          raw_signal_id?: string
          signal_type_classified?: string | null
          week_processed?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "processed_signals_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "processed_signals_raw_signal_id_fkey"
            columns: ["raw_signal_id"]
            isOneToOne: true
            referencedRelation: "raw_signals"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      raw_signals: {
        Row: {
          author: string | null
          created_at: string | null
          description: string | null
          document_url: string | null
          file_path: string | null
          fingerprint: string | null
          id: string
          original_id: string | null
          publication_date: string | null
          raw_content: string | null
          scraped_date: string | null
          signal_id: string
          source: string
          source_id: string | null
          source_type: string | null
          title: string
          url: string | null
        }
        Insert: {
          author?: string | null
          created_at?: string | null
          description?: string | null
          document_url?: string | null
          file_path?: string | null
          fingerprint?: string | null
          id?: string
          original_id?: string | null
          publication_date?: string | null
          raw_content?: string | null
          scraped_date?: string | null
          signal_id: string
          source: string
          source_id?: string | null
          source_type?: string | null
          title: string
          url?: string | null
        }
        Update: {
          author?: string | null
          created_at?: string | null
          description?: string | null
          document_url?: string | null
          file_path?: string | null
          fingerprint?: string | null
          id?: string
          original_id?: string | null
          publication_date?: string | null
          raw_content?: string | null
          scraped_date?: string | null
          signal_id?: string
          source?: string
          source_id?: string | null
          source_type?: string | null
          title?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "raw_signals_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      regulations: {
        Row: {
          analysis_url: string | null
          compliance_deadline: string | null
          created_at: string
          description: string | null
          effective_date: string | null
          id: string
          impact_level: string
          jurisdiction: string
          key_provisions: string[] | null
          regulation_type: string
          regulatory_body: string | null
          source_url: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          analysis_url?: string | null
          compliance_deadline?: string | null
          created_at?: string
          description?: string | null
          effective_date?: string | null
          id?: string
          impact_level?: string
          jurisdiction: string
          key_provisions?: string[] | null
          regulation_type: string
          regulatory_body?: string | null
          source_url?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          analysis_url?: string | null
          compliance_deadline?: string | null
          created_at?: string
          description?: string | null
          effective_date?: string | null
          id?: string
          impact_level?: string
          jurisdiction?: string
          key_provisions?: string[] | null
          regulation_type?: string
          regulatory_body?: string | null
          source_url?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      research_documents: {
        Row: {
          created_at: string | null
          created_by: string | null
          criteria_id: string | null
          description: string | null
          document_type: string | null
          file_path: string | null
          file_size: number | null
          id: string
          mime_type: string | null
          n8n_agent_run_id: string | null
          theme_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          criteria_id?: string | null
          description?: string | null
          document_type?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          mime_type?: string | null
          n8n_agent_run_id?: string | null
          theme_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          criteria_id?: string | null
          description?: string | null
          document_type?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          mime_type?: string | null
          n8n_agent_run_id?: string | null
          theme_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "research_documents_criteria_id_fkey"
            columns: ["criteria_id"]
            isOneToOne: false
            referencedRelation: "framework_criteria"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "research_documents_theme_id_fkey"
            columns: ["theme_id"]
            isOneToOne: false
            referencedRelation: "taxonomy_themes"
            referencedColumns: ["id"]
          },
        ]
      }
      sources: {
        Row: {
          api_endpoint: string | null
          base_url: string | null
          check_frequency: string | null
          created_at: string | null
          created_by: string | null
          error_message: string | null
          feed_url: string | null
          field_mappings: Json | null
          id: string
          last_checked_at: string | null
          last_success_at: string | null
          scraping_config: Json | null
          source_name: string
          source_type: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          api_endpoint?: string | null
          base_url?: string | null
          check_frequency?: string | null
          created_at?: string | null
          created_by?: string | null
          error_message?: string | null
          feed_url?: string | null
          field_mappings?: Json | null
          id?: string
          last_checked_at?: string | null
          last_success_at?: string | null
          scraping_config?: Json | null
          source_name: string
          source_type: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          api_endpoint?: string | null
          base_url?: string | null
          check_frequency?: string | null
          created_at?: string | null
          created_by?: string | null
          error_message?: string | null
          feed_url?: string | null
          field_mappings?: Json | null
          id?: string
          last_checked_at?: string | null
          last_success_at?: string | null
          scraping_config?: Json | null
          source_name?: string
          source_type?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sources_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      taxonomy_business_models: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      taxonomy_pillars: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order: number
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      taxonomy_sectors: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number
          id: string
          name: string
          pillar_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order: number
          id?: string
          name: string
          pillar_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number
          id?: string
          name?: string
          pillar_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "taxonomy_sectors_pillar_id_fkey"
            columns: ["pillar_id"]
            isOneToOne: false
            referencedRelation: "taxonomy_pillars"
            referencedColumns: ["id"]
          },
        ]
      }
      taxonomy_theme_business_models: {
        Row: {
          business_model_id: string
          created_at: string | null
          id: string
          theme_id: string
        }
        Insert: {
          business_model_id: string
          created_at?: string | null
          id?: string
          theme_id: string
        }
        Update: {
          business_model_id?: string
          created_at?: string | null
          id?: string
          theme_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "taxonomy_theme_business_models_business_model_id_fkey"
            columns: ["business_model_id"]
            isOneToOne: false
            referencedRelation: "taxonomy_business_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "taxonomy_theme_business_models_theme_id_fkey"
            columns: ["theme_id"]
            isOneToOne: false
            referencedRelation: "taxonomy_themes"
            referencedColumns: ["id"]
          },
        ]
      }
      taxonomy_themes: {
        Row: {
          cagr_percentage: number | null
          cagr_period_end: number | null
          cagr_period_start: number | null
          common_edge_cases: string | null
          created_at: string | null
          description: string | null
          id: string
          impact: string | null
          in_scope: string[] | null
          is_active: boolean
          key_identifiers: string[] | null
          keywords: string[] | null
          market_maturity: string | null
          name: string
          out_of_scope: string[] | null
          sector_id: string
          tam_currency: string | null
          tam_value: number | null
          updated_at: string | null
          version: number
        }
        Insert: {
          cagr_percentage?: number | null
          cagr_period_end?: number | null
          cagr_period_start?: number | null
          common_edge_cases?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          impact?: string | null
          in_scope?: string[] | null
          is_active?: boolean
          key_identifiers?: string[] | null
          keywords?: string[] | null
          market_maturity?: string | null
          name: string
          out_of_scope?: string[] | null
          sector_id: string
          tam_currency?: string | null
          tam_value?: number | null
          updated_at?: string | null
          version?: number
        }
        Update: {
          cagr_percentage?: number | null
          cagr_period_end?: number | null
          cagr_period_start?: number | null
          common_edge_cases?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          impact?: string | null
          in_scope?: string[] | null
          is_active?: boolean
          key_identifiers?: string[] | null
          keywords?: string[] | null
          market_maturity?: string | null
          name?: string
          out_of_scope?: string[] | null
          sector_id?: string
          tam_currency?: string | null
          tam_value?: number | null
          updated_at?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "taxonomy_themes_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "taxonomy_sectors"
            referencedColumns: ["id"]
          },
        ]
      }
      theme_regulations: {
        Row: {
          created_at: string
          criteria_impacts: string[] | null
          id: string
          impact_description: string | null
          regulation_id: string
          relevance_score: number | null
          theme_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          criteria_impacts?: string[] | null
          id?: string
          impact_description?: string | null
          regulation_id: string
          relevance_score?: number | null
          theme_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          criteria_impacts?: string[] | null
          id?: string
          impact_description?: string | null
          regulation_id?: string
          relevance_score?: number | null
          theme_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      detailed_scores_with_context: {
        Row: {
          ai_research_data: Json | null
          analyst_notes: string | null
          category_code: string | null
          category_name: string | null
          confidence: string | null
          criteria_code: string | null
          criteria_id: string | null
          criteria_name: string | null
          id: string | null
          notes: string | null
          score: number | null
          sector_id: string | null
          theme_id: string | null
          theme_name: string | null
          update_source: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Relationships: [
          {
            foreignKeyName: "detailed_scores_criteria_id_fkey"
            columns: ["criteria_id"]
            isOneToOne: false
            referencedRelation: "framework_criteria"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "taxonomy_themes_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "taxonomy_sectors"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      get_taxonomy_json: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "analyst"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "analyst"],
    },
  },
} as const
