import { useState } from "react";
import { FileText, Download, Search, ZoomIn, ZoomOut, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ResearchDocument } from "@/types/framework";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DocumentViewerProps {
  document: ResearchDocument;
  isOpen: boolean;
  onClose: () => void;
}

export function DocumentViewer({ document, isOpen, onClose }: DocumentViewerProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [zoom, setZoom] = useState(100);
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    if (!document.file_path) {
      toast({
        title: "Download failed",
        description: "No file path available for this document",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    try {
      const { data, error } = await supabase.storage
        .from('research-documents')
        .download(document.file_path);

      if (error) {
        if (error.message.includes('not found') || error.message.includes('does not exist')) {
          toast({
            title: "File not found",
            description: "This file no longer exists in storage",
            variant: "destructive",
          });
          return;
        }
        throw error;
      }

      const url = URL.createObjectURL(data);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document.title;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Download started",
        description: `${document.title} is being downloaded`,
      });
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Download failed",
        description: "Could not download the file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getDocumentUrl = () => {
    if (!document.file_path) return null;
    
    const { data } = supabase.storage
      .from('research-documents')
      .getPublicUrl(document.file_path);
    
    return data.publicUrl;
  };

  const documentUrl = getDocumentUrl();
  const isPdf = document.mime_type === 'application/pdf';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold mb-2">
                {document.title}
              </DialogTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{document.document_type}</Badge>
                {document.file_size && (
                  <span className="text-sm text-muted-foreground">
                    {(document.file_size / 1024 / 1024).toFixed(1)} MB
                  </span>
                )}
                <span className="text-sm text-muted-foreground">
                  {new Date(document.created_at).toLocaleDateString()}
                </span>
              </div>
              {document.description && (
                <p className="text-sm text-muted-foreground mt-2">
                  {document.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 ml-4">
              {isPdf && (
                <>
                  <div className="flex items-center gap-1 border rounded-md">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setZoom(Math.max(50, zoom - 25))}
                      className="p-1 h-8 w-8"
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <span className="text-xs px-2 min-w-[3rem] text-center">
                      {zoom}%
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setZoom(Math.min(200, zoom + 25))}
                      className="p-1 h-8 w-8"
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search document..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 w-40"
                    />
                  </div>
                </>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                disabled={loading}
              >
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 p-6 pt-4">
          {documentUrl ? (
            isPdf ? (
              <div className="h-[70vh] border rounded-lg overflow-hidden">
                <iframe
                  src={`${documentUrl}#zoom=${zoom}&search=${encodeURIComponent(searchTerm)}`}
                  className="w-full h-full border-0"
                  title={document.title}
                />
              </div>
            ) : (
              <div className="h-[70vh] border rounded-lg overflow-hidden flex items-center justify-center bg-muted/20">
                <div className="text-center space-y-4">
                  <FileText className="h-16 w-16 mx-auto text-muted-foreground" />
                  <div>
                    <h3 className="font-medium">Preview not available</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      This file type cannot be previewed in the browser
                    </p>
                    <Button onClick={handleDownload} className="mt-3" disabled={loading}>
                      <Download className="h-4 w-4 mr-2" />
                      Download to view
                    </Button>
                  </div>
                </div>
              </div>
            )
          ) : (
            <div className="h-[70vh] border rounded-lg flex items-center justify-center bg-muted/20">
              <div className="text-center">
                <FileText className="h-16 w-16 mx-auto text-muted-foreground" />
                <h3 className="font-medium mt-4">Document not found</h3>
                <p className="text-sm text-muted-foreground">
                  The document file could not be loaded
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}