import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface AddSourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddSourceDialog = ({ open, onOpenChange }: AddSourceDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    source_name: "",
    source_type: "rss",
    base_url: "",
    feed_url: "",
    api_endpoint: "",
    check_frequency: "daily",
    scraping_config: "{}",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let scrapingConfig = {};
      if (formData.scraping_config.trim()) {
        try {
          scrapingConfig = JSON.parse(formData.scraping_config);
        } catch (error) {
          toast({
            title: "Invalid JSON",
            description: "Scraping config must be valid JSON",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
      }

      const user = (await supabase.auth.getUser()).data.user;

      const { error } = await supabase.from("sources").insert({
        source_name: formData.source_name,
        source_type: formData.source_type,
        base_url: formData.base_url || null,
        feed_url: formData.feed_url || null,
        api_endpoint: formData.api_endpoint || null,
        check_frequency: formData.check_frequency,
        scraping_config: scrapingConfig,
        status: "active",
        created_by: user?.id,
      });

      if (error) throw error;

      toast({
        title: "Source added",
        description: `${formData.source_name} has been configured`,
      });

      queryClient.invalidateQueries({ queryKey: ["sources"] });
      onOpenChange(false);
      
      // Reset form
      setFormData({
        source_name: "",
        source_type: "rss",
        base_url: "",
        feed_url: "",
        api_endpoint: "",
        check_frequency: "daily",
        scraping_config: "{}",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add source",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Source</DialogTitle>
          <DialogDescription>
            Configure a new intelligence source for automated monitoring
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="source_name">Source Name *</Label>
            <Input
              id="source_name"
              value={formData.source_name}
              onChange={(e) => setFormData({ ...formData, source_name: e.target.value })}
              placeholder="e.g., Bloomberg Energy News"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="source_type">Source Type *</Label>
              <Select
                value={formData.source_type}
                onValueChange={(value) => setFormData({ ...formData, source_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rss">RSS Feed</SelectItem>
                  <SelectItem value="api">API</SelectItem>
                  <SelectItem value="html">HTML Scraper</SelectItem>
                  <SelectItem value="iea">IEA</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="check_frequency">Check Frequency *</Label>
              <Select
                value={formData.check_frequency}
                onValueChange={(value) => setFormData({ ...formData, check_frequency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="base_url">Base URL</Label>
            <Input
              id="base_url"
              type="url"
              value={formData.base_url}
              onChange={(e) => setFormData({ ...formData, base_url: e.target.value })}
              placeholder="https://example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="feed_url">Feed URL (for RSS sources)</Label>
            <Input
              id="feed_url"
              type="url"
              value={formData.feed_url}
              onChange={(e) => setFormData({ ...formData, feed_url: e.target.value })}
              placeholder="https://example.com/feed.xml"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="api_endpoint">API Endpoint (for API sources)</Label>
            <Input
              id="api_endpoint"
              type="url"
              value={formData.api_endpoint}
              onChange={(e) => setFormData({ ...formData, api_endpoint: e.target.value })}
              placeholder="https://api.example.com/v1/data"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="scraping_config">
              Scraping Config (JSON)
              <span className="text-sm text-muted-foreground ml-2">
                Optional - for HTML scrapers
              </span>
            </Label>
            <Textarea
              id="scraping_config"
              value={formData.scraping_config}
              onChange={(e) => setFormData({ ...formData, scraping_config: e.target.value })}
              placeholder='{"selectors": {"title": ".article-title", "url": "a.article-link"}}'
              rows={4}
              className="font-mono text-sm"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Source"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
