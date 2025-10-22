import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Upload, FileSpreadsheet } from "lucide-react";

export const FileUploadClassifier = () => {
  const [loading, setLoading] = useState(false);
  const [batchName, setBatchName] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== "text/csv" && !selectedFile.name.endsWith(".csv")) {
        toast.error("Please upload a CSV file");
        return;
      }
      setFile(selectedFile);
    }
  };

  const parseCSV = (text: string): Array<{ name: string; website: string; description?: string }> => {
    const lines = text.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    const nameIndex = headers.findIndex(h => h.includes('name') || h.includes('company'));
    const websiteIndex = headers.findIndex(h => h.includes('website') || h.includes('url'));
    const descIndex = headers.findIndex(h => h.includes('description') || h.includes('desc'));

    if (nameIndex === -1 || websiteIndex === -1) {
      throw new Error("CSV must contain 'company name' and 'website' columns");
    }

    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      return {
        name: values[nameIndex],
        website: values[websiteIndex],
        description: descIndex >= 0 ? values[descIndex] : undefined
      };
    }).filter(item => item.name && item.website);
  };

  const handleUpload = async () => {
    if (!batchName) {
      toast.error("Please provide a batch name");
      return;
    }

    if (!file) {
      toast.error("Please select a CSV file");
      return;
    }

    setLoading(true);

    try {
      const text = await file.text();
      const companies = parseCSV(text);

      if (companies.length === 0) {
        toast.error("No valid companies found in CSV");
        return;
      }

      toast.info(`Starting classification of ${companies.length} companies from CSV...`);

      // Process each company
      for (const company of companies) {
        const { data: companyData, error: companyError } = await supabase
          .from("companies")
          .upsert({
            company_name: company.name,
            website_domain: company.website
              .replace(/^https?:\/\//, '')
              .replace(/^www\./, '')
              .split('/')[0],
            description: company.description || null,
            source_system: "bulk_upload",
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

      toast.success(`CSV batch classification completed for ${companies.length} companies!`);
      
      // Reset form
      setBatchName("");
      setFile(null);
      const fileInput = document.getElementById('csv-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error: any) {
      console.error("CSV upload error:", error);
      toast.error(error.message || "Failed to process CSV");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <Label htmlFor="batch-name-csv">Batch Name *</Label>
            <Input
              id="batch-name-csv"
              placeholder="e.g., Q1 2024 CSV Import"
              value={batchName}
              onChange={(e) => setBatchName(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="csv-file">CSV File *</Label>
            <div className="mt-2">
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                disabled={loading}
              />
            </div>
            {file && (
              <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <FileSpreadsheet className="h-4 w-4" />
                <span>{file.name}</span>
              </div>
            )}
          </div>

          <Button
            onClick={handleUpload}
            disabled={loading || !batchName || !file}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing CSV...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload & Classify
              </>
            )}
          </Button>
        </div>
      </Card>

      <div className="p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">CSV Format Requirements:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
          <li>First row must contain column headers</li>
          <li>Required columns: "Company Name" and "Website"</li>
          <li>Optional column: "Description"</li>
          <li>Each company will be classified automatically</li>
        </ul>
        <div className="mt-3 p-3 bg-background rounded border text-xs font-mono">
          <div>Company Name,Website,Description</div>
          <div>Tesla,https://tesla.com,Electric vehicles and clean energy</div>
          <div>Rivian,https://rivian.com,Electric adventure vehicles</div>
        </div>
      </div>
    </div>
  );
};
