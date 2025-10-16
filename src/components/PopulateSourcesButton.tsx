import { Button } from "@/components/ui/button";
import { Database } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export function PopulateSourcesButton() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handlePopulate = async () => {
    setIsLoading(true);
    try {
      toast({
        title: "Populating sources",
        description: "Scanning signals database for unique sources...",
      });

      const { data, error } = await supabase.functions.invoke(
        "populate-sources-from-signals"
      );

      if (error) throw error;

      toast({
        title: "Success",
        description: data.message || "Sources populated successfully",
      });
    } catch (error) {
      console.error("Error populating sources:", error);
      toast({
        title: "Error",
        description: "Failed to populate sources",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handlePopulate} 
      disabled={isLoading}
      variant="outline"
      size="sm"
    >
      <Database className="mr-2 h-4 w-4" />
      {isLoading ? "Populating..." : "Populate from Signals"}
    </Button>
  );
}
