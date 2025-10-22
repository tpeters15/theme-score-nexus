import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function Classifier() {
  const [loading, setLoading] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");

  const handleClassify = async () => {
    if (!companyName || !website) {
      toast.error("Please provide company name and website");
      return;
    }

    setLoading(true);
    try {
      // First, create/upsert the company record
      const { data: companyData, error: companyError } = await supabase
        .from("companies")
        .upsert({
          company_name: companyName,
          website_domain: website.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0],
          description: description || null,
          source_system: "dashboard",
          classification_status: "pending"
        }, {
          onConflict: 'website_domain',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (companyError) throw companyError;

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

      toast.success("Company classification started! This may take a moment...");
      
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
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Company Classifier</h1>
        <p className="text-muted-foreground">
          Classify companies into climate-tech taxonomy themes using AI
        </p>
      </div>

      <Tabs defaultValue="single" className="w-full">
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="single">Single Company</TabsTrigger>
        </TabsList>

        <TabsContent value="single">
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

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">How it works:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>AI scrapes the company website for information</li>
              <li>Analyzes business model against climate-tech taxonomy</li>
              <li>Assigns the most relevant theme with confidence score</li>
              <li>Results are saved to company_theme_mappings table</li>
            </ol>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
