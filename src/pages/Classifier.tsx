import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SingleCompanyClassifier } from "@/components/classifier/SingleCompanyClassifier";
import { ManualBatchClassifier } from "@/components/classifier/ManualBatchClassifier";
import { FileUploadClassifier } from "@/components/classifier/FileUploadClassifier";
import { BatchClassificationResults } from "@/components/classifier/BatchClassificationResults";

export default function Classifier() {
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Company Classifier</h1>
        <p className="text-muted-foreground">
          Classify companies into climate-tech taxonomy themes using AI-powered analysis
        </p>
      </div>

      <Tabs defaultValue="single" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="single">Single Company</TabsTrigger>
          <TabsTrigger value="batch">Manual Batch</TabsTrigger>
          <TabsTrigger value="upload">CSV Upload</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        <TabsContent value="single">
          <SingleCompanyClassifier />
        </TabsContent>

        <TabsContent value="batch">
          <ManualBatchClassifier />
        </TabsContent>

        <TabsContent value="upload">
          <FileUploadClassifier />
        </TabsContent>

        <TabsContent value="results">
          <BatchClassificationResults />
        </TabsContent>
      </Tabs>
    </div>
  );
}
