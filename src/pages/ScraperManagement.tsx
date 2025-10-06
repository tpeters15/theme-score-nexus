import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { VisualSelectorBuilder } from "@/components/scraper/VisualSelectorBuilder";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ScraperManagement = () => {
  const [step, setStep] = useState<'setup' | 'configure' | 'test'>('setup');
  const [sourceName, setSourceName] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [sourceType, setSourceType] = useState<'rss' | 'html_simple' | 'html_ai'>('html_simple');
  const [showBuilder, setShowBuilder] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleStartBuilder = () => {
    if (!sourceName || !sourceUrl) {
      toast({
        title: "Missing information",
        description: "Please provide source name and URL",
        variant: "destructive"
      });
      return;
    }

    setShowBuilder(true);
  };

  const handleSaveConfig = async (config: any) => {
    try {
      // Save to Supabase
      const { data, error } = await supabase
        .from('sources')
        .insert({
          source_name: sourceName,
          source_type: sourceType,
          base_url: sourceUrl,
          scraping_config: config,
          status: 'inactive',
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Scraper created",
        description: "Your scraper configuration has been saved. Test it before activating."
      });

      // Navigate to test page
      navigate(`/scraper-test/${data.id}`);
    } catch (error) {
      console.error('Error saving scraper:', error);
      toast({
        title: "Error",
        description: "Failed to save scraper configuration",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Add New Scraper Source</CardTitle>
          <CardDescription>
            Configure a new data source for signal collection
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'setup' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="sourceName">Source Name</Label>
                <Input
                  id="sourceName"
                  placeholder="e.g., European Commission Press Releases"
                  value={sourceName}
                  onChange={(e) => setSourceName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sourceUrl">Source URL</Label>
                <Input
                  id="sourceUrl"
                  type="url"
                  placeholder="https://ec.europa.eu/..."
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Source Type</Label>
                <Tabs value={sourceType} onValueChange={(v: any) => setSourceType(v)}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="rss">RSS Feed</TabsTrigger>
                    <TabsTrigger value="html_simple">HTML (Visual)</TabsTrigger>
                    <TabsTrigger value="html_ai">HTML (AI)</TabsTrigger>
                  </TabsList>

                  <TabsContent value="rss" className="space-y-2">
                    <p className="text-sm text-gray-600">
                      ✅ <strong>Best for:</strong> Standard RSS/Atom feeds
                    </p>
                    <p className="text-sm text-gray-600">
                      📊 <strong>Reliability:</strong> 99%
                    </p>
                    <p className="text-sm text-gray-600">
                      💰 <strong>Cost:</strong> Free
                    </p>
                    <p className="text-sm text-gray-600">
                      No configuration needed - RSS is standardized
                    </p>
                  </TabsContent>

                  <TabsContent value="html_simple" className="space-y-2">
                    <p className="text-sm text-gray-600">
                      ✅ <strong>Best for:</strong> Structured HTML pages with consistent layout
                    </p>
                    <p className="text-sm text-gray-600">
                      📊 <strong>Reliability:</strong> 95%
                    </p>
                    <p className="text-sm text-gray-600">
                      💰 <strong>Cost:</strong> ~$0.001 per scrape
                    </p>
                    <p className="text-sm text-gray-600">
                      ⚡ <strong>Speed:</strong> Fast (0.5-2 seconds)
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      Uses visual selector - you click elements to configure
                    </p>
                  </TabsContent>

                  <TabsContent value="html_ai" className="space-y-2">
                    <p className="text-sm text-gray-600">
                      ✅ <strong>Best for:</strong> Complex pages, newsletters, PDFs
                    </p>
                    <p className="text-sm text-gray-600">
                      📊 <strong>Reliability:</strong> 90%
                    </p>
                    <p className="text-sm text-gray-600">
                      💰 <strong>Cost:</strong> ~$0.05 per scrape
                    </p>
                    <p className="text-sm text-gray-600">
                      ⚡ <strong>Speed:</strong> Slow (3-10 seconds)
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      AI extracts data based on your instructions
                    </p>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => navigate(-1)} variant="outline">
                  Cancel
                </Button>
                <Button onClick={handleStartBuilder}>
                  {sourceType === 'rss' ? 'Save & Test' : 'Configure Selectors'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Visual Builder Dialog */}
      <Dialog open={showBuilder} onOpenChange={setShowBuilder}>
        <DialogContent className="max-w-[95vw] h-[95vh]">
          <DialogHeader>
            <DialogTitle>Visual Selector Builder - {sourceName}</DialogTitle>
            <DialogDescription>
              Click elements on the page to build your scraper configuration
            </DialogDescription>
          </DialogHeader>
          <VisualSelectorBuilder
            sourceUrl={sourceUrl}
            onSave={handleSaveConfig}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ScraperManagement;
