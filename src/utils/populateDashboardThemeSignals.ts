import { supabase } from "@/integrations/supabase/client";

export async function populateDashboardThemeSignals() {
  try {
    const { data, error } = await supabase.functions.invoke('populate-dashboard-theme-signals', {
      body: {}
    });

    if (error) {
      console.error('Error populating dashboard theme signals:', error);
      throw error;
    }

    console.log('Dashboard theme signal population results:', data);
    return data;
  } catch (error) {
    console.error('Failed to populate dashboard theme signals:', error);
    throw error;
  }
}
