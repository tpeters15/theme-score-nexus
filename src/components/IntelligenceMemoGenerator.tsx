import { useState } from "react";
import { FileText, Download, Sparkles, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export function IntelligenceMemoGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    // Simulate AI generation process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsGenerating(false);
    toast.success("Intelligence memo generated successfully!");
  };

  const handleDownloadDemo = () => {
    const link = document.createElement('a');
    link.href = '/demo/Signal_Intelligence_Memo.pdf';
    link.download = 'Signal_Intelligence_Memo_Demo.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Demo memo downloaded!");
  };

  const handleViewDemo = () => {
    window.open('/demo/Signal_Intelligence_Memo.pdf', '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Card className="cursor-pointer hover:shadow-lg transition-all border-2 border-primary/20 bg-gradient-to-br from-background to-primary/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg">AI Intelligence Memo</CardTitle>
              </div>
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
            <CardDescription className="text-xs">
              Generate executive-ready weekly intelligence reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Latest: Oct 9-16, 2025</span>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Weekly Intelligence Memo Generator
          </DialogTitle>
          <DialogDescription>
            AI-powered executive summaries of market signals, deals, and regulatory updates
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Demo Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-primary" />
              <h3 className="font-semibold text-sm">Latest Demo Memo Available</h3>
            </div>
            
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Signal Intelligence Memo</CardTitle>
                <CardDescription className="text-xs">
                  Week of October 9-16, 2025
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  <p className="mb-2 font-medium text-foreground">Highlights:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• 6 significant deals & exits analyzed</li>
                    <li>• 5 major regulatory updates tracked</li>
                    <li>• Market intelligence across key themes</li>
                    <li>• Strategic investment recommendations</li>
                  </ul>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleViewDemo}
                    className="flex-1"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    View Demo
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleDownloadDemo}
                    className="flex-1"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Generate New Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-primary" />
              <h3 className="font-semibold text-sm">Generate New Memo</h3>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    <p className="mb-3">The AI will analyze:</p>
                    <ul className="space-y-1 text-xs">
                      <li>✓ Recent market signals and trends</li>
                      <li>✓ Deal flow and exit activity</li>
                      <li>✓ Regulatory developments</li>
                      <li>✓ Theme-level insights</li>
                    </ul>
                  </div>

                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="w-full"
                  >
                    {isGenerating ? (
                      <>
                        <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                        Generating Intelligence Memo...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate This Week's Memo
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
