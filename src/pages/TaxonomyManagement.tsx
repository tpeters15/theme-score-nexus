import { useState } from 'react';
import { useTaxonomy } from '@/hooks/useTaxonomy';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Database } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

const TaxonomyManagement = () => {
  const { pillars, sectors, themes, businessModels, loading } = useTaxonomy();
  const [activeTab, setActiveTab] = useState('overview');

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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Database className="h-6 w-6" />
            Taxonomy Management
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Configure investment classification hierarchy
          </p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Pillars</CardDescription>
            <CardTitle className="text-3xl">{stats.pillars}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Sectors</CardDescription>
            <CardTitle className="text-3xl">{stats.sectors}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Themes</CardDescription>
            <CardTitle className="text-3xl">{stats.themes}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Business Models</CardDescription>
            <CardTitle className="text-3xl">{stats.businessModels}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pillars">Pillars</TabsTrigger>
          <TabsTrigger value="sectors">Sectors</TabsTrigger>
          <TabsTrigger value="themes">Themes</TabsTrigger>
          <TabsTrigger value="business-models">Business Models</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Taxonomy Hierarchy</CardTitle>
              <CardDescription>Complete classification structure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {pillars.map((pillar) => {
                const pillarSectors = sectors.filter(s => s.pillar_id === pillar.id);
                return (
                  <div key={pillar.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">{pillar.name}</h3>
                      <Badge variant="secondary">{pillarSectors.length} sectors</Badge>
                    </div>
                    <div className="pl-4 space-y-2">
                      {pillarSectors.map((sector) => {
                        const sectorThemes = themes.filter(t => t.sector_id === sector.id);
                        return (
                          <div key={sector.id} className="border-l-2 pl-4">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{sector.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {sectorThemes.length} themes
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pillars">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Pillars</CardTitle>
                <CardDescription>Strategic investment pillars</CardDescription>
              </div>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Pillar
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {pillars.map((pillar) => (
                  <div
                    key={pillar.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                  >
                    <div>
                      <p className="font-medium">{pillar.name}</p>
                      {pillar.description && (
                        <p className="text-sm text-muted-foreground">{pillar.description}</p>
                      )}
                    </div>
                    <Badge variant="secondary">Order: {pillar.display_order}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sectors">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Sectors</CardTitle>
                <CardDescription>Investment sectors within pillars</CardDescription>
              </div>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Sector
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {sectors.map((sector) => {
                  const pillar = pillars.find(p => p.id === sector.pillar_id);
                  return (
                    <div
                      key={sector.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                    >
                      <div>
                        <p className="font-medium">{sector.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {pillar?.name}
                        </p>
                      </div>
                      <Badge variant="secondary">Order: {sector.display_order}</Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="themes">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Themes</CardTitle>
                <CardDescription>Investment themes for classification</CardDescription>
              </div>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Theme
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {themes.map((theme) => {
                  const sector = sectors.find(s => s.id === theme.sector_id);
                  return (
                    <div
                      key={theme.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{theme.name}</p>
                        <p className="text-sm text-muted-foreground">{sector?.name}</p>
                        {theme.description && (
                          <p className="text-xs text-muted-foreground mt-1">{theme.description}</p>
                        )}
                      </div>
                      <Badge variant="outline">v{theme.version}</Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business-models">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Business Models</CardTitle>
                <CardDescription>Business model tags for themes</CardDescription>
              </div>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Business Model
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {businessModels.map((model) => (
                  <div
                    key={model.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                  >
                    <div>
                      <p className="font-medium">{model.name}</p>
                      {model.description && (
                        <p className="text-sm text-muted-foreground">{model.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TaxonomyManagement;
