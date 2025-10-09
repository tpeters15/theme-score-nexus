import { useState } from 'react';
import { useTaxonomy } from '@/hooks/useTaxonomy';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Database, Search, ChevronDown, ChevronRight, FileText, FolderTree, Tag } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

const TaxonomyManagement = () => {
  const { pillars, sectors, themes, businessModels, loading } = useTaxonomy();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedPillars, setExpandedPillars] = useState<Set<string>>(new Set());
  const [expandedSectors, setExpandedSectors] = useState<Set<string>>(new Set());

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const stats = {
    pillars: pillars.length,
    sectors: sectors.length,
    themes: themes.length,
    businessModels: businessModels.length,
  };

  const togglePillar = (pillarId: string) => {
    setExpandedPillars(prev => {
      const newSet = new Set(prev);
      if (newSet.has(pillarId)) {
        newSet.delete(pillarId);
      } else {
        newSet.add(pillarId);
      }
      return newSet;
    });
  };

  const toggleSector = (sectorId: string) => {
    setExpandedSectors(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectorId)) {
        newSet.delete(sectorId);
      } else {
        newSet.add(sectorId);
      }
      return newSet;
    });
  };

  const getThemeBusinessModels = (themeId: string) => {
    // This would need proper data fetching - placeholder for now
    return [];
  };

  const filteredData = pillars.map(pillar => {
    const pillarSectors = sectors.filter(s => s.pillar_id === pillar.id);
    const sectorsWithThemes = pillarSectors.map(sector => ({
      ...sector,
      themes: themes.filter(t => t.sector_id === sector.id)
    }));
    
    return {
      ...pillar,
      sectors: sectorsWithThemes
    };
  }).filter(pillar => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    
    // Search in pillar name
    if (pillar.name.toLowerCase().includes(query)) return true;
    
    // Search in sectors
    const hasMatchingSector = pillar.sectors.some(sector => 
      sector.name.toLowerCase().includes(query)
    );
    if (hasMatchingSector) return true;
    
    // Search in themes
    const hasMatchingTheme = pillar.sectors.some(sector =>
      sector.themes.some(theme => 
        theme.name.toLowerCase().includes(query) ||
        theme.description?.toLowerCase().includes(query)
      )
    );
    
    return hasMatchingTheme;
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Database className="h-8 w-8 text-primary" />
            </div>
            Taxonomy Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Investment classification hierarchy and structure
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <FolderTree className="h-4 w-4" />
              Pillars
            </CardDescription>
            <CardTitle className="text-3xl">{stats.pillars}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <FolderTree className="h-4 w-4" />
              Sectors
            </CardDescription>
            <CardTitle className="text-3xl">{stats.sectors}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Themes
            </CardDescription>
            <CardTitle className="text-3xl">{stats.themes}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Business Models
            </CardDescription>
            <CardTitle className="text-3xl">{stats.businessModels}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search taxonomy by pillar, sector, or theme..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Hierarchical Taxonomy View */}
      <Card>
        <CardHeader>
          <CardTitle>Taxonomy Hierarchy</CardTitle>
          <CardDescription>
            Complete investment classification structure
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {filteredData.map((pillar) => (
            <Collapsible
              key={pillar.id}
              open={expandedPillars.has(pillar.id)}
              onOpenChange={() => togglePillar(pillar.id)}
            >
              <div className="border rounded-lg">
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      {expandedPillars.has(pillar.id) ? (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      )}
                      <FolderTree className="h-5 w-5 text-primary" />
                      <div className="text-left">
                        <h3 className="font-semibold text-lg">{pillar.name}</h3>
                        {pillar.description && (
                          <p className="text-sm text-muted-foreground">{pillar.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {pillar.sectors.length} sectors
                      </Badge>
                      <Badge variant="outline">
                        {pillar.sectors.reduce((acc, s) => acc + s.themes.length, 0)} themes
                      </Badge>
                    </div>
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="border-t bg-muted/20 p-4 space-y-3">
                    {pillar.sectors.map((sector) => (
                      <Collapsible
                        key={sector.id}
                        open={expandedSectors.has(sector.id)}
                        onOpenChange={() => toggleSector(sector.id)}
                      >
                        <div className="border rounded-lg bg-background">
                          <CollapsibleTrigger className="w-full">
                            <div className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors">
                              <div className="flex items-center gap-3">
                                {expandedSectors.has(sector.id) ? (
                                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                )}
                                <FolderTree className="h-4 w-4 text-blue-500" />
                                <div className="text-left">
                                  <p className="font-medium">{sector.name}</p>
                                  {sector.description && (
                                    <p className="text-xs text-muted-foreground">{sector.description}</p>
                                  )}
                                </div>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {sector.themes.length} themes
                              </Badge>
                            </div>
                          </CollapsibleTrigger>

                          <CollapsibleContent>
                            <div className="border-t bg-muted/10 p-3 space-y-2">
                              {sector.themes.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                  No themes in this sector
                                </p>
                              ) : (
                                sector.themes.map((theme) => (
                                  <div
                                    key={theme.id}
                                    className="border rounded-lg p-3 bg-background hover:bg-muted/30 transition-colors"
                                  >
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="flex items-start gap-2 flex-1">
                                        <FileText className="h-4 w-4 text-green-500 mt-0.5" />
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2">
                                            <p className="font-medium text-sm">{theme.name}</p>
                                            <Badge variant="outline" className="text-xs">
                                              v{theme.version}
                                            </Badge>
                                            {!theme.is_active && (
                                              <Badge variant="destructive" className="text-xs">
                                                Inactive
                                              </Badge>
                                            )}
                                          </div>
                                          {theme.description && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                              {theme.description}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </CollapsibleContent>
                        </div>
                      </Collapsible>
                    ))}
                    
                    {pillar.sectors.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No sectors in this pillar
                      </p>
                    )}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          ))}

          {filteredData.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No results found for "{searchQuery}"</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TaxonomyManagement;
