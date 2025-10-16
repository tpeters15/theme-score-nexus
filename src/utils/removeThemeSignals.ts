import { supabase } from "@/integrations/supabase/client";

export async function removeThemeSignals(themeSignalIds: string[]) {
  const { data, error } = await supabase.functions.invoke('remove-theme-signal', {
    body: { themeSignalIds }
  });

  if (error) throw error;
  return data;
}

// Remove the two incorrect signals from Water Efficiency theme
export async function removeIncorrectWaterSignals() {
  const idsToRemove = [
    '3e2cea18-c96e-4132-8248-a0b6f6356a53', // Carbon Leakage in Aviation
    '6c70403e-5a95-4ff1-9f90-fbd64102324d'  // Green Homes Grant
  ];
  
  return removeThemeSignals(idsToRemove);
}