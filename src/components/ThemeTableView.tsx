import { useState } from "react";
import { ThemeWithScores } from "@/types/themes";
import { DataTable, DataTableColumn } from "@/components/ui/basic-data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Minus, Edit, ChevronDown, ChevronRight, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface ThemeTableViewProps {
  themes: ThemeWithScores[];
  onEditTheme: (theme: ThemeWithScores) => void;
}

export function ThemeTableView({ themes, onEditTheme }: ThemeTableViewProps) {
  const navigate = useNavigate();
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const getScoreColor = (score: number) => {
    if (score >= 3.5) return "text-score-high";
    if (score >= 2.5) return "text-score-medium";
    return "text-score-low";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 3.5) return <TrendingUp className="h-4 w-4 text-score-high" />;
    if (score >= 2.5) return <Minus className="h-4 w-4 text-score-medium" />;
    return <TrendingDown className="h-4 w-4 text-score-low" />;
  };

  const getPillarColor = (pillar: string) => {
    switch (pillar) {
      case 'Decarbonisation':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Energy Transition':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Resource Sustainability':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'High':
        return 'bg-score-high/10 text-score-high border-score-high/20';
      case 'Medium':
        return 'bg-score-medium/10 text-score-medium border-score-medium/20';
      case 'Low':
        return 'bg-score-low/10 text-score-low border-score-low/20';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const toggleExpand = (themeId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(themeId)) {
        newSet.delete(themeId);
      } else {
        newSet.add(themeId);
      }
      return newSet;
    });
  };

  const columns: DataTableColumn<ThemeWithScores>[] = [
    {
      key: 'id',
      header: '',
      width: '40px',
      render: (value, theme) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            toggleExpand(theme.id);
          }}
          className="h-7 w-7 p-0"
        >
          {expandedRows.has(theme.id) ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      ),
    },
    {
      key: 'name',
      header: 'Investment Theme',
      sortable: true,
      filterable: true,
      width: '350px',
      render: (value, theme) => (
        <div className="space-y-1">
          <div className="text-data-primary font-medium">{theme.name}</div>
          <div className="text-data-secondary truncate max-w-md text-xs">
            {theme.description || "No description available"}
          </div>
        </div>
      ),
    },
    {
      key: 'pillar',
      header: 'Pillar',
      sortable: true,
      filterable: true,
      width: '180px',
      render: (value) => (
        <Badge variant="outline" className={`${getPillarColor(value as string)} text-xs font-medium`}>
          {value}
        </Badge>
      ),
    },
    {
      key: 'sector',
      header: 'Sector',
      sortable: true,
      filterable: true,
      width: '200px',
      render: (value) => (
        <span className="text-data-secondary font-medium text-sm">{value}</span>
      ),
    },
    {
      key: 'weighted_total_score',
      header: 'Investment Score',
      sortable: true,
      width: '200px',
      render: (value, theme) => {
        const score = theme.weighted_total_score;
        return (
          <div className="flex items-center justify-end gap-3">
            <div className="text-right">
              <div className={`text-metric ${getScoreColor(score)}`}>
                {score.toFixed(2)}
              </div>
              <div className="text-data-secondary text-xs">/ 5</div>
            </div>
            <div className="flex flex-col items-end gap-1">
              {getScoreIcon(score)}
              <Progress 
                value={(score / 5) * 100} 
                className="h-1.5 w-12"
              />
            </div>
          </div>
        );
      },
    },
    {
      key: 'overall_confidence',
      header: 'Confidence',
      sortable: true,
      filterable: true,
      width: '140px',
      render: (value, theme) => (
        <Badge variant="outline" className={`${getConfidenceColor(theme.overall_confidence)} text-xs`}>
          {theme.overall_confidence}
        </Badge>
      ),
    },
    {
      key: 'id',
      header: '',
      width: '80px',
      render: (value, theme) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEditTheme(theme);
            }}
            className="h-7 w-7 p-0"
          >
            <Edit className="h-3.5 w-3.5" />
          </Button>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      ),
    },
  ];

  const renderExpandedRow = (theme: ThemeWithScores) => {
    if (!expandedRows.has(theme.id)) return null;

    return (
      <div className="bg-muted/30 border-t border-border p-6">
        <div className="grid grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2">Description</h4>
              <p className="text-sm text-muted-foreground">
                {theme.description || "No description available"}
              </p>
            </div>
            
            {theme.in_scope && theme.in_scope.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">In Scope</h4>
                <div className="flex flex-wrap gap-2">
                  {theme.in_scope.map((item, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {theme.out_of_scope && theme.out_of_scope.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">Out of Scope</h4>
                <div className="flex flex-wrap gap-2">
                  {theme.out_of_scope.map((item, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Framework Scores</h4>
              <div className="space-y-2">
                {theme.scores.slice(0, 5).map((score) => (
                  <div key={score.id} className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{score.attribute.name}</span>
                    <div className="flex items-center gap-2">
                      <Progress value={score.score} className="h-1.5 w-24" />
                      <span className={cn("text-xs font-medium", getScoreColor(score.score))}>
                        {score.score}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {theme.keywords && theme.keywords.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">Keywords</h4>
                <div className="flex flex-wrap gap-1.5">
                  {theme.keywords.map((keyword, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/theme/${theme.id}`)}
                className="text-xs"
              >
                View Full Profile →
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <DataTable
      data={themes}
      columns={columns}
      searchable={false}
      itemsPerPage={15}
      showPagination={true}
      hoverable={true}
      bordered={true}
      emptyMessage="No themes found"
      onRowClick={(theme) => navigate(`/theme/${theme.id}`)}
      className="surface-elevated"
      expandedRowRender={renderExpandedRow}
      defaultSortColumn="weighted_total_score"
      defaultSortDirection="desc"
    />
  );
}
