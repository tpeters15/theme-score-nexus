import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Signal, 
  ExternalLink, 
  Search, 
  Filter, 
  Clock,
  Globe,
  Building2,
  Eye
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useSignals, type Signal as SignalType } from "@/hooks/useSignals";
import { SignalDetailModal } from "@/components/SignalDetailModal";
import { SignalFilterDemo } from "@/components/ui/signal-filter-demo";

export default function Signals() {
  const { data: signals, isLoading: loading, error } = useSignals();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSignal, setSelectedSignal] = useState<SignalType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState<any[]>([]);

  const handleSignalClick = (signal: SignalType) => {
    setSelectedSignal(signal);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSignal(null);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6 pt-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Signal Intelligence</h1>
            <p className="text-muted-foreground">Real-time market signals and intelligence feeds</p>
          </div>
        </div>
        
        <div className="grid gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-6 pt-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Failed to load signals. Please try again later.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get unique sources and types for filters
  const sources = [...new Set(signals?.map(s => s.source) || [])];
  const types = [...new Set(signals?.map(s => s.type) || [])];

  // Filter signals based on search and filters
  const filteredSignals = signals?.filter(signal => {
    const matchesSearch = !searchQuery || 
      signal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      signal.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      signal.source.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Apply active filters
    const matchesFilters = filters.length === 0 || filters.every(filter => {
      if (!filter.value || filter.value.length === 0) return true;
      
      switch (filter.type) {
        case 'Source':
          return filter.value.some((val: string) => 
            signal.source.toLowerCase().includes(val.toLowerCase())
          );
        case 'Type':
          return filter.value.some((val: string) => 
            signal.type.toLowerCase().includes(val.toLowerCase())
          );
        case 'Author':
          return filter.value.some((val: string) => 
            signal.author?.toLowerCase().includes(val.toLowerCase())
          );
        default:
          return true;
      }
    });
    
    return matchesSearch && matchesFilters;
  }) || [];

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
    <div className="container mx-auto px-6 pt-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Signal className="h-8 w-8 text-primary" />
            </div>
            Signal Intelligence
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time market signals and intelligence feeds from {sources.length} sources
          </p>
        </div>
        <div className="text-right text-sm text-muted-foreground">
          <div>{filteredSignals.length} signals</div>
          <div>Last updated: {signals?.[0] ? format(new Date(signals[0].created_at), 'MMM dd, HH:mm') : '-'}</div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search signals by title, description, or source..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <SignalFilterDemo filters={filters} onFiltersChange={setFilters} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Signals List */}
      <div className="space-y-4">
        {filteredSignals.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <Signal className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No signals match your current filters</p>
            </CardContent>
          </Card>
        ) : (
          filteredSignals.map((signal) => (
            <Card 
              key={signal.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleSignalClick(signal)}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg leading-tight">{signal.title}</h3>
                      <div className="flex items-center gap-1 ml-auto">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-auto p-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSignalClick(signal);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {signal.url && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-auto p-1" 
                            asChild
                            onClick={(e) => e.stopPropagation()}
                          >
                            <a href={signal.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {signal.description && (
                      <p className="text-muted-foreground text-sm leading-relaxed mb-3 line-clamp-2">
                        {signal.description}
                      </p>
                    )}

                    <div className="flex items-center flex-wrap gap-2 mb-3">
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
                        {signal.type.replace('_', ' ')}
                      </Badge>
                      {signal.author && (
                        <Badge variant="secondary" className="text-xs">
                          {signal.author}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{format(new Date(signal.created_at), 'MMM dd, yyyy HH:mm')}</span>
                      </div>
                      <span>•</span>
                      <span>ID: {signal.signal_id}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <SignalDetailModal 
        signal={selectedSignal}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}