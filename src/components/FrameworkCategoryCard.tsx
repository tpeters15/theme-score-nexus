import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { InlineScoreEditor } from "@/components/InlineScoreEditor";
import { FrameworkCategoryWithCriteria, DetailedScoreWithCriteria } from "@/types/framework";

interface FrameworkCategoryCardProps {
  category: FrameworkCategoryWithCriteria;
  scores: DetailedScoreWithCriteria[];
  themeId: string;
  onScoreUpdate: () => void;
}

export function FrameworkCategoryCard({ 
  category, 
  scores, 
  themeId, 
  onScoreUpdate 
}: FrameworkCategoryCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Check if this category should be scored (only A, B, C are scored)
  const isScoringCategory = ['A', 'B', 'C'].includes(category.code);

  const categoryScores = scores.filter(s => 
    category.criteria.some(c => c.id === s.criteria_id)
  );

  const avgScore = categoryScores.length > 0 
    ? categoryScores.reduce((sum, s) => sum + (s.score || 0), 0) / categoryScores.length 
    : 0;

  const scoredCriteria = categoryScores.filter(s => s.score !== null).length;
  const totalCriteria = category.criteria.length;

  const getScoreColor = (score: number) => {
    if (score >= 4) return "text-green-600";
    if (score >= 3) return "text-yellow-600";
    return "text-red-600";
  };

  const getConfidenceColor = (confidence: string | null) => {
    if (confidence === 'High') return "bg-green-100 text-green-800";
    if (confidence === 'Medium') return "bg-yellow-100 text-yellow-800";
    if (confidence === 'Low') return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-800";
  };

  // Calculate overall confidence for the category
  const confidenceLevels = categoryScores
    .filter(s => s.confidence)
    .map(s => s.confidence === 'High' ? 3 : s.confidence === 'Medium' ? 2 : 1);
  
  const avgConfidence = confidenceLevels.length > 0 
    ? confidenceLevels.reduce((sum, level) => sum + level, 0) / confidenceLevels.length
    : 0;
  
  const categoryConfidence = avgConfidence >= 2.5 ? 'High' : avgConfidence >= 1.5 ? 'Medium' : 'Low';

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="overflow-hidden">
        <CollapsibleTrigger asChild>
          <CardHeader className="bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" className="p-0 h-auto">
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">
                      {category.code}: {category.name}
                    </CardTitle>
                    {!isScoringCategory && (
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                        Qualitative Only
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {category.description}
                  </p>
                </div>
              </div>
               <div className="text-right space-y-2">
                 {isScoringCategory ? (
                   <>
                     <div className="flex items-center gap-2">
                       <div className="text-2xl font-bold">
                         <span className={getScoreColor(avgScore)}>
                           {avgScore > 0 ? avgScore.toFixed(1) : '--'}
                         </span>
                         <span className="text-sm text-muted-foreground">/5</span>
                       </div>
                       <Badge 
                         variant="outline" 
                         className={getConfidenceColor(scoredCriteria > 0 ? categoryConfidence : null)}
                       >
                         {scoredCriteria > 0 ? categoryConfidence : 'No Data'}
                       </Badge>
                     </div>
                     <p className="text-xs text-muted-foreground">
                       {scoredCriteria}/{totalCriteria} criteria scored
                     </p>
                   </>
                 ) : (
                   <div className="text-center">
                     <div className="text-lg font-medium text-muted-foreground">
                       Qualitative Assessment
                     </div>
                     <p className="text-xs text-muted-foreground">
                       No scoring - analysis only
                     </p>
                   </div>
                 )}
               </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {category.criteria.map((criteria) => {
                const score = scores.find(s => s.criteria_id === criteria.id);
                return (
                  <div key={criteria.id} className="p-4 bg-muted/20 rounded-lg space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {criteria.code}
                          </Badge>
                          <h4 className="font-medium text-sm">{criteria.name}</h4>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {criteria.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          <strong>Objective:</strong> {criteria.objective}
                        </p>
                      </div>
                    </div>
                     {isScoringCategory ? (
                       <InlineScoreEditor
                         themeId={themeId}
                         criteriaId={criteria.id}
                         currentScore={score?.score}
                         currentConfidence={score?.confidence}
                         currentNotes={score?.notes}
                         onScoreUpdate={onScoreUpdate}
                       />
                     ) : (
                       <div className="p-3 bg-blue-50 rounded border border-blue-200">
                         <p className="text-sm text-blue-800 font-medium">Qualitative Assessment</p>
                         <p className="text-xs text-blue-600 mt-1">
                           This criterion is for qualitative analysis only and does not contribute to the numerical score.
                         </p>
                         {score?.notes && (
                           <div className="mt-2 pt-2 border-t border-blue-200">
                             <p className="text-xs font-medium text-blue-800">Notes:</p>
                             <p className="text-xs text-blue-700 mt-1">{score.notes}</p>
                           </div>
                         )}
                       </div>
                     )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}