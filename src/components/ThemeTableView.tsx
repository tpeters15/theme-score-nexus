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
    <div className="surface-elevated rounded-lg overflow-hidden">
      <Table className="table-professional">
        <TableHeader>
          <TableRow className="border-b-2 hover:bg-transparent">
            <TableHead className="h-10 px-4">
              <SortButton field="name">Investment Theme</SortButton>
            </TableHead>
            <TableHead className="h-10 px-4">
              <SortButton field="pillar">Strategic Pillar</SortButton>
            </TableHead>
            <TableHead className="h-10 px-4">
              <SortButton field="sector">Sector</SortButton>
            </TableHead>
            <TableHead className="h-10 px-4 text-right">
              <SortButton field="score">Investment Score</SortButton>
            </TableHead>
            <TableHead className="h-10 px-4">
              <SortButton field="confidence">Confidence</SortButton>
            </TableHead>
            <TableHead className="w-16 h-10 px-4"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedThemes.map((theme) => (
            <TableRow 
              key={theme.id}
              className="cursor-pointer surface-hover transition-colors group"
              onClick={() => navigate(`/theme/${theme.id}`)}
            >
              <TableCell className="px-4 py-3">
                <div className="space-y-1">
                  <div className="text-data-primary font-medium">{theme.name}</div>
                  <div className="text-data-secondary truncate max-w-md">
                    {theme.description || "No description available"}
                  </div>
                </div>
              </TableCell>
              <TableCell className="px-4 py-3">
                <Badge variant="outline" className={`${getPillarColor(theme.pillar)} text-xs font-medium`}>
                  {theme.pillar}
                </Badge>
              </TableCell>
              <TableCell className="px-4 py-3">
                <span className="text-data-secondary font-medium">{theme.sector}</span>
              </TableCell>
              <TableCell className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-3">
                  <div className="text-right">
                    <div className={`text-metric ${getScoreColor(theme.weighted_total_score)}`}>
                      {Math.round(theme.weighted_total_score)}
                    </div>
                    <div className="text-data-secondary">/ 100</div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {getScoreIcon(theme.weighted_total_score)}
                    <Progress 
                      value={theme.weighted_total_score} 
                      className="h-1.5 w-12"
                    />
                  </div>
                </div>
              </TableCell>
              <TableCell className="px-4 py-3">
                <Badge variant="outline" className={`${getConfidenceColor(theme.overall_confidence)} text-xs`}>
                  {theme.overall_confidence}
                </Badge>
              </TableCell>
              <TableCell className="px-4 py-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditTheme(theme);
                  }}
                  className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Edit className="h-3.5 w-3.5" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}