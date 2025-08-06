import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Download, Calculator, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import DailyProfitChart from '@/components/charts/DailyProfitChart';
import EquityCurveChart from '@/components/charts/EquityCurveChart';
import ProfitDistributionChart from '@/components/charts/ProfitDistributionChart';
import ResultsCard from '@/components/ResultsCard';
import SessionHistory from '@/components/SessionHistory';
import SuggestionsCard from '@/components/SuggestionsCard';
import html2pdf from 'html2pdf.js';

interface DailyEntry {
  id: string;
  day: number;
  profit: number | null;
}

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

const TraderCalculator = () => {
  const [accountSize, setAccountSize] = useState<number>(100000);
  const [profitTargetPercentage, setProfitTargetPercentage] = useState<number>(6);
  const [consistencyRulePercentage, setConsistencyRulePercentage] = useState<number>(35);
  const [dailyEntries, setDailyEntries] = useState<DailyEntry[]>([
    { id: '1', day: 1, profit: null }
  ]);
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const { toast } = useToast();

  const addDailyEntry = () => {
    const newEntry: DailyEntry = {
      id: Date.now().toString(),
      day: dailyEntries.length + 1,
      profit: null
    };
    setDailyEntries([...dailyEntries, newEntry]);
  };

  const removeDailyEntry = (id: string) => {
    if (dailyEntries.length > 1) {
      const filtered = dailyEntries.filter(entry => entry.id !== id);
      // Reassign day numbers
      const reordered = filtered.map((entry, index) => ({
        ...entry,
        day: index + 1
      }));
      setDailyEntries(reordered);
    }
  };

  const updateDailyEntry = (id: string, profit: number | null) => {
    setDailyEntries(entries =>
      entries.map(entry =>
        entry.id === id ? { ...entry, profit } : entry
      )
    );
  };

  const calculateResults = () => {
    // Filter out entries with null profit values
    const validEntries = dailyEntries.filter(entry => entry.profit !== null);
    
    if (validEntries.length === 0) {
      toast({
        title: "No Data",
        description: "Please enter at least one daily profit value.",
        variant: "destructive"
      });
      return;
    }
    
    const totalProfit = validEntries.reduce((sum, entry) => sum + (entry.profit || 0), 0);
    const biggestProfitEntry = validEntries.reduce((max, entry) =>
      (entry.profit || 0) > (max.profit || 0) ? entry : max
    );
    
    const biggestDayPercentage = totalProfit > 0 
      ? (biggestProfitEntry.profit / totalProfit) * 100 
      : 0;
    
    const profitTarget = (accountSize * profitTargetPercentage) / 100;
    const passedProfitTarget = totalProfit >= profitTarget;
    const passedConsistencyRule = biggestDayPercentage <= consistencyRulePercentage;

    // Calculate equity curve
    let runningEquity = accountSize;
    const equityCurve = validEntries.map(entry => {
      runningEquity += entry.profit || 0;
      return { day: entry.day, equity: runningEquity };
    });

    const calculationResults: CalculationResults = {
      totalProfit,
      biggestProfitDay: biggestProfitEntry.day,
      biggestProfitAmount: biggestProfitEntry.profit,
      biggestDayPercentage,
      passedConsistencyRule,
      equityCurve,
      profitTarget,
      passedProfitTarget
    };

    setResults(calculationResults);
    saveToLocalStorage(calculationResults);
  };

  const saveToLocalStorage = (calculationResults: CalculationResults) => {
    const sessionData = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      accountSize,
      profitTargetPercentage,
      consistencyRulePercentage,
      dailyEntries,
      results: calculationResults,
      timestamp: new Date().toISOString()
    };
    
    try {
      const sessions = JSON.parse(localStorage.getItem('traderSessions') || '[]');
      sessions.push(sessionData);
      // Keep only last 50 sessions to prevent localStorage from getting too large
      const limitedSessions = sessions.slice(-50);
      localStorage.setItem('traderSessions', JSON.stringify(limitedSessions));
      
      toast({
        title: "Session Saved",
        description: "Your trading session has been saved locally.",
      });
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      toast({
        title: "Save Error",
        description: "Failed to save session data.",
        variant: "destructive"
      });
    }
  };

  const exportToPDF = async () => {
    const element = document.getElementById('results-container');
    if (!element) {
      toast({
        title: "Export Error",
        description: "No results to export. Please calculate first.",
        variant: "destructive"
      });
      return;
    }

    const opt = {
      margin: 1,
      filename: `trader-consistency-report-${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    try {
      await html2pdf().set(opt).from(element).save();
      toast({
        title: "Export Successful",
        description: "Your trading report has been downloaded as PDF.",
      });
    } catch (error) {
      toast({
        title: "Export Error",
        description: "Failed to export PDF. Please try again.",
        variant: "destructive"
      });
    }
  };

  const loadSession = (sessionData: any) => {
    setAccountSize(sessionData.accountSize);
    setProfitTargetPercentage(sessionData.profitTargetPercentage);
    setConsistencyRulePercentage(sessionData.consistencyRulePercentage);
    setDailyEntries(sessionData.dailyEntries);
    setResults(sessionData.results);
    setShowHistory(false);
    
    toast({
      title: "Session Loaded",
      description: "Previous trading session has been loaded.",
    });
  };

  const resetForm = () => {
    setAccountSize(100000);
    setProfitTargetPercentage(6);
    setConsistencyRulePercentage(35);
    setDailyEntries([{ id: '1', day: 1, profit: null }]);
    setResults(null);
    setShowHistory(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Data Storage Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Card className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-green-500/10 border-primary/30 shadow-lg backdrop-blur-sm">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-primary flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-primary text-sm sm:text-base">100% Local Storage</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    All your data is stored locally in your browser. No signup required, completely private and anonymous.
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => setShowHistory(!showHistory)} 
                variant="outline" 
                size="sm"
                className="sm:ml-auto w-full sm:w-auto h-10 sm:h-9"
              >
                {showHistory ? 'Hide' : 'Show'} History
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Session History */}
      {showHistory && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <SessionHistory onLoadSession={loadSession} />
        </motion.div>
      )}

      {/* Input Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card className="shadow-xl bg-gradient-to-br from-card to-card/80 backdrop-blur-sm border-primary/20">
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Calculator className="w-5 h-5" />
              Trading Challenge Setup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="accountSize">Account Size (USD)</Label>
                <Input
                  id="accountSize"
                  type="number"
                  value={accountSize}
                  onChange={(e) => setAccountSize(Number(e.target.value))}
                  placeholder="100000"
                  className="bg-gradient-to-r from-background/50 to-background/30 border-primary/30 focus:border-primary/60 focus:ring-primary/20 transition-all duration-300 hover:border-primary/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profitTarget">Profit Target (%)</Label>
                <Input
                  id="profitTarget"
                  type="number"
                  step="0.1"
                  value={profitTargetPercentage}
                  onChange={(e) => setProfitTargetPercentage(Number(e.target.value))}
                  placeholder="6"
                  className="bg-gradient-to-r from-background/50 to-background/30 border-primary/30 focus:border-primary/60 focus:ring-primary/20 transition-all duration-300 hover:border-primary/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="consistencyRule">Consistency Rule (%)</Label>
                <Input
                  id="consistencyRule"
                  type="number"
                  step="0.1"
                  value={consistencyRulePercentage}
                  onChange={(e) => setConsistencyRulePercentage(Number(e.target.value))}
                  placeholder="35"
                  className="bg-gradient-to-r from-background/50 to-background/30 border-primary/30 focus:border-primary/60 focus:ring-primary/20 transition-all duration-300 hover:border-primary/50"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <Label className="text-base sm:text-lg font-semibold">Daily P&L Entries</Label>
                <Button 
                  onClick={addDailyEntry} 
                  variant="outline" 
                  size="sm"
                  className="bg-gradient-to-r from-primary/10 to-purple-500/10 hover:from-primary/20 hover:to-purple-500/20 border-primary/30 transition-all duration-300 w-full sm:w-auto h-10 sm:h-9"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Day
                </Button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 max-h-96 overflow-y-auto">
                {dailyEntries.map((entry) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 border rounded-lg bg-gradient-to-r from-card/50 to-card/80 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-all duration-300"
                  >
                    <Label className="min-w-[60px] text-sm sm:text-base">Day {entry.day}:</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={entry.profit === null ? '' : entry.profit}
                      onChange={(e) => {
                        const value = e.target.value === '' ? null : Number(e.target.value);
                        updateDailyEntry(entry.id, value);
                      }}
                      placeholder="Enter P&L"
                      className="flex-1 bg-gradient-to-r from-background/50 to-background/30 border-primary/30 focus:border-primary/60 focus:ring-primary/20 transition-all duration-300 hover:border-primary/50 h-10 sm:h-9"
                    />
                    {dailyEntries.length > 1 && (
                      <Button
                        onClick={() => removeDailyEntry(entry.id)}
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive w-full sm:w-auto h-10 sm:h-9"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button 
                onClick={calculateResults} 
                className="flex-1 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 transition-all duration-300 shadow-lg hover:shadow-xl h-12 sm:h-10"
              >
                Calculate Results
              </Button>
              <Button 
                onClick={resetForm} 
                variant="outline"
                className="bg-gradient-to-r from-muted/50 to-muted/30 hover:from-muted/70 hover:to-muted/50 border-primary/30 transition-all duration-300 h-12 sm:h-10"
              >
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Results Section */}
      {results && (
        <div id="results-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Trading Results</h2>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
                <Button 
                  onClick={exportToPDF} 
                  variant="outline"
                  className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 hover:from-green-500/20 hover:to-emerald-500/20 border-green-500/30 transition-all duration-300 h-12 sm:h-10"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
                <Button 
                  onClick={resetForm}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl h-12 sm:h-10"
                >
                  Track Another Challenge
                </Button>
              </div>
            </div>

            <ResultsCard results={results} accountSize={accountSize} />

            {/* Suggestions for failed consistency */}
            {!results.passedConsistencyRule && (
              <SuggestionsCard 
                dailyEntries={dailyEntries}
                accountSize={accountSize}
                biggestProfitDay={results.biggestProfitDay}
                biggestProfitAmount={results.biggestProfitAmount}
                totalProfit={results.totalProfit}
                consistencyRulePercentage={consistencyRulePercentage}
              />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <DailyProfitChart 
                data={dailyEntries} 
                biggestProfitDay={results.biggestProfitDay}
                passedConsistencyRule={results.passedConsistencyRule}
              />
              <EquityCurveChart data={results.equityCurve} accountSize={accountSize} />
            </div>

            <ProfitDistributionChart 
              data={dailyEntries} 
              biggestProfitDay={results.biggestProfitDay}
              passedConsistencyRule={results.passedConsistencyRule}
            />
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default TraderCalculator;