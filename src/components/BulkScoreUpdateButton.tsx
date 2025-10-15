import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { BulkScoringModal } from './BulkScoringModal';

interface BulkScoreUpdateButtonProps {
  themeId: string;
  themeName: string;
  onComplete?: () => void;
}

export function BulkScoreUpdateButton({ themeId, themeName, onComplete }: BulkScoreUpdateButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        size="sm"
        variant="outline"
        data-bulk-trigger
      >
        <Upload className="h-4 w-4 mr-2" />
        Load Predefined Scores
      </Button>

      <BulkScoringModal
        themeId={themeId}
        themeName={themeName}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onComplete={onComplete}
      />
    </>
  );
}
