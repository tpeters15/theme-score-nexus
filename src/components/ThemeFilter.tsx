import { useState } from "react";
import { ChevronDown, X } from "lucide-react";
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
            className="relative"
          >
            Filter by Taxonomy
            {filterCount > 0 && (
              <Badge 
                variant="secondary" 
                className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {filterCount}
              </Badge>
            )}
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="start" className="w-80">
          <DropdownMenuLabel className="flex items-center justify-between">
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
          
          <div className="p-2 space-y-1">
            {availablePillars.map(pillar => (
              <div
                key={pillar}
                className="flex items-center justify-between p-2 rounded-md hover:bg-accent cursor-pointer"
                onClick={() => togglePillar(pillar)}
              >
                <span className="text-sm">{pillar}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {themes.filter(t => t.pillar === pillar).length}
                  </Badge>
                  {selectedPillars.includes(pillar) && (
                    <div className="w-2 h-2 bg-primary rounded-full" />
                  )}
                </div>
              </div>
            ))}
          </div>

          <DropdownMenuSeparator />
          
          <DropdownMenuLabel>
            Investment Sectors
            {selectedPillars.length > 0 && (
              <span className="text-xs text-muted-foreground ml-2">
                (filtered by selected pillars)
              </span>
            )}
          </DropdownMenuLabel>
          
          <div className="p-2 space-y-1 max-h-60 overflow-y-auto">
            {sectorsForSelectedPillars.map(sector => (
              <div
                key={sector}
                className="flex items-center justify-between p-2 rounded-md hover:bg-accent cursor-pointer"
                onClick={() => toggleSector(sector)}
              >
                <span className="text-sm">{sector}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {themes.filter(t => 
                      t.sector === sector && 
                      (selectedPillars.length === 0 || selectedPillars.includes(t.pillar))
                    ).length}
                  </Badge>
                  {selectedSectors.includes(sector) && (
                    <div className="w-2 h-2 bg-primary rounded-full" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          {selectedPillars.map(pillar => (
            <Badge 
              key={pillar} 
              variant="secondary" 
              className="flex items-center gap-1"
            >
              {pillar}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => togglePillar(pillar)}
              />
            </Badge>
          ))}
          {selectedSectors.map(sector => (
            <Badge 
              key={sector} 
              variant="outline" 
              className="flex items-center gap-1"
            >
              {sector}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => toggleSector(sector)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}