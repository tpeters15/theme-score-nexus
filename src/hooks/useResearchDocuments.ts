import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ResearchDocument {
  id: string;
  theme_id?: string;
  criteria_id?: string;
  title: string;
  description?: string;
  document_type?: string;
  file_path?: string;
  file_size?: number;
  mime_type?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  // Related data
  theme?: {
    id: string;
    name: string;
    pillar: string;
    sector: string;
  };
  criteria?: {
    id: string;
    name: string;
    code: string;
  };
}

export function useResearchDocuments() {
  return useQuery({
    queryKey: ["research-documents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("research_documents")
        .select(`
          *,
          theme:taxonomy_themes(
            id, 
            name,
            sector:taxonomy_sectors!inner(
              name,
              pillar:taxonomy_pillars!inner(name)
            )
          ),
          criteria:framework_criteria(id, name, code)
        `)
        .not("file_path", "is", null) // Only get documents with actual files
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      // Transform theme data structure
      const transformedData = data?.map(doc => {
        if (!doc.theme) {
          return { ...doc, theme: undefined };
        }
        
        return {
          ...doc,
          theme: {
            id: doc.theme.id,
            name: doc.theme.name,
            pillar: doc.theme.sector?.pillar?.name || '',
            sector: doc.theme.sector?.name || '',
          }
        };
      });

      return transformedData as ResearchDocument[];
    },
  });
}