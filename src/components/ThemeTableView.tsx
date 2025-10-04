import { ThemeWithScores } from "@/types/themes";
import { DataTable, DataTableColumn } from "@/components/ui/basic-data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Minus, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface ThemeTableViewProps {
  themes: ThemeWithScores[];
  onEditTheme: (theme: ThemeWithScores) => void;
}

export function ThemeTableView({ themes, onEditTheme }: ThemeTableViewProps) {
  const navigate = useNavigate();

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-score-high";
    if (score >= 40) return "text-score-medium";
    return "text-score-low";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 70) return <TrendingUp className="h-4 w-4 text-score-high" />;
    if (score >= 40) return <Minus className="h-4 w-4 text-score-medium" />;
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

  const columns: DataTableColumn<ThemeWithScores>[] = [
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
      header: 'Strategic Pillar',
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
                {Math.round(score)}
              </div>
              <div className="text-data-secondary text-xs">/ 100</div>
            </div>
            <div className="flex flex-col items-end gap-1">
              {getScoreIcon(score)}
              <Progress 
                value={score} 
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
      ),
    },
  ];

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
    />
  );
}
