import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ExternalLink, 
  Clock, 
  Building2, 
  User, 
  Hash,
  Globe,
  FileText,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { Signal } from "@/hooks/useSignals";
import { supabase } from "@/integrations/supabase/client";

interface SignalDetailModalProps {
  signal: Signal | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SignalDetailModal({ signal, isOpen, onClose }: SignalDetailModalProps) {
  if (!signal) return null;

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'PitchBook Alert': return "bg-orange-100 text-orange-800 border-orange-200";
      case 'Bloomberg Green': return "bg-blue-100 text-blue-800 border-blue-200";
      case 'Carbon Brief Daily': return "bg-green-100 text-green-800 border-green-200";
      case 'Financial Times': return "bg-pink-100 text-pink-800 border-pink-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'email_alert': return "bg-purple-100 text-purple-800 border-purple-200";
      case 'rss': return "bg-cyan-100 text-cyan-800 border-cyan-200";
      case 'html': return "bg-amber-100 text-amber-800 border-amber-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl pr-6">{signal.title}</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-6">
            {/* Metadata Section */}
            <div className="space-y-4">
              <div className="flex items-center flex-wrap gap-2">
                <Badge 
                  variant="outline" 
                  className={cn("text-xs", getSourceColor(signal.source))}
                >
                  <Building2 className="h-3 w-3 mr-1" />
                  {signal.source}
                </Badge>
                <Badge 
                  variant="outline" 
                  className={cn("text-xs", getTypeColor(signal.type))}
                >
                  <FileText className="h-3 w-3 mr-1" />
                  {signal.type.replace('_', ' ')}
                </Badge>
                {signal.author && (
                  <Badge variant="secondary" className="text-xs">
                    <User className="h-3 w-3 mr-1" />
                    {signal.author}
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Created:</span>
                  <span>{format(new Date(signal.created_at), 'MMM dd, yyyy HH:mm')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Signal ID:</span>
                  <code className="text-xs bg-muted px-1 py-0.5 rounded">{signal.signal_id}</code>
                </div>
                {signal.internal_id && (
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Internal ID:</span>
                    <code className="text-xs bg-muted px-1 py-0.5 rounded">{signal.internal_id}</code>
                  </div>
                )}
                {signal.topic_id && (
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Topic ID:</span>
                    <code className="text-xs bg-muted px-1 py-0.5 rounded">{signal.topic_id}</code>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Description Section */}
            {signal.description && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Description</h3>
                <div className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {signal.description}
                  </p>
                </div>
              </div>
            )}

            {/* Original Source Link */}
            {signal.url && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Source</h3>
                <Button asChild variant="outline" className="w-fit">
                  <a 
                    href={signal.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <Globe className="h-4 w-4" />
                    View Original Source
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            )}

            {/* Timestamps */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Timeline</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Created:</span>
                  <span>{format(new Date(signal.created_at), 'EEEE, MMMM dd, yyyy \'at\' HH:mm')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Last Updated:</span>
                  <span>{format(new Date(signal.updated_at), 'EEEE, MMMM dd, yyyy \'at\' HH:mm')}</span>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}