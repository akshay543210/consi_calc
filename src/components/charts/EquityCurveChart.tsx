import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface EquityPoint {
  day: number;
  equity: number;
}

interface EquityCurveChartProps {
  data: EquityPoint[];
  accountSize: number;
}

const EquityCurveChart = ({ data, accountSize }: EquityCurveChartProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Add starting point
  const chartData = [
    { day: 0, equity: accountSize },
    ...data
  ];

  return (
    <Card className="w-full bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          <TrendingUp className="w-5 h-5 text-primary" />
          Equity Curve
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250} className="min-h-[250px] sm:min-h-[300px]">
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="day" 
              tickFormatter={(value) => value === 0 ? 'Start' : `Day ${value}`}
              className="text-xs"
            />
            <YAxis 
              tickFormatter={formatCurrency}
              className="text-xs"
            />
            <Tooltip 
              formatter={(value: number) => [formatCurrency(value), 'Account Equity']}
              labelFormatter={(label) => label === 0 ? 'Starting Balance' : `Day ${label}`}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <ReferenceLine 
              y={accountSize} 
              stroke="hsl(var(--muted-foreground))" 
              strokeDasharray="5 5"
              label="Starting Balance"
            />
            <Line 
              type="monotone" 
              dataKey="equity" 
              stroke="hsl(var(--primary))" 
              strokeWidth={3}
              dot={{ r: 4, fill: 'hsl(var(--primary))' }}
              activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default EquityCurveChart;