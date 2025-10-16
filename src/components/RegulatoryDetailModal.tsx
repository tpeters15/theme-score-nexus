import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ExternalLink, 
  Clock, 
  Building2, 
  Scale,
  Hash,
  Globe,
  FileText,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Regulation } from "@/types/regulatory";

interface RegulatoryDetailModalProps {
  regulation: (Regulation & { connected_themes?: any[] }) | null;
  isOpen: boolean;
  onClose: () => void;
}

export function RegulatoryDetailModal({ regulation, isOpen, onClose }: RegulatoryDetailModalProps) {
  if (!regulation) return null;

  const getJurisdictionColor = (jurisdiction: string) => {
    switch (jurisdiction) {
      case 'EU': return "bg-blue-100 text-blue-800 border-blue-200";
      case 'UK': return "bg-purple-100 text-purple-800 border-purple-200";
      case 'US': return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return "bg-green-100 text-green-800 border-green-200";
      case 'pending': return "bg-amber-100 text-amber-800 border-amber-200";
      case 'expired': return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return "bg-red-100 text-red-800 border-red-200";
      case 'medium': return "bg-amber-100 text-amber-800 border-amber-200";
      case 'low': return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilDeadline = regulation.compliance_deadline ? getDaysUntilDeadline(regulation.compliance_deadline) : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl pr-6">{regulation.title}</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-6">
            {/* Status and Classification Section */}
            <div className="space-y-4">
              <div className="flex items-center flex-wrap gap-2">
                <Badge 
                  variant="outline" 
                  className={cn("text-xs", getJurisdictionColor(regulation.jurisdiction))}
                >
                  <Globe className="h-3 w-3 mr-1" />
                  {regulation.jurisdiction}
                </Badge>
                <Badge 
                  variant="outline" 
                  className={cn("text-xs", getStatusColor(regulation.status))}
                >
                  {regulation.status === 'active' ? <CheckCircle className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
                  {regulation.status.charAt(0).toUpperCase() + regulation.status.slice(1)}
                </Badge>
                <Badge 
                  variant="outline" 
                  className={cn("text-xs", getImpactColor(regulation.impact_level))}
                >
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {regulation.impact_level.charAt(0).toUpperCase() + regulation.impact_level.slice(1)} Impact
                </Badge>
                <Badge variant="secondary" className="text-xs capitalize">
                  <Scale className="h-3 w-3 mr-1" />
                  {regulation.regulation_type}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Regulatory Body:</span>
                  <span>{regulation.regulatory_body || 'Not specified'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">ID:</span>
                  <code className="text-xs bg-muted px-1 py-0.5 rounded">{regulation.id.split('-')[0]}</code>
                </div>
                {regulation.effective_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Effective Date:</span>
                    <span>{format(new Date(regulation.effective_date), 'MMM dd, yyyy')}</span>
                  </div>
                )}
                {regulation.compliance_deadline && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Compliance Deadline:</span>
                    <span className={daysUntilDeadline !== null && daysUntilDeadline < 90 ? "text-orange-600 font-medium" : ""}>
                      {format(new Date(regulation.compliance_deadline), 'MMM dd, yyyy')}
                      {daysUntilDeadline !== null && (
                        <span className="text-xs text-muted-foreground ml-1">
                          ({daysUntilDeadline > 0 ? `${daysUntilDeadline} days left` : `${Math.abs(daysUntilDeadline)} days ago`})
                        </span>
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Connected Themes Section */}
            {regulation.connected_themes && regulation.connected_themes.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Shield className="h-5 w-5" /> Connected Investment Themes
                </h3>
                <div className="flex items-center flex-wrap gap-2">
                  {regulation.connected_themes.map((theme: any) => (
                    <Badge 
                      key={theme.id} 
                      variant="outline" 
                      className="text-xs px-3 py-1 bg-primary/10 text-primary border-primary/20"
                    >
                      {theme.name}
                      {theme.pillar && (
                        <span className="text-xs text-muted-foreground ml-1">({theme.pillar})</span>
                      )}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Description Section */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Description</h3>
              <div className="prose prose-sm max-w-none">
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {regulation.description || regulation.impact_description || 'No description available.'}
                </p>
              </div>
            </div>

            {/* Key Provisions Section */}
            {regulation.key_provisions && regulation.key_provisions.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Key Provisions</h3>
                <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                  {regulation.key_provisions.map((provision, index) => (
                    <li key={index} className="leading-relaxed">{provision}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Impact Assessment */}
            {(regulation as any).criteria_impacts && (regulation as any).criteria_impacts.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Impact Assessment</h3>
                <div className="flex items-center flex-wrap gap-2">
                  {(regulation as any).criteria_impacts.map((impact: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {impact.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
                {(regulation as any).relevance_score && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Relevance Score: </span>
                    <span className="font-medium">{(regulation as any).relevance_score}/5</span>
                  </div>
                )}
              </div>
            )}

            {/* External Links */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">External Resources</h3>
              <div className="flex items-center gap-3 flex-wrap">
                {regulation.source_url && (
                  <Button asChild variant="outline" size="sm">
                    <a 
                      href={regulation.source_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      View Source
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                )}
                {regulation.analysis_url && (
                  <Button asChild variant="outline" size="sm">
                    <a 
                      href={regulation.analysis_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <Globe className="h-4 w-4" />
                      View Analysis
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}