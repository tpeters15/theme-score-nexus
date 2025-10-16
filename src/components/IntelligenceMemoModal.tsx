import { useState } from "react";
import { FileText, Sparkles, Calendar, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface IntelligenceMemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function IntelligenceMemoModal({ isOpen, onClose }: IntelligenceMemoModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPdf, setShowPdf] = useState(false);
  const [dateRange, setDateRange] = useState("week");
  const [signalTypes, setSignalTypes] = useState("all");
  const [includeRegulatory, setIncludeRegulatory] = useState("yes");

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    // Simulate 4 second generation
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    setIsGenerating(false);
    setShowPdf(true);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '/demo/Signal_Intelligence_Memo.pdf';
    link.download = 'Signal_Intelligence_Memo.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClose = () => {
    setShowPdf(false);
    setIsGenerating(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        {!showPdf ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Generate Intelligence Memo
              </DialogTitle>
              <DialogDescription>
                Configure your weekly intelligence report settings
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Configuration Options */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="date-range" className="text-sm font-medium">
                    Date Range
                  </Label>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger id="date-range">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">This Week (Oct 9-16)</SelectItem>
                      <SelectItem value="last-week">Last Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signal-types" className="text-sm font-medium">
                    Signal Types to Include
                  </Label>
                  <Select value={signalTypes} onValueChange={setSignalTypes}>
                    <SelectTrigger id="signal-types">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Signal Types</SelectItem>
                      <SelectItem value="deals">Deals & Funding Only</SelectItem>
                      <SelectItem value="market">Market Intelligence Only</SelectItem>
                      <SelectItem value="regulatory">Regulatory Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="regulatory" className="text-sm font-medium">
                    Include Regulatory Analysis
                  </Label>
                  <Select value={includeRegulatory} onValueChange={setIncludeRegulatory}>
                    <SelectTrigger id="regulatory">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes - Full Analysis</SelectItem>
                      <SelectItem value="summary">Summary Only</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                    Generating Intelligence Memo...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Memo
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Signal Intelligence Memo
                  </DialogTitle>
                  <DialogDescription className="flex items-center gap-2 mt-1">
                    <Calendar className="h-3 w-3" />
                    Week of October 9-16, 2025
                  </DialogDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </DialogHeader>

            <div className="flex-1 min-h-0">
              <iframe
                src="/demo/Signal_Intelligence_Memo.pdf"
                className="w-full h-[600px] border rounded-lg"
                title="Intelligence Memo"
              />
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
