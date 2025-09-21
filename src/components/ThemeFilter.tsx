import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  const [isOpen, setIsOpen] = useState(false);

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
  const filterCount = selectedPillars.length + selectedSectors.length;

  return (
    <div className="flex items-center gap-4">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            className="relative h-8 text-xs"
          >
            Filters
            {filterCount > 0 && (
              <Badge 
                variant="secondary" 
                className="ml-1.5 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {filterCount}
              </Badge>
            )}
            <ChevronDown className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="start" className="w-72 z-50 bg-popover border shadow-lg">
          <DropdownMenuLabel className="flex items-center justify-between text-xs">
            <span>Strategic Pillars</span>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearAll}
                className="h-auto p-1 text-xs text-muted-foreground hover:text-foreground"
              >
                Clear all
              </Button>
            )}
          </DropdownMenuLabel>
          
          <div className="p-1.5 space-y-0.5">
            {availablePillars.map(pillar => (
              <div
                key={pillar}
                className="flex items-center justify-between p-2 rounded-md hover:bg-accent cursor-pointer transition-colors"
                onClick={() => togglePillar(pillar)}
              >
                <span className="text-xs font-medium">{pillar}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs h-4 px-1.5">
                    {themes.filter(t => t.pillar === pillar).length}
                  </Badge>
                  {selectedPillars.includes(pillar) && (
                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  )}
                </div>
              </div>
            ))}
          </div>

          <DropdownMenuSeparator />
          
          <DropdownMenuLabel className="text-xs">
            Sectors
            {selectedPillars.length > 0 && (
              <span className="text-xs text-muted-foreground ml-2">
                (filtered by pillars)
              </span>
            )}
          </DropdownMenuLabel>
          
          <div className="p-1.5 space-y-0.5 max-h-48 overflow-y-auto">
            {sectorsForSelectedPillars.map(sector => (
              <div
                key={sector}
                className="flex items-center justify-between p-2 rounded-md hover:bg-accent cursor-pointer transition-colors"
                onClick={() => toggleSector(sector)}
              >
                <span className="text-xs font-medium">{sector}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs h-4 px-1.5">
                    {themes.filter(t => 
                      t.sector === sector && 
                      (selectedPillars.length === 0 || selectedPillars.includes(t.pillar))
                    ).length}
                  </Badge>
                  {selectedSectors.includes(sector) && (
                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

    </div>
  );
}