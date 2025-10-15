import { useState, useCallback } from "react";
import { Upload, FileText, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ThemeFileUploadProps {
  themeId: string;
  onUploadComplete: () => void;
}

interface UploadFile {
  file: File;
  title: string;
  description: string;
  documentType: string;
  criteriaId?: string;
}

const DOCUMENT_TYPES = [
  { value: "market_report", label: "Market Report" },
  { value: "research_paper", label: "Research Paper" },
  { value: "analysis", label: "Analysis" },
  { value: "regulatory_document", label: "Regulatory Document" },
  { value: "earnings_report", label: "Earnings Report" },
  { value: "news_article", label: "News Article" },
  { value: "other", label: "Other" },
];

export function ThemeFileUpload({ themeId, onUploadComplete }: ThemeFileUploadProps) {
  const { toast } = useToast();
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      addFiles(selectedFiles);
    }
  }, []);

  const addFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(file => {
      // Validate file type (documents only)
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain',
        'text/csv'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported document type`,
          variant: "destructive",
        });
        return false;
      }

      // Validate file size (max 20MB)
      if (file.size > 20 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds the 20MB limit`,
          variant: "destructive",
        });
        return false;
      }

      return true;
    });

    const uploadFiles: UploadFile[] = validFiles.map(file => ({
      file,
      title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
      description: "",
      documentType: "other",
    }));

    setFiles(prev => [...prev, ...uploadFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const updateFile = (index: number, updates: Partial<UploadFile>) => {
    setFiles(prev => prev.map((file, i) => 
      i === index ? { ...file, ...updates } : file
    ));
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setUploading(true);
    let successCount = 0;

    try {
      for (const uploadFile of files) {
        const { file, title, description, documentType, criteriaId } = uploadFile;
        
        // Generate unique file path
        const fileExt = file.name.split('.').pop();
        const fileName = `${themeId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

        // Upload file to storage
        const { data: storageData, error: storageError } = await supabase.storage
          .from('research-documents')
          .upload(fileName, file, {
            contentType: file.type,
            upsert: false
          });

        if (storageError) {
          console.error("Storage upload error:", storageError);
          toast({
            title: "Upload failed",
            description: `Failed to upload ${file.name}: ${storageError.message}`,
            variant: "destructive",
          });
          continue;
        }

        // Create database record
        const { error: dbError } = await supabase
          .from('research_documents')
          .insert({
            theme_id: themeId,
            criteria_id: criteriaId || null,
            title,
            description: description || null,
            document_type: documentType,
            file_path: storageData.path,
            file_size: file.size,
            mime_type: file.type,
          });

        if (dbError) {
          console.error("Database insert error:", dbError);
          toast({
            title: "Upload failed",
            description: `Failed to save ${file.name} metadata: ${dbError.message}`,
            variant: "destructive",
          });
          
          // Clean up uploaded file
          await supabase.storage
            .from('research-documents')
            .remove([storageData.path]);
          continue;
        }

        successCount++;
      }

      if (successCount > 0) {
        toast({
          title: "Upload successful",
          description: `Successfully uploaded ${successCount} file(s)`,
        });
        setFiles([]);
        onUploadComplete();
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "An unexpected error occurred during upload",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Compact Upload Zone */}
      <div
        className={`border border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer hover:border-primary/50 ${
          dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm font-medium mb-1">Drop files or click to browse</p>
        <p className="text-xs text-muted-foreground">
          PDF, Word, Excel, PowerPoint up to 20MB
        </p>
        <Input
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
          data-upload-trigger
        />
        <Button asChild variant="outline" size="sm" className="mt-2">
          <label htmlFor="file-upload" className="cursor-pointer">
            Select Files
          </label>
        </Button>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Files to Upload ({files.length})</span>
            <Button variant="ghost" size="sm" onClick={() => setFiles([])}>
              Clear All
            </Button>
          </div>
          
          {files.map((uploadFile, index) => (
            <Card key={index} className="p-3">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{uploadFile.file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(uploadFile.file.size)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <Input
                    value={uploadFile.title}
                    onChange={(e) => updateFile(index, { title: e.target.value })}
                    placeholder="Document title"
                    className="text-sm"
                  />
                  <Select
                    value={uploadFile.documentType}
                    onValueChange={(value) => updateFile(index, { documentType: value })}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DOCUMENT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Textarea
                  value={uploadFile.description}
                  onChange={(e) => updateFile(index, { description: e.target.value })}
                  placeholder="Brief description (optional)"
                  rows={2}
                  className="text-sm"
                />
              </div>
            </Card>
          ))}
          
          <Button onClick={uploadFiles} disabled={uploading} className="w-full">
            {uploading ? "Uploading..." : `Upload ${files.length} File(s)`}
          </Button>
        </div>
      )}
    </div>
  );
}