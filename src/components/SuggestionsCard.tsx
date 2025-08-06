import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Target, DollarSign, TrendingUp, Lightbulb } from 'lucide-react';

interface DailyEntry {
  id: string;
  day: number;
  profit: number;
}

interface SuggestionsCardProps {
  dailyEntries: DailyEntry[];
  accountSize: number;
  biggestProfitDay: number;
  biggestProfitAmount: number;
  totalProfit: number;
  consistencyRulePercentage: number;
}

const SuggestionsCard = ({ 
  dailyEntries, 
  accountSize, 
  biggestProfitDay, 
  biggestProfitAmount,
  totalProfit,
  consistencyRulePercentage 
}: SuggestionsCardProps) => {
  // Calculate suggestions
  const profitableDays = dailyEntries.filter(entry => entry.profit > 0);
  const averageProfit = totalProfit / profitableDays.length;
  const volatileDays = dailyEntries.filter(entry => entry.profit > averageProfit * 1.5);
  
  // Risk management calculations
  const recommendedRiskPerTrade = Math.round(accountSize * 0.015); // 1.5% of account
  const maxRiskPerTrade = Math.round(accountSize * 0.02); // 2% max
  
  // R:R ratio suggestion
  const currentBiggestRisk = Math.max(...dailyEntries.map(entry => Math.abs(entry.profit)));
  const suggestedRR = biggestProfitAmount > averageProfit * 2 ? "1:1.2" : "1:1.5";
  
  // Days to focus on
  const inconsistentDays = dailyEntries
    .filter(entry => entry.profit > 0 && entry.profit < averageProfit * 0.8)
    .slice(0, 3);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      <Card className="border-orange-500/30 bg-gradient-to-br from-orange-500/10 via-yellow-500/10 to-red-500/10 shadow-lg backdrop-blur-sm">
        <CardHeader>
                  <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          Consistency Rule Failed - Trading Recommendations
        </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          {/* Volatile Days Alert */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-warning flex-shrink-0" />
              <h4 className="font-semibold text-sm sm:text-base">Volatile Trading Days</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {volatileDays.map(day => (
                <Badge 
                  key={day.id} 
                  variant="destructive"
                  className="bg-destructive/10 text-destructive border-destructive/20 text-xs sm:text-sm"
                >
                  Day {day.day}: {formatCurrency(day.profit)}
                </Badge>
              ))}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              These days had unusually high profits. Consider reducing position size on similar setups.
            </p>
          </div>

          {/* Risk Management */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-primary flex-shrink-0" />
              <h4 className="font-semibold text-sm sm:text-base">Recommended Risk Management</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="p-3 bg-background rounded-lg border">
                <p className="text-xs sm:text-sm text-muted-foreground">Risk Per Trade</p>
                <p className="text-base sm:text-lg font-semibold text-primary">
                  {formatCurrency(recommendedRiskPerTrade)} - {formatCurrency(maxRiskPerTrade)}
                </p>
                <p className="text-xs text-muted-foreground">1.5% - 2% of account size</p>
              </div>
              <div className="p-3 bg-background rounded-lg border">
                <p className="text-xs sm:text-sm text-muted-foreground">Target R:R Ratio</p>
                <p className="text-base sm:text-lg font-semibold text-primary">{suggestedRR}</p>
                <p className="text-xs text-muted-foreground">More consistent risk-reward</p>
              </div>
            </div>
          </div>

          {/* Focus Days */}
          {inconsistentDays.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-primary flex-shrink-0" />
                <h4 className="font-semibold text-sm sm:text-base">Days to Improve Consistency</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {inconsistentDays.map(day => (
                  <Badge 
                    key={day.id} 
                    variant="secondary"
                    className="bg-primary/10 text-primary border-primary/20 text-xs sm:text-sm"
                  >
                    Day {day.day}: {formatCurrency(day.profit)}
                  </Badge>
                ))}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Focus on being more consistent on these lower-performing days.
              </p>
            </div>
          )}

          {/* Key Recommendations */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-warning flex-shrink-0" />
              <h4 className="font-semibold text-sm sm:text-base">Key Action Items</h4>
            </div>
            <div className="space-y-2">
              <div className="flex items-start gap-2 text-xs sm:text-sm">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                <p>Reduce position size on Day {biggestProfitDay} type setups to avoid large wins</p>
              </div>
              <div className="flex items-start gap-2 text-xs sm:text-sm">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                <p>Aim for smaller, more consistent daily profits around {formatCurrency(averageProfit)}</p>
              </div>
              <div className="flex items-start gap-2 text-xs sm:text-sm">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                <p>Keep your biggest day under {consistencyRulePercentage}% of total profit ({formatCurrency(totalProfit * (consistencyRulePercentage / 100))})</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SuggestionsCard;