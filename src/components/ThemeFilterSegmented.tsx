import { Search, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeWithScores } from "@/types/themes";
import { useState } from "react";

interface ThemeFilterSegmentedProps {
  themes: ThemeWithScores[];
  selectedPillars: string[];
  selectedSectors: string[];
  onPillarChange: (pillars: string[]) => void;
  onSectorChange: (sectors: string[]) => void;
  onClearAll: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function ThemeFilterSegmented({
  themes,
  selectedPillars,
  selectedSectors,
  onPillarChange,
  onSectorChange,
  onClearAll,
  searchQuery,
  onSearchChange,
}: ThemeFilterSegmentedProps) {
  const [activePillar, setActivePillar] = useState<string>("all");
  const [sectorPopoverOpen, setSectorPopoverOpen] = useState(false);

  const availablePillars = Array.from(new Set(themes.map(theme => theme.pillar))).sort();
  const availableSectors = Array.from(new Set(themes.map(theme => theme.sector))).sort();

  const sectorsForActivePillar = activePillar === "all" 
    ? availableSectors
    : Array.from(new Set(
        themes
          .filter(theme => theme.pillar === activePillar)
          .map(theme => theme.sector)
      )).sort();

  const handlePillarChange = (pillar: string) => {
    setActivePillar(pillar);
    if (pillar === "all") {
      onPillarChange([]);
    } else {
      onPillarChange([pillar]);
    }
    // Clear sector filters when changing pillar
    onSectorChange([]);
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
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search themes..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-10 h-11 text-sm bg-background/50 border-border/50 focus:bg-background focus:border-primary/50"
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

      {/* Filter Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Pillar Segmented Control */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Pillar:</span>
            <Tabs value={activePillar} onValueChange={handlePillarChange}>
              <TabsList className="h-10 p-1 bg-muted/50">
                <TabsTrigger value="all" className="h-8 px-4 text-xs font-medium">
                  All Pillars
                </TabsTrigger>
                {availablePillars.map(pillar => (
                  <TabsTrigger 
                    key={pillar} 
                    value={pillar} 
                    className="h-8 px-4 text-xs font-medium"
                  >
                    {pillar}
                    <Badge variant="outline" className="ml-2 h-4 px-1.5 text-xs">
                      {themes.filter(t => t.pillar === pillar).length}
                    </Badge>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Sector Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Sectors:</span>
            <Popover open={sectorPopoverOpen} onOpenChange={setSectorPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 px-4 gap-2 justify-between min-w-32"
                >
                  <span className="text-xs">
                    {selectedSectors.length === 0 
                      ? "All Sectors" 
                      : selectedSectors.length === 1 
                        ? selectedSectors[0]
                        : `${selectedSectors.length} selected`
                    }
                  </span>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-3" align="start">
                <div className="space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-border">
                    <span className="text-sm font-medium">Select Sectors</span>
                    {selectedSectors.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSectorChange([])}
                        className="h-6 px-2 text-xs"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto space-y-1">
                    {sectorsForActivePillar.map(sector => {
                      const isSelected = selectedSectors.includes(sector);
                      const count = themes.filter(t => 
                        t.sector === sector && 
                        (activePillar === "all" || t.pillar === activePillar)
                      ).length;
                      
                      return (
                        <button
                          key={sector}
                          onClick={() => toggleSector(sector)}
                          className={`w-full flex items-center justify-between p-2 rounded text-left transition-colors ${
                            isSelected
                              ? 'bg-primary text-primary-foreground'
                              : 'hover:bg-accent hover:text-accent-foreground'
                          }`}
                        >
                          <span className="text-sm">{sector}</span>
                          <Badge 
                            variant={isSelected ? "secondary" : "outline"} 
                            className="h-4 px-1.5 text-xs"
                          >
                            {count}
                          </Badge>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Clear All Button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3 mr-1" />
            Clear all filters
          </Button>
        )}
      </div>

      {/* Active Filter Display */}
      {selectedSectors.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Active sectors:</span>
          {selectedSectors.map(sector => (
            <Badge
              key={`active-${sector}`}
              variant="secondary"
              className="h-6 px-2 text-xs cursor-pointer hover:bg-secondary/80"
              onClick={() => toggleSector(sector)}
            >
              {sector}
              <X className="ml-1 h-3 w-3" />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}