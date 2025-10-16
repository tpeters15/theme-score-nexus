import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ThemeMomentum } from "@/hooks/useThemeMomentum";

interface MomentumChartProps {
  themes: ThemeMomentum[];
  topN?: number;
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export function MomentumChart({ themes, topN = 5 }: MomentumChartProps) {
  // Get top N themes by momentum score
  const topThemes = themes.slice(0, topN);

  // Transform data for recharts
  const chartData = topThemes[0]?.historical_momentum.map((_, index) => {
    const dataPoint: any = {
      date: topThemes[0].historical_momentum[index].date,
    };

    topThemes.forEach((theme) => {
      dataPoint[theme.theme_name] = theme.historical_momentum[index]?.score || 0;
    });

    return dataPoint;
  }) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Momentum Trend (90 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="date" 
              stroke="hsl(var(--muted-foreground))"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getMonth() + 1}/${date.getDate()}`;
              }}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
              }}
            />
            <Legend />
            {topThemes.map((theme, index) => (
              <Line
                key={theme.theme_id}
                type="monotone"
                dataKey={theme.theme_name}
                stroke={COLORS[index % COLORS.length]}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
