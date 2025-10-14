import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { bulkUpdateScores, INDUSTRIAL_ENERGY_EFFICIENCY_SCORES } from '@/utils/bulkScoreUpdate';

interface BulkScoreUpdateButtonProps {
  themeId: string;
  onComplete?: () => void;
}

export function BulkScoreUpdateButton({ themeId, onComplete }: BulkScoreUpdateButtonProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const handleBulkUpdate = async () => {
    setIsUpdating(true);
    try {
      await bulkUpdateScores(themeId, INDUSTRIAL_ENERGY_EFFICIENCY_SCORES);
      
      toast({
        title: "Scores Updated",
        description: `Successfully updated ${INDUSTRIAL_ENERGY_EFFICIENCY_SCORES.length} scores for this theme.`,
      });

      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Error updating scores:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update scores. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Button
      onClick={handleBulkUpdate}
      disabled={isUpdating}
      size="sm"
      variant="outline"
    >
      <Upload className="h-4 w-4 mr-2" />
      {isUpdating ? 'Updating Scores...' : 'Load Industrial Energy Efficiency Scores'}
    </Button>
  );
}
