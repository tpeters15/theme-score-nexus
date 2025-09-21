import { useState } from "react";
import { ThemeCard } from "./ThemeCard";
import { ThemeDetailModal } from "./ThemeDetailModal";
import { DetailedFrameworkModal } from "./DetailedFrameworkModal";
import { DashboardHeader } from "./DashboardHeader";
import { ThemeFilter } from "./ThemeFilter";
import { useThemes } from "@/hooks/useThemes";
import { ThemeWithScores, Score } from "@/types/themes";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Download, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

interface ThemeDashboardProps {
  initialPillarFilter?: string;
  onBackToOverview?: () => void;
}

export function ThemeDashboard({ initialPillarFilter, onBackToOverview }: ThemeDashboardProps = {}) {
  const { themes, loading, updateThemeScores } = useThemes();
  const [selectedTheme, setSelectedTheme] = useState<ThemeWithScores | null>(null);
  const [selectedDetailedTheme, setSelectedDetailedTheme] = useState<ThemeWithScores | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPillars, setSelectedPillars] = useState<string[]>(
    initialPillarFilter ? [initialPillarFilter] : []
  );
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  const filteredThemes = themes.filter(theme => {
    // Search filter
    const matchesSearch = searchQuery === "" || 
      theme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      theme.pillar.toLowerCase().includes(searchQuery.toLowerCase()) ||
      theme.sector.toLowerCase().includes(searchQuery.toLowerCase());

    // Pillar filter
    const matchesPillar = selectedPillars.length === 0 || 
      selectedPillars.includes(theme.pillar);

    // Sector filter
    const matchesSector = selectedSectors.length === 0 || 
      selectedSectors.includes(theme.sector);

    return matchesSearch && matchesPillar && matchesSector;
  });

  const handleSaveScores = async (themeId: string, scores: Partial<Score>[]) => {
    await updateThemeScores(themeId, scores);
    setSelectedTheme(null);
  };

  const handleClearAllFilters = () => {
    setSelectedPillars([]);
    setSelectedSectors([]);
    setSearchQuery("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <div className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16 p-8">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="h-80 w-96" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              {onBackToOverview && (
                <Button 
                  variant="ghost" 
                  onClick={onBackToOverview}
                  className="mb-2 -ml-4"
                >
                  ← Back to Portfolio Overview
                </Button>
              )}
              <h2 className="text-3xl font-bold text-foreground">
                {initialPillarFilter ? `${initialPillarFilter} Themes` : 'Investment Themes'}
              </h2>
              <p className="text-muted-foreground">
                {filteredThemes.length} themes {initialPillarFilter ? `in ${initialPillarFilter}` : `across ${new Set(themes.map(t => t.pillar)).size} strategic pillars`}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <ThemeFilter
              themes={themes}
              selectedPillars={selectedPillars}
              selectedSectors={selectedSectors}
              onPillarChange={setSelectedPillars}
              onSectorChange={setSelectedSectors}
              onClearAll={handleClearAllFilters}
            />
            
            {/* Selected Filters */}
            {(selectedPillars.length > 0 || selectedSectors.length > 0) && (
              <div className="flex items-center gap-2 flex-wrap">
                {selectedPillars.map((pillar) => (
                  <Badge key={pillar} variant="secondary" className="flex items-center gap-1">
                    {pillar}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setSelectedPillars(selectedPillars.filter((p) => p !== pillar))}
                    />
                  </Badge>
                ))}
                {selectedSectors.map((sector) => (
                  <Badge key={sector} variant="outline" className="flex items-center gap-1">
                    {sector}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setSelectedSectors(selectedSectors.filter((s) => s !== sector))}
                    />
                  </Badge>
                ))}
                <Button variant="ghost" size="sm" onClick={handleClearAllFilters} className="h-auto px-2 text-xs">
                  Clear all
                </Button>
              </div>
            )}
            
            <div className="ml-auto flex items-center gap-2">
              {/* Collapsible Search */}
              <div className="relative flex items-center">
                {!isSearchExpanded ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsSearchExpanded(true)}
                    className="p-2 hover:bg-accent transition-colors"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                ) : (
                  <div className="relative animate-scale-in">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search themes..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onBlur={() => {
                        if (!searchQuery) setIsSearchExpanded(false);
                      }}
                      className="pl-10 w-64"
                      autoFocus
                    />
                  </div>
                )}
              </div>

              {/* Hover Legend */}
              <Popover>
                <PopoverTrigger asChild>
                  <div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="gap-2 hover:bg-accent transition-colors"
                      onMouseEnter={(e) => {
                        // Trigger popover on hover
                        e.currentTarget.click();
                      }}
                    >
                      <Info className="h-4 w-4" />
                      Legend
                    </Button>
                  </div>
                </PopoverTrigger>
                <PopoverContent 
                  align="end" 
                  className="w-64 z-50 animate-fade-in"
                  onOpenAutoFocus={(e) => e.preventDefault()}
                >
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-score-high rounded-full"></div>
                      <span>High (70+)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-score-medium rounded-full"></div>
                      <span>Medium (40-69)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-score-low rounded-full"></div>
                      <span>Low (0-39)</span>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16 p-8">
          {filteredThemes.map((theme) => (
            <ThemeCard
              key={theme.id}
              theme={theme}
              onClick={() => setSelectedTheme(theme)}
            />
          ))}
        </div>

        {filteredThemes.length === 0 && searchQuery && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No themes found matching "{searchQuery}"</p>
          </div>
        )}
      </div>

      <ThemeDetailModal
        theme={selectedTheme}
        isOpen={!!selectedTheme}
        onClose={() => setSelectedTheme(null)}
        onSave={handleSaveScores}
      />
    </div>
  );
}