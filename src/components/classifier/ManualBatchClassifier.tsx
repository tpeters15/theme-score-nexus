import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { BatchClassificationResults } from "./BatchClassificationResults";

interface Company {
  company_name: string;
  website: string;
}

export const ManualBatchClassifier = () => {
  const [companies, setCompanies] = useState<Company[]>([
    { company_name: "", website: "" },
    { company_name: "", website: "" },
  ]);
  const [batchName, setBatchName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeBatchId, setActiveBatchId] = useState<string | null>(null);
  const { toast } = useToast();

  const addCompanyRow = () => {
    if (companies.length < 10) {
      setCompanies([...companies, { company_name: "", website: "" }]);
    }
  };

  const removeCompanyRow = (index: number) => {
    if (companies.length > 1) {
      setCompanies(companies.filter((_, i) => i !== index));
    }
  };

  const updateCompany = (index: number, field: keyof Company, value: string) => {
    const updated = [...companies];
    updated[index][field] = value;
    setCompanies(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validCompanies = companies.filter(
      (c) => c.company_name.trim() && c.website.trim()
    );

    if (validCompanies.length === 0) {
      toast({
        title: "No Valid Companies",
        description: "Please enter at least one company with both name and website",
        variant: "destructive",
      });
      return;
    }

    if (!batchName.trim()) {
      toast({
        title: "Missing Batch Name",
        description: "Please enter a name for this batch",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const user = (await supabase.auth.getUser()).data.user;

      // Create batch
      const { data: batchData, error: batchError } = await supabase
        .from("classification_batches")
        .insert({
          batch_name: batchName,
          company_count: validCompanies.length,
          user_id: user?.id,
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

      const taxonomyVersion = latestTheme?.version || 1;

      // Create company records and classifications
      const companyRecords = [];
      for (const company of validCompanies) {
        const domain = company.website.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];

        const { data: companyData, error: companyError } = await supabase
          .from("companies")
          .upsert(
            {
              company_name: company.company_name,
              website_domain: domain,
            },
            { onConflict: 'website_domain', ignoreDuplicates: false }
          )
          .select()
          .single();

        if (companyError) throw companyError;

        const { data: classification } = await supabase
          .from("classifications")
          .insert({
            company_id: companyData.id,
            batch_id: batchData.id,
            source_system: 'dashboard',
            classification_type: 'initial',
            taxonomy_version: taxonomyVersion,
            status: "Pending",
          })
          .select()
          .single();

        companyRecords.push({
          classification_id: classification?.id,
          company_id: companyData.id,
          company_name: company.company_name,
          website: company.website,
          domain: domain,
          source_system: 'dashboard',
          taxonomy_version: taxonomyVersion
        });
      }

      // Send to n8n
      const webhookUrl = "https://towerbrook.app.n8n.cloud/webhook/dealcloud-classifier";
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batch_id: batchData.id,
          classifications: companyRecords,
        }),
      });

      setActiveBatchId(batchData.id);

      toast({
        title: "Batch Started",
        description: `Processing ${validCompanies.length} companies...`,
      });

      // Reset form
      setCompanies([
        { company_name: "", website: "" },
        { company_name: "", website: "" },
      ]);
      setBatchName("");
    } catch (error: any) {
      console.error("Error processing batch:", error);
      toast({
        title: "Batch Failed",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="batch-name">Batch Name</Label>
          <Input
            id="batch-name"
            placeholder="e.g., EV Infrastructure Companies"
            value={batchName}
            onChange={(e) => setBatchName(e.target.value)}
            disabled={isProcessing}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Companies ({companies.length}/10)</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addCompanyRow}
              disabled={companies.length >= 10 || isProcessing}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Company
            </Button>
          </div>

          {companies.map((company, index) => (
            <div key={index} className="flex gap-2 items-start">
              <div className="flex-1 space-y-2">
                <Input
                  placeholder="Company Name"
                  value={company.company_name}
                  onChange={(e) =>
                    updateCompany(index, "company_name", e.target.value)
                  }
                  disabled={isProcessing}
                />
              </div>
              <div className="flex-1 space-y-2">
                <Input
                  placeholder="https://example.com"
                  type="url"
                  value={company.website}
                  onChange={(e) => updateCompany(index, "website", e.target.value)}
                  disabled={isProcessing}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeCompanyRow(index)}
                disabled={companies.length <= 1 || isProcessing}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <Button type="submit" disabled={isProcessing} className="w-full">
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing Batch...
            </>
          ) : (
            "Classify Companies"
          )}
        </Button>
      </form>

      {activeBatchId && <BatchClassificationResults batchId={activeBatchId} />}
    </div>
  );
};
