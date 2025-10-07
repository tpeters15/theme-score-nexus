import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { ClassificationResult } from "./ClassificationResult";

interface Classification {
  id: string;
  primary_theme: string;
  confidence_score: number;
  rationale: string;
  status: string;
  company_name: string;
  website: string;
}

export const SingleCompanyClassifier = () => {
  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<Classification | null>(null);
  const { toast } = useToast();

  const handleClassify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!companyName.trim() || !website.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter both company name and website",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setResult(null);

    try {
      // Create company record
      const { data: companyData, error: companyError } = await supabase
        .from("companies")
        .insert({ company_name: companyName, website_domain: website })
        .select()
        .single();

      if (companyError) throw companyError;

      // Create batch record
      const { data: batchData, error: batchError } = await supabase
        .from("classification_batches")
        .insert({
          batch_name: `Single: ${companyName}`,
          company_count: 1,
          user_id: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (batchError) throw batchError;

      // Get taxonomy version
      const { data: latestTheme } = await supabase
        .from('taxonomy_themes')
        .select('version')
        .order('version', { ascending: false })
        .limit(1)
        .single();

      // Create classification record (no batch for single classifications)
      const { data: classificationData, error: classificationError } = await supabase
        .from("classifications")
        .insert({
          company_id: companyData.id,
          source_system: 'dashboard',
          classification_type: 'initial',
          taxonomy_version: latestTheme?.version || 1,
          status: "Pending",
        })
        .select()
        .single();

      if (classificationError) throw classificationError;

      // Send to n8n webhook
      const webhookUrl = "https://n8n.siliconvalleytrading.com/webhook/classify-company";
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classification_id: classificationData.id,
          company_id: companyData.id,
          company_name: companyName,
          website: website,
          domain: website.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0],
          source_system: 'dashboard',
          taxonomy_version: latestTheme?.version || 1
        }),
      });

      toast({
        title: "Classification Started",
        description: "Your company is being analyzed. Results will appear below.",
      });

      // Poll for results
      const pollInterval = setInterval(async () => {
        const { data } = await supabase
          .from("classifications")
          .select("*")
          .eq("id", classificationData.id)
          .single();

        if (data?.status === "Completed") {
          clearInterval(pollInterval);
          setResult({
            ...data,
            company_name: companyName,
            website: website,
          });
          setIsProcessing(false);
        }
      }, 3000);

      // Stop polling after 5 minutes
      setTimeout(() => {
        clearInterval(pollInterval);
        setIsProcessing(false);
      }, 300000);
    } catch (error: any) {
      console.error("Error classifying company:", error);
      toast({
        title: "Classification Failed",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleClassify} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="company-name">Company Name</Label>
          <Input
            id="company-name"
            placeholder="e.g., Tesla, Inc."
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            disabled={isProcessing}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            type="url"
            placeholder="https://example.com"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            disabled={isProcessing}
          />
        </div>

        <Button type="submit" disabled={isProcessing} className="w-full">
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            "Classify Company"
          )}
        </Button>
      </form>

      {result && <ClassificationResult result={result} />}
    </div>
  );
};
