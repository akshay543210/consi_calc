import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface DailyEntry {
  id: string;
  day: number;
  profit: number;
}

interface DailyProfitChartProps {
  data: DailyEntry[];
  biggestProfitDay: number;
  passedConsistencyRule: boolean;
}

const DailyProfitChart = ({ data, biggestProfitDay, passedConsistencyRule }: DailyProfitChartProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getBarColor = (day: number, profit: number) => {
    if (day === biggestProfitDay && !passedConsistencyRule) {
      return 'hsl(var(--destructive))'; // Red for rule violation
    }
    return profit >= 0 ? 'hsl(var(--success))' : 'hsl(var(--destructive))';
  };

  return (
    <Card className="w-full bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          <TrendingUp className="w-5 h-5 text-primary" />
          Daily Profit/Loss
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250} className="min-h-[250px] sm:min-h-[300px]">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="day" 
              tickFormatter={(value) => `Day ${value}`}
              className="text-xs"
            />
            <YAxis 
              tickFormatter={formatCurrency}
              className="text-xs"
            />
            <Tooltip 
              formatter={(value: number) => [formatCurrency(value), 'P&L']}
              labelFormatter={(label) => `Day ${label}`}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Bar dataKey="profit" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getBarColor(entry.day, entry.profit)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        {biggestProfitDay && !passedConsistencyRule && (
          <p className="text-xs sm:text-sm text-loss mt-2 font-medium text-center sm:text-left">
            ⚠️ Day {biggestProfitDay} highlighted in red - violates consistency rule
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default DailyProfitChart;