import { useState } from "react";
import { ThemeCard } from "./ThemeCard";
import { ThemeTableView } from "./ThemeTableView";
import { ThemeDetailModal } from "./ThemeDetailModal";
import { DetailedFrameworkModal } from "./DetailedFrameworkModal";

import { ThemeFilterSegmented } from "./ThemeFilterSegmented";
import { useThemes } from "@/hooks/useThemes";
import { ThemeWithScores, Score } from "@/types/themes";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Download, Info, X, Grid3X3, Table2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Toggle } from "@/components/ui/toggle";

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
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');

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

  const handleSaveScores = async (themeId: string, scores: Partial<Score>[], keywords?: string[]) => {
    await updateThemeScores(themeId, scores, keywords);
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
      
      
      <div className="container mx-auto px-6 py-6">
        <div className="mb-6 space-y-6">
          <div className="flex items-start justify-between">
            <div>
              {onBackToOverview && (
                <Button 
                  variant="ghost" 
                  onClick={onBackToOverview}
                  className="mb-3 -ml-2 text-xs"
                  size="sm"
                >
                  ← Portfolio Overview
                </Button>
              )}
              <div className="space-y-1">
                <h2 className="text-2xl font-semibold text-foreground">
                  {initialPillarFilter ? `${initialPillarFilter} Investment Themes` : 'Investment Themes'}
                </h2>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{filteredThemes.length} themes</span>
                  <span>•</span>
                  <span>{new Set(themes.map(t => t.pillar)).size} strategic pillars</span>
                  <span>•</span>
                  <span>Last updated: {new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-muted rounded-md p-0.5">
                <Toggle
                  pressed={viewMode === 'cards'}
                  onPressedChange={() => setViewMode('cards')}
                  size="sm"
                  className="h-7 px-2 data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm"
                >
                  <Grid3X3 className="h-3.5 w-3.5" />
                </Toggle>
                <Toggle
                  pressed={viewMode === 'table'}
                  onPressedChange={() => setViewMode('table')}
                  size="sm"
                  className="h-7 px-2 data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm"
                >
                  <Table2 className="h-3.5 w-3.5" />
                </Toggle>
              </div>
              
              <Button variant="outline" size="sm" className="text-xs">
                <Download className="h-3.5 w-3.5 mr-1.5" />
                Export
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Compact Search */}
              <div className="relative flex items-center">
                {!isSearchExpanded ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsSearchExpanded(true)}
                    className="p-1.5 h-8 w-8"
                  >
                    <Search className="h-3.5 w-3.5" />
                  </Button>
                ) : (
                  <div className="relative animate-scale-in">
                    <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Search themes..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onBlur={() => {
                        if (!searchQuery) setIsSearchExpanded(false);
                      }}
                      className="pl-8 w-48 h-8 text-sm"
                      autoFocus
                    />
                  </div>
                )}
              </div>

              {/* Compact Legend */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-1 h-8 px-2 text-xs hover:bg-accent"
                    onMouseEnter={(e) => {
                      e.currentTarget.click();
                    }}
                  >
                    <Info className="h-3.5 w-3.5" />
                    Legend
                  </Button>
                </PopoverTrigger>
                <PopoverContent 
                  align="end" 
                  className="w-48 z-50 animate-fade-in p-3"
                  onOpenAutoFocus={(e) => e.preventDefault()}
                >
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-score-high rounded-full"></div>
                      <span>High (70+)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-score-medium rounded-full"></div>
                      <span>Medium (40-69)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-score-low rounded-full"></div>
                      <span>Low (0-39)</span>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

        </div>

        {/* Dynamic View Rendering */}
        {viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16 p-8">
            {filteredThemes.map((theme) => (
              <ThemeCard
                key={theme.id}
                theme={theme}
                onClick={() => setSelectedTheme(theme)}
              />
            ))}
          </div>
        ) : (
          <div>
            <ThemeTableView 
              themes={filteredThemes}
              onEditTheme={setSelectedTheme}
            />
          </div>
        )}

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