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
          {
            foreignKeyName: "detailed_scores_theme_id_fkey"
            columns: ["theme_id"]
            isOneToOne: false
            referencedRelation: "themes"
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
        Relationships: [
          {
            foreignKeyName: "n8n_research_runs_theme_id_fkey"
            columns: ["theme_id"]
            isOneToOne: false
            referencedRelation: "themes"
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
            referencedRelation: "themes"
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
      themes: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          in_scope: string[] | null
          name: string
          out_of_scope: string[] | null
          pillar: string
          sector: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          in_scope?: string[] | null
          name: string
          out_of_scope?: string[] | null
          pillar: string
          sector: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          in_scope?: string[] | null
          name?: string
          out_of_scope?: string[] | null
          pillar?: string
          sector?: string
          updated_at?: string | null
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
      [_ in never]: never
    }
    Functions: {
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
