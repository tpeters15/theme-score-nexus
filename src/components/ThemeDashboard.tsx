import { useState } from "react";
import { ThemeCard } from "./ThemeCard";
import { ThemeDetailModal } from "./ThemeDetailModal";
import { DashboardHeader } from "./DashboardHeader";
import { useThemes } from "@/hooks/useThemes";
import { ThemeWithScores, Score } from "@/types/themes";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Filter, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ThemeDashboard() {
  const { themes, loading, updateThemeScores } = useThemes();
  const [selectedTheme, setSelectedTheme] = useState<ThemeWithScores | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredThemes = themes.filter(theme =>
    theme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    theme.pillar.toLowerCase().includes(searchQuery.toLowerCase()) ||
    theme.sector.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSaveScores = async (themeId: string, scores: Partial<Score>[]) => {
    await updateThemeScores(themeId, scores);
    setSelectedTheme(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <div className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-7 gap-4">
            {Array.from({ length: 49 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
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
              <h2 className="text-3xl font-bold text-foreground">Investment Themes</h2>
              <p className="text-muted-foreground">
                {themes.length} themes across {new Set(themes.map(t => t.pillar)).size} strategic pillars
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search themes, pillars, or sectors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
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