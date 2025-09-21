import { Filter, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ThemeWithScores } from "@/types/themes";
import { useState } from "react";

interface ThemeFilterSidebarProps {
  themes: ThemeWithScores[];
  selectedPillars: string[];
  selectedSectors: string[];
  onPillarChange: (pillars: string[]) => void;
  onSectorChange: (sectors: string[]) => void;
  onClearAll: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function ThemeFilterSidebar({
  themes,
  selectedPillars,
  selectedSectors,
  onPillarChange,
  onSectorChange,
  onClearAll,
  searchQuery,
  onSearchChange,
}: ThemeFilterSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

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
  const totalActiveFilters = selectedPillars.length + selectedSectors.length;

  return (
    <div className="flex items-center gap-3">
      {/* Search Bar */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search themes..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-10 h-10 text-sm bg-background/50 border-border/50 focus:bg-background focus:border-primary/50"
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

      {/* Filter Trigger */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant={hasActiveFilters ? "default" : "outline"}
            size="sm"
            className="h-10 px-4 gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
            {totalActiveFilters > 0 && (
              <Badge variant="secondary" className="h-5 px-2 text-xs">
                {totalActiveFilters}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        
        <SheetContent side="right" className="w-80 p-0">
          <div className="flex h-full flex-col">
            <SheetHeader className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <SheetTitle>Filter Themes</SheetTitle>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearAll}
                    className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Clear all
                  </Button>
                )}
              </div>
            </SheetHeader>

            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
              {/* Strategic Pillars */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-foreground">Strategic Pillars</h4>
                  {selectedPillars.length > 0 && (
                    <Badge variant="outline" className="h-5 px-2 text-xs">
                      {selectedPillars.length} selected
                    </Badge>
                  )}
                </div>
                <div className="space-y-2">
                  {availablePillars.map(pillar => {
                    const isSelected = selectedPillars.includes(pillar);
                    const count = themes.filter(t => t.pillar === pillar).length;
                    
                    return (
                      <button
                        key={pillar}
                        onClick={() => togglePillar(pillar)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                          isSelected
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-accent/50 hover:bg-accent text-foreground'
                        }`}
                      >
                        <span className="text-sm font-medium">{pillar}</span>
                        <Badge 
                          variant={isSelected ? "secondary" : "outline"} 
                          className="h-5 px-2 text-xs"
                        >
                          {count}
                        </Badge>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sectors */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-foreground">Sectors</h4>
                  {selectedSectors.length > 0 && (
                    <Badge variant="outline" className="h-5 px-2 text-xs">
                      {selectedSectors.length} selected
                    </Badge>
                  )}
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {availableSectors.map(sector => {
                    const isSelected = selectedSectors.includes(sector);
                    const count = themes.filter(t => 
                      t.sector === sector && 
                      (selectedPillars.length === 0 || selectedPillars.includes(t.pillar))
                    ).length;
                    
                    return (
                      <button
                        key={sector}
                        onClick={() => toggleSector(sector)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                          isSelected
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-accent/50 hover:bg-accent text-foreground'
                        }`}
                      >
                        <span className="text-sm">{sector}</span>
                        <Badge 
                          variant={isSelected ? "secondary" : "outline"} 
                          className="h-5 px-2 text-xs"
                        >
                          {count}
                        </Badge>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2">
          {selectedPillars.slice(0, 2).map(pillar => (
            <Badge
              key={`active-pillar-${pillar}`}
              variant="default"
              className="h-7 px-2 text-xs"
            >
              {pillar}
            </Badge>
          ))}
          {selectedSectors.slice(0, 2).map(sector => (
            <Badge
              key={`active-sector-${sector}`}
              variant="secondary"
              className="h-7 px-2 text-xs"
            >
              {sector}
            </Badge>
          ))}
          {totalActiveFilters > 4 && (
            <Badge variant="outline" className="h-7 px-2 text-xs">
              +{totalActiveFilters - 4} more
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}