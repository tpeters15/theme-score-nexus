import { useState } from "react";
import { ThemeWithScores } from "@/types/themes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUpDown, TrendingUp, TrendingDown, Minus, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ThemeTableViewProps {
  themes: ThemeWithScores[];
  onEditTheme: (theme: ThemeWithScores) => void;
}

type SortField = 'name' | 'pillar' | 'sector' | 'score' | 'confidence';
type SortDirection = 'asc' | 'desc';

export function ThemeTableView({ themes, onEditTheme }: ThemeTableViewProps) {
  const navigate = useNavigate();
  const [sortField, setSortField] = useState<SortField>('score');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedThemes = [...themes].sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;

    switch (sortField) {
      case 'name':
        aValue = a.name;
        bValue = b.name;
        break;
      case 'pillar':
        aValue = a.pillar;
        bValue = b.pillar;
        break;
      case 'sector':
        aValue = a.sector;
        bValue = b.sector;
        break;
      case 'score':
        aValue = a.weighted_total_score;
        bValue = b.weighted_total_score;
        break;
      case 'confidence':
        aValue = a.overall_confidence;
        bValue = b.overall_confidence;
        break;
      default:
        aValue = a.weighted_total_score;
        bValue = b.weighted_total_score;
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    return sortDirection === 'asc' 
      ? (aValue as number) - (bValue as number)
      : (bValue as number) - (aValue as number);
  });

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

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleSort(field)}
      className="h-auto p-0 font-semibold hover:bg-transparent"
    >
      <div className="flex items-center gap-1">
        {children}
        <ArrowUpDown className="h-3 w-3" />
      </div>
    </Button>
  );

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <SortButton field="name">Theme</SortButton>
            </TableHead>
            <TableHead>
              <SortButton field="pillar">Pillar</SortButton>
            </TableHead>
            <TableHead>
              <SortButton field="sector">Sector</SortButton>
            </TableHead>
            <TableHead>
              <SortButton field="score">Score</SortButton>
            </TableHead>
            <TableHead>
              <SortButton field="confidence">Confidence</SortButton>
            </TableHead>
            <TableHead className="w-20">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedThemes.map((theme) => (
            <TableRow 
              key={theme.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => navigate(`/theme/${theme.id}`)}
            >
              <TableCell className="font-medium">
                <div>
                  <div className="font-semibold text-foreground">{theme.name}</div>
                  <div className="text-sm text-muted-foreground truncate max-w-xs">
                    {theme.description}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={getPillarColor(theme.pillar)}>
                  {theme.pillar}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">{theme.sector}</span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {getScoreIcon(theme.weighted_total_score)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-semibold ${getScoreColor(theme.weighted_total_score)}`}>
                        {Math.round(theme.weighted_total_score)}
                      </span>
                    </div>
                    <Progress 
                      value={theme.weighted_total_score} 
                      className="h-2 w-16"
                    />
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={getConfidenceColor(theme.overall_confidence)}>
                  {theme.overall_confidence}
                </Badge>
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditTheme(theme);
                  }}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}