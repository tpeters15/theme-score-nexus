import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { bulkUpdateScores, INDUSTRIAL_ENERGY_EFFICIENCY_SCORES, SMART_WATER_SCORES } from '@/utils/bulkScoreUpdate';
import { useThemes } from '@/hooks/useThemes';

interface BulkScoringModalProps {
  themeId: string;
  themeName: string;
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

const PREDEFINED_SCORES = {
  'Industrial & Commercial Energy Efficiency': INDUSTRIAL_ENERGY_EFFICIENCY_SCORES,
  'Smart Water Infrastructure & Analytics': SMART_WATER_SCORES,
};

export function BulkScoringModal({ themeId, themeName, isOpen, onClose, onComplete }: BulkScoringModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  const { refreshThemes } = useThemes();

  const matchingScores = PREDEFINED_SCORES[themeName as keyof typeof PREDEFINED_SCORES];

  const handleBulkUpdate = async (scoreSet: typeof INDUSTRIAL_ENERGY_EFFICIENCY_SCORES) => {
    setIsUpdating(true);
    try {
      await bulkUpdateScores(themeId, scoreSet);
      
      toast({
        title: "Scores Updated",
        description: `Successfully updated ${scoreSet.length} scores for ${themeName}.`,
      });

      // Refresh both local theme and global themes list
      await refreshThemes();
      
      if (onComplete) {
        onComplete();
      }
      
      onClose();
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Load Predefined Scores</DialogTitle>
          <DialogDescription>
            Choose a predefined scoring template for <span className="font-semibold">{themeName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {matchingScores ? (
            <div className="border border-border rounded-lg p-4 bg-muted/30">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-sm">{themeName}</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {matchingScores.length} criteria scores available
                  </p>
                </div>
                <Check className="h-5 w-5 text-primary" />
              </div>
              
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Sample scores:</p>
                <div className="space-y-1">
                  {matchingScores.slice(0, 3).map((score, idx) => (
                    <div key={idx} className="text-xs flex items-center gap-2">
                      <span className="font-medium bg-primary/10 text-primary px-2 py-0.5 rounded">
                        {score.score}/5
                      </span>
                      <span className="text-muted-foreground truncate">
                        {score.notes.substring(0, 50)}...
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                onClick={() => handleBulkUpdate(matchingScores)}
                disabled={isUpdating}
                className="w-full mt-4"
              >
                {isUpdating ? 'Updating Scores...' : 'Load These Scores'}
              </Button>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No predefined scores available for this theme.</p>
              <p className="text-xs mt-2">You can manually score each criterion in the framework tab.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
