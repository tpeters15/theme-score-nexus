import { supabase } from "@/integrations/supabase/client";

export async function populateThemeSignals() {
  try {
    const { data, error } = await supabase.functions.invoke('populate-theme-signals', {
      body: {}
    });

    if (error) {
      console.error('Error populating theme signals:', error);
      throw error;
    }

    console.log('Theme signal population results:', data);
    return data;
  } catch (error) {
    console.error('Failed to populate theme signals:', error);
    throw error;
  }
}
