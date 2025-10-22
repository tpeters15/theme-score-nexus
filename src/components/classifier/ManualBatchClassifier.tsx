import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Plus, X } from "lucide-react";

interface CompanyInput {
  id: string;
  name: string;
  website: string;
  description: string;
}

export const ManualBatchClassifier = () => {
  const [loading, setLoading] = useState(false);
  const [batchName, setBatchName] = useState("");
  const [companies, setCompanies] = useState<CompanyInput[]>([
    { id: "1", name: "", website: "", description: "" }
  ]);

  const addCompany = () => {
    setCompanies([
      ...companies,
      { id: Date.now().toString(), name: "", website: "", description: "" }
    ]);
  };

  const removeCompany = (id: string) => {
    if (companies.length > 1) {
      setCompanies(companies.filter((c) => c.id !== id));
    }
  };

  const updateCompany = (id: string, field: keyof CompanyInput, value: string) => {
    setCompanies(
      companies.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const handleClassifyBatch = async () => {
    const validCompanies = companies.filter((c) => c.name && c.website);
    
    if (!batchName) {
      toast.error("Please provide a batch name");
      return;
    }

    if (validCompanies.length === 0) {
      toast.error("Please add at least one company with name and website");
      return;
    }

    setLoading(true);

    try {
      toast.info(`Starting classification of ${validCompanies.length} companies...`);

      // Process each company sequentially
      for (const company of validCompanies) {
        // Create/upsert company record
        const { data: companyData, error: companyError } = await supabase
          .from("companies")
          .upsert({
            company_name: company.name,
            website_domain: company.website
              .replace(/^https?:\/\//, '')
              .replace(/^www\./, '')
              .split('/')[0],
            description: company.description || null,
            source_system: "dashboard_batch",
            classification_status: "pending"
          }, {
            onConflict: 'website_domain',
            ignoreDuplicates: false
          })
          .select()
          .single();

        if (companyError) {
          console.error(`Error creating company ${company.name}:`, companyError);
          continue;
        }

        // Call classify-company edge function
        const { error: classifyError } = await supabase.functions.invoke(
          'classify-company',
          {
            body: {
              companyId: companyData.id,
              companyName: company.name,
              website: company.website,
              business_description: company.description
            }
          }
        );

        if (classifyError) {
          console.error(`Error classifying ${company.name}:`, classifyError);
        }
      }

      toast.success(`Batch classification completed for ${validCompanies.length} companies!`);
      
      // Reset form
      setBatchName("");
      setCompanies([{ id: "1", name: "", website: "", description: "" }]);
    } catch (error: any) {
      console.error("Batch classification error:", error);
      toast.error(error.message || "Failed to classify batch");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <Label htmlFor="batch-name">Batch Name *</Label>
            <Input
              id="batch-name"
              placeholder="e.g., Q1 2024 Prospects"
              value={batchName}
              onChange={(e) => setBatchName(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Companies</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addCompany}
                disabled={loading}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Company
              </Button>
            </div>

            {companies.map((company, index) => (
              <Card key={company.id} className="p-4 relative">
                {companies.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => removeCompany(company.id)}
                    disabled={loading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}

                <div className="space-y-3 pr-8">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Company Name *</Label>
                      <Input
                        placeholder="e.g., Tesla"
                        value={company.name}
                        onChange={(e) => updateCompany(company.id, "name", e.target.value)}
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Website *</Label>
                      <Input
                        placeholder="e.g., https://tesla.com"
                        value={company.website}
                        onChange={(e) => updateCompany(company.id, "website", e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Description (Optional)</Label>
                    <Textarea
                      placeholder="Brief description..."
                      value={company.description}
                      onChange={(e) => updateCompany(company.id, "description", e.target.value)}
                      disabled={loading}
                      rows={2}
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Button
            onClick={handleClassifyBatch}
            disabled={loading || !batchName || companies.filter(c => c.name && c.website).length === 0}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Classifying Batch...
              </>
            ) : (
              `Classify ${companies.filter(c => c.name && c.website).length} Companies`
            )}
          </Button>
        </div>
      </Card>

      <div className="p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">Manual Batch Classification:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
          <li>Add multiple companies manually</li>
          <li>Each company will be classified sequentially</li>
          <li>Results saved to company_theme_mappings table</li>
          <li>Check the Results tab to view classifications</li>
        </ul>
      </div>
    </div>
  );
};
