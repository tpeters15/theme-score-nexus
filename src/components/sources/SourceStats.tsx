import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, CheckCircle2, Clock, Zap } from "lucide-react";

interface Source {
  id: string;
  status: string;
  last_checked_at?: string;
}

interface SourceStatsProps {
  sources: Source[];
}

export const SourceStats = ({ sources }: SourceStatsProps) => {
  const activeCount = sources.filter((s) => s.status === "active").length;
  const pausedCount = sources.filter((s) => s.status === "paused").length;
  
  const recentlyChecked = sources.filter((s) => {
    if (!s.last_checked_at) return false;
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return new Date(s.last_checked_at) > hourAgo;
  }).length;

  const stats = [
    {
      title: "Total Sources",
      value: sources.length,
      icon: Activity,
      description: "Configured sources",
      color: "text-blue-600",
    },
    {
      title: "Active",
      value: activeCount,
      icon: CheckCircle2,
      description: "Currently monitoring",
      color: "text-green-600",
    },
    {
      title: "Paused",
      value: pausedCount,
      icon: Clock,
      description: "Not monitoring",
      color: "text-amber-600",
    },
    {
      title: "Recent Activity",
      value: recentlyChecked,
      icon: Zap,
      description: "Checked in last hour",
      color: "text-purple-600",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
