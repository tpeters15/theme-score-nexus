import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function ImportProcessedSignalsCSV() {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const { data, error } = await supabase.functions.invoke('import-processed-signals-csv', {
        body: formData,
      });

      if (error) throw error;

      toast.success(
        `Import complete: ${data.successCount} succeeded, ${data.errorCount} failed`,
        {
          description: data.errors?.length > 0 ? `First error: ${data.errors[0]}` : undefined,
        }
      );

      // Refresh the page to show new data
      window.location.reload();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to import CSV', {
        description: error.message,
      });
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  return (
    <div>
      <input
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        className="hidden"
        id="processed-csv-upload"
      />
      <Button
        onClick={() => document.getElementById('processed-csv-upload')?.click()}
        disabled={isUploading}
      >
        <Upload className="mr-2 h-4 w-4" />
        {isUploading ? 'Importing...' : 'Import Processed Signals CSV'}
      </Button>
    </div>
  );
}
