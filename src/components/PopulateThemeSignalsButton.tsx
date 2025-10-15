import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { populateThemeSignals } from "@/utils/populateThemeSignals";

export function PopulateThemeSignalsButton() {
  const [isPopulating, setIsPopulating] = useState(false);
  const { toast } = useToast();

  const handlePopulate = async () => {
    setIsPopulating(true);
    try {
      const result = await populateThemeSignals();
      
      toast({
        title: "Theme Signals Populated",
        description: `Successfully mapped signals to ${result.results?.length || 0} themes`,
      });
      
      // Refresh the page to see the new signals
      window.location.reload();
    } catch (error) {
      console.error('Population error:', error);
      toast({
        title: "Population Failed",
        description: error instanceof Error ? error.message : "Failed to populate signals",
        variant: "destructive",
      });
    } finally {
      setIsPopulating(false);
    }
  };

  return (
    <Button
      onClick={handlePopulate}
      disabled={isPopulating}
      className="gap-2"
    >
      {isPopulating ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Analyzing Signals...
        </>
      ) : (
        <>
          <TrendingUp className="h-4 w-4" />
          Populate Theme Signals
        </>
      )}
    </Button>
  );
}
