import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Target, AlertCircle, CheckCircle } from 'lucide-react';

interface CalculationResults {
  totalProfit: number;
  biggestProfitDay: number;
  biggestProfitAmount: number;
  biggestDayPercentage: number;
  passedConsistencyRule: boolean;
  equityCurve: { day: number; equity: number }[];
  profitTarget: number;
  passedProfitTarget: boolean;
}

interface ResultsCardProps {
  results: CalculationResults;
  accountSize: number;
}

const ResultsCard = ({ results, accountSize }: ResultsCardProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* Total Profit */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className={`${results.totalProfit >= 0 ? 'border-green-500/30 bg-gradient-to-br from-green-500/10 to-emerald-500/10' : 'border-red-500/30 bg-gradient-to-br from-red-500/10 to-pink-500/10'} shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              {results.totalProfit >= 0 ? (
                <TrendingUp className="w-4 h-4 text-profit" />
              ) : (
                <TrendingDown className="w-4 h-4 text-loss" />
              )}
              Total Profit/Loss
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {formatCurrency(results.totalProfit)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatPercentage((results.totalProfit / accountSize) * 100)} of account
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Biggest Day */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card className={`${!results.passedConsistencyRule ? 'border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-yellow-500/10' : 'border-green-500/30 bg-gradient-to-br from-green-500/10 to-emerald-500/10'} shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              {!results.passedConsistencyRule ? (
                <AlertCircle className="w-4 h-4 text-warning" />
              ) : (
                <CheckCircle className="w-4 h-4 text-success" />
              )}
              Biggest Profit Day
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              Day {results.biggestProfitDay}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(results.biggestProfitAmount)}
            </p>
            <Badge 
              variant={!results.passedConsistencyRule ? "destructive" : "default"}
              className="mt-1"
            >
              {formatPercentage(results.biggestDayPercentage)} of total
            </Badge>
          </CardContent>
        </Card>
      </motion.div>

      {/* Profit Target */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card className={`${results.passedProfitTarget ? 'border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-indigo-500/10' : 'border-red-500/30 bg-gradient-to-br from-red-500/10 to-pink-500/10'} shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="w-4 h-4" />
              Profit Target
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {formatCurrency(results.profitTarget)}
            </div>
            <p className="text-xs text-muted-foreground">
              Target amount needed
            </p>
            <Badge 
              variant={results.passedProfitTarget ? "default" : "destructive"}
              className="mt-1"
            >
              {results.passedProfitTarget ? "PASSED" : "NOT REACHED"}
            </Badge>
          </CardContent>
        </Card>
      </motion.div>

      {/* Consistency Rule */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Card className={`${results.passedConsistencyRule ? 'border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-violet-500/10' : 'border-red-500/30 bg-gradient-to-br from-red-500/10 to-pink-500/10'} shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              {results.passedConsistencyRule ? (
                <CheckCircle className="w-4 h-4 text-success" />
              ) : (
                <AlertCircle className="w-4 h-4 text-loss" />
              )}
              Consistency Rule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {formatPercentage(results.biggestDayPercentage)}
            </div>
            <p className="text-xs text-muted-foreground">
              Max allowed: 35%
            </p>
            <Badge 
              variant={results.passedConsistencyRule ? "default" : "destructive"}
              className="mt-1"
            >
              {results.passedConsistencyRule ? "PASSED" : "FAILED"}
            </Badge>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ResultsCard;