import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';

interface DailyEntry {
  id: string;
  day: number;
  profit: number;
}

interface ProfitDistributionChartProps {
  data: DailyEntry[];
  biggestProfitDay: number;
  passedConsistencyRule: boolean;
}

const ProfitDistributionChart = ({ data, biggestProfitDay, passedConsistencyRule }: ProfitDistributionChartProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Filter out negative days and prepare data for pie chart
  const profitableDays = data.filter(entry => entry.profit > 0);
  const totalProfit = profitableDays.reduce((sum, entry) => sum + entry.profit, 0);

  const chartData = profitableDays.map(entry => ({
    name: `Day ${entry.day}`,
    value: entry.profit,
    percentage: totalProfit > 0 ? (entry.profit / totalProfit) * 100 : 0,
    day: entry.day
  }));

  const getColor = (day: number) => {
    if (day === biggestProfitDay && !passedConsistencyRule) {
      return 'hsl(var(--destructive))';
    }
    // Generate different shades of success color
    const baseHue = 142;
    const saturation = 76;
    const lightness = Math.max(30, 60 - (day * 3));
    return `hsl(${baseHue}, ${saturation}%, ${lightness}%)`;
  };

  const COLORS = chartData.map(entry => getColor(entry.day));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card p-3 border border-border rounded-lg shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-profit">
            {formatCurrency(data.value)} ({data.percentage.toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <Card className="w-full bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            <PieChartIcon className="w-5 h-5 text-primary" />
            Daily Profit Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No profitable days to display
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          <PieChartIcon className="w-5 h-5 text-primary" />
          Daily Profit Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300} className="min-h-[300px] sm:min-h-[400px]">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        {biggestProfitDay && !passedConsistencyRule && (
          <p className="text-xs sm:text-sm text-loss mt-2 font-medium text-center">
            ⚠️ Day {biggestProfitDay} (in red) violates the consistency rule
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfitDistributionChart;