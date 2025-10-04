import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SingleCompanyClassifier } from "@/components/classifier/SingleCompanyClassifier";
import { ManualBatchClassifier } from "@/components/classifier/ManualBatchClassifier";
import { FileUploadClassifier } from "@/components/classifier/FileUploadClassifier";
import { Building2, List, Upload } from "lucide-react";

const Classifier = () => {
  const [activeTab, setActiveTab] = useState("single");

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Company Classification</h1>
        <p className="text-muted-foreground">
          Classify companies against your investment taxonomy using AI-powered analysis
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="single" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Single Company
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Manual Entry (Up to 10)
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            CSV Upload
          </TabsTrigger>
        </TabsList>

        <TabsContent value="single">
          <Card>
            <CardHeader>
              <CardTitle>Single Company Classification</CardTitle>
              <CardDescription>
                Quickly classify a single company by entering its name and website
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SingleCompanyClassifier />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual">
          <Card>
            <CardHeader>
              <CardTitle>Manual Batch Entry</CardTitle>
              <CardDescription>
                Enter up to 10 companies manually for classification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ManualBatchClassifier />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>CSV Batch Upload</CardTitle>
              <CardDescription>
                Upload a CSV file with columns: company_name, website
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUploadClassifier />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Classifier;
