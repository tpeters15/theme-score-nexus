import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeWithScores } from "@/types/themes";

interface ThemeFilterProps {
  themes: ThemeWithScores[];
  selectedPillars: string[];
  selectedSectors: string[];
  onPillarChange: (pillars: string[]) => void;
  onSectorChange: (sectors: string[]) => void;
  onClearAll: () => void;
}

export function ThemeFilter({
  themes,
  selectedPillars,
  selectedSectors,
  onPillarChange,
  onSectorChange,
  onClearAll,
}: ThemeFilterProps) {
  // Get unique pillars and sectors
  const availablePillars = Array.from(new Set(themes.map(theme => theme.pillar))).sort();
  const availableSectors = Array.from(new Set(themes.map(theme => theme.sector))).sort();

  // Get sectors for selected pillars
  const sectorsForSelectedPillars = selectedPillars.length > 0 
    ? Array.from(new Set(
        themes
          .filter(theme => selectedPillars.includes(theme.pillar))
          .map(theme => theme.sector)
      )).sort()
    : availableSectors;

  const togglePillar = (pillar: string) => {
    if (selectedPillars.includes(pillar)) {
      onPillarChange(selectedPillars.filter(p => p !== pillar));
    } else {
      onPillarChange([...selectedPillars, pillar]);
    }
  };

  const toggleSector = (sector: string) => {
    if (selectedSectors.includes(sector)) {
      onSectorChange(selectedSectors.filter(s => s !== sector));
    } else {
      onSectorChange([...selectedSectors, sector]);
    }
  };

  const hasActiveFilters = selectedPillars.length > 0 || selectedSectors.length > 0;

  return (
    <div className="space-y-4 p-4 bg-surface rounded-lg border border-surface">
      {/* Header with clear all */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-foreground">Filters</h3>
          {hasActiveFilters && (
            <Badge variant="secondary" className="h-5 px-2 text-xs">
              {selectedPillars.length + selectedSectors.length}
            </Badge>
          )}
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3 mr-1" />
            Clear all
          </Button>
        )}
      </div>

      {/* Strategic Pillars Row */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Strategic Pillars
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {availablePillars.map(pillar => {
            const isSelected = selectedPillars.includes(pillar);
            const count = themes.filter(t => t.pillar === pillar).length;
            
            return (
              <Button
                key={pillar}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => togglePillar(pillar)}
                className="h-8 px-3 text-xs font-medium transition-all hover:scale-105"
              >
                {pillar}
                <Badge 
                  variant={isSelected ? "secondary" : "outline"} 
                  className="ml-2 h-4 px-1.5 text-xs"
                >
                  {count}
                </Badge>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Sectors Row */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Sectors
          </span>
          {selectedPillars.length > 0 && (
            <Badge variant="outline" className="h-4 px-1.5 text-xs">
              Filtered by pillars
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
          {sectorsForSelectedPillars.map(sector => {
            const isSelected = selectedSectors.includes(sector);
            const count = themes.filter(t => 
              t.sector === sector && 
              (selectedPillars.length === 0 || selectedPillars.includes(t.pillar))
            ).length;
            
            return (
              <Button
                key={sector}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => toggleSector(sector)}
                className="h-8 px-3 text-xs font-medium transition-all hover:scale-105"
              >
                {sector}
                <Badge 
                  variant={isSelected ? "secondary" : "outline"} 
                  className="ml-2 h-4 px-1.5 text-xs"
                >
                  {count}
                </Badge>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}