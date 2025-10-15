import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function UploadResearchDocumentButton() {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    setUploading(true);
    try {
      const { data, error } = await supabase.functions.invoke('upload-research-document', {
        body: {
          sourceUrl: window.location.origin + '/research-documents/Industrial_Commercial_Energy_Efficiency_Full_Report.pdf',
          destinationPath: 'Industrial_Commercial_Energy_Efficiency_Full_Report.pdf',
          documentId: '9af0f645-c04c-4a76-8c96-840b12366a61'
        }
      });

      if (error) throw error;

      toast({
        title: "Upload successful",
        description: `File uploaded to storage (${(data.size / 1024 / 1024).toFixed(2)} MB)`,
      });

      // Refresh the page to show the document
      window.location.reload();
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Could not upload the document",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Button onClick={handleUpload} disabled={uploading} variant="outline" size="sm">
      <Upload className="h-4 w-4 mr-2" />
      {uploading ? 'Uploading...' : 'Upload PDF to Storage'}
    </Button>
  );
}
