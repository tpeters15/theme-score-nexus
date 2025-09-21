import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeWithScores } from "@/types/themes";
import { useState } from "react";

interface ThemeFilterPillsProps {
  themes: ThemeWithScores[];
  selectedPillars: string[];
  selectedSectors: string[];
  onPillarChange: (pillars: string[]) => void;
  onSectorChange: (sectors: string[]) => void;
  onClearAll: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function ThemeFilterPills({
  themes,
  selectedPillars,
  selectedSectors,
  onPillarChange,
  onSectorChange,
  onClearAll,
  searchQuery,
  onSearchChange,
}: ThemeFilterPillsProps) {
  const [showPillars, setShowPillars] = useState(false);
  const [showSectors, setShowSectors] = useState(false);

  const availablePillars = Array.from(new Set(themes.map(theme => theme.pillar))).sort();
  const availableSectors = Array.from(new Set(themes.map(theme => theme.sector))).sort();

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
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search themes..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-10 h-12 text-sm bg-background/50 border-border/50 focus:bg-background focus:border-primary/50"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSearchChange("")}
            className="absolute right-2 top-1/2 h-6 w-6 p-0 -translate-y-1/2"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Filter Pills Row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Pillar Filter */}
        <div className="relative">
          <Button
            variant={selectedPillars.length > 0 ? "default" : "outline"}
            size="sm"
            onClick={() => setShowPillars(!showPillars)}
            className="h-8 px-3 text-xs font-medium"
          >
            Pillars
            {selectedPillars.length > 0 && (
              <Badge variant="secondary" className="ml-2 h-4 px-1.5 text-xs">
                {selectedPillars.length}
              </Badge>
            )}
          </Button>
          
          {showPillars && (
            <div className="absolute top-10 left-0 z-50 min-w-[200px] p-3 bg-background border border-border rounded-lg shadow-lg">
              <div className="space-y-2">
                {availablePillars.map(pillar => (
                  <button
                    key={pillar}
                    onClick={() => togglePillar(pillar)}
                    className={`w-full text-left px-2 py-1.5 text-xs rounded transition-colors ${
                      selectedPillars.includes(pillar)
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent hover:text-accent-foreground'
                    }`}
                  >
                    {pillar}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sector Filter */}
        <div className="relative">
          <Button
            variant={selectedSectors.length > 0 ? "default" : "outline"}
            size="sm"
            onClick={() => setShowSectors(!showSectors)}
            className="h-8 px-3 text-xs font-medium"
          >
            Sectors
            {selectedSectors.length > 0 && (
              <Badge variant="secondary" className="ml-2 h-4 px-1.5 text-xs">
                {selectedSectors.length}
              </Badge>
            )}
          </Button>
          
          {showSectors && (
            <div className="absolute top-10 left-0 z-50 min-w-[200px] max-h-48 overflow-y-auto p-3 bg-background border border-border rounded-lg shadow-lg">
              <div className="space-y-2">
                {availableSectors.map(sector => (
                  <button
                    key={sector}
                    onClick={() => toggleSector(sector)}
                    className={`w-full text-left px-2 py-1.5 text-xs rounded transition-colors ${
                      selectedSectors.includes(sector)
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent hover:text-accent-foreground'
                    }`}
                  >
                    {sector}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Active Filter Pills */}
        {selectedPillars.map(pillar => (
          <Badge
            key={`pillar-${pillar}`}
            variant="default"
            className="h-7 px-2 text-xs cursor-pointer hover:bg-primary/80"
            onClick={() => togglePillar(pillar)}
          >
            {pillar}
            <X className="ml-1 h-3 w-3" />
          </Badge>
        ))}

        {selectedSectors.map(sector => (
          <Badge
            key={`sector-${sector}`}
            variant="secondary"
            className="h-7 px-2 text-xs cursor-pointer hover:bg-secondary/80"
            onClick={() => toggleSector(sector)}
          >
            {sector}
            <X className="ml-1 h-3 w-3" />
          </Badge>
        ))}

        {/* Clear All */}
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
    </div>
  );
}