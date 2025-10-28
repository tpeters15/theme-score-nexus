import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { ClassificationResult } from "./ClassificationResult";

export const SingleCompanyClassifier = () => {
  const [loading, setLoading] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [result, setResult] = useState<any>(null);

  const handleClassify = async () => {
    if (!companyName || !website) {
      toast.error("Please provide company name and website");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // First, create/upsert the company record
      const { data: companyData, error: companyError } = await supabase
        .from("companies")
        .upsert({
          company_name: companyName,
          website_domain: website.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0],
          description: description || null,
          source_system: "manual",
          classification_status: "pending"
        }, {
          onConflict: 'website_domain',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (companyError) throw companyError;

      console.log(`Processing company: ${companyName}`);

      // Call the classify-company edge function
      const { data: classifyData, error: classifyError } = await supabase.functions.invoke(
        'classify-company',
        {
          body: {
            companyId: companyData.id,
            companyName: companyName,
            website: website,
            business_description: description
          }
        }
      );

      if (classifyError) throw classifyError;

      toast.success("Classification completed successfully!");

      // Fetch the classification result with research summary
      const { data: mappingData, error: mappingError } = await supabase
        .from("company_theme_mappings")
        .select(`
          *,
          theme:taxonomy_themes(
            id,
            name,
            sector:taxonomy_sectors(
              name,
              pillar:taxonomy_pillars(name)
            )
          )
        `)
        .eq("company_id", companyData.id)
        .eq("is_primary", true)
        .single();

      // Fetch company for research summary
      const { data: companyFullData } = await supabase
        .from("companies")
        .select("classification_research_summary")
        .eq("id", companyData.id)
        .single();

      if (mappingError) {
        console.warn("Could not fetch mapping:", mappingError);
      }

      // Format result for display
      setResult({
        company_name: companyName,
        website: website,
        primary_theme: mappingData?.theme?.name || "Unknown",
        theme_id: mappingData?.theme_id,
        sector: mappingData?.theme?.sector?.name,
        pillar: mappingData?.theme?.sector?.pillar?.name,
        confidence_score: mappingData?.confidence_score || 0,
        rationale: mappingData?.notes || classifyData?.rationale || "No rationale provided",
        status: "Completed",
        website_summary: true,
        perplexity_research: true,
        research_summary: companyFullData?.classification_research_summary
      });

      // Clear form
      setCompanyName("");
      setWebsite("");
      setDescription("");
    } catch (error: any) {
      console.error("Classification error:", error);
      toast.error(error.message || "Failed to classify company");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="company-name">Company Name *</Label>
            <Input
              id="company-name"
              placeholder="e.g., Tesla"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="website">Website *</Label>
            <Input
              id="website"
              placeholder="e.g., https://tesla.com"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="description">Business Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Brief description of what the company does..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              rows={4}
            />
          </div>

          <Button
            onClick={handleClassify}
            disabled={loading || !companyName || !website}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Classifying...
              </>
            ) : (
              "Classify Company"
            )}
          </Button>
        </div>
      </Card>

      {result && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <ClassificationResult result={result} />
        </div>
      )}

      <div className="p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">How it works:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
          <li>AI scrapes the company website for information</li>
          <li>Analyzes business model against climate-tech taxonomy</li>
          <li>Assigns the most relevant theme with confidence score</li>
          <li>Results are saved to company_theme_mappings table</li>
        </ol>
      </div>
    </div>
  );
};
