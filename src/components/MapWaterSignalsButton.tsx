import { Button } from "@/components/ui/button";
import { Droplet } from "lucide-react";
import { toast } from "sonner";
import { mapWaterSignalsToTheme } from "@/utils/mapWaterSignals";
import { useState } from "react";

export function MapWaterSignalsButton() {
  const [isMapping, setIsMapping] = useState(false);

  const handleMapSignals = async () => {
    setIsMapping(true);
    try {
      const result = await mapWaterSignalsToTheme();
      toast.success(`Successfully mapped ${result.mappings?.length || 0} water-related signals`);
      window.location.reload();
    } catch (error) {
      console.error('Error mapping signals:', error);
      toast.error('Failed to map water signals');
    } finally {
      setIsMapping(false);
    }
  };

  return (
    <Button
      onClick={handleMapSignals}
      disabled={isMapping}
      size="sm"
      variant="outline"
    >
      <Droplet className="h-4 w-4 mr-2" />
      {isMapping ? 'Mapping Signals...' : 'Find Water Signals'}
    </Button>
  );
}
