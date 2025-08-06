import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { History, Trash2, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import html2pdf from 'html2pdf.js';

interface SessionData {
  id: string;
  accountSize: number;
  profitTargetPercentage: number;
  consistencyRulePercentage: number;
  dailyEntries: Array<{ id: string; day: number; profit: number }>;
  results: any;
  timestamp: string;
}

interface SessionHistoryProps {
  onLoadSession: (session: SessionData) => void;
}

const SessionHistory = ({ onLoadSession }: SessionHistoryProps) => {
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = () => {
    try {
      const stored = localStorage.getItem('traderSessions');
      if (stored) {
        const parsedSessions = JSON.parse(stored);
        setSessions(parsedSessions.reverse()); // Show newest first
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  const clearAllSessions = () => {
    localStorage.removeItem('traderSessions');
    setSessions([]);
    toast({
      title: "History Cleared",
      description: "All session history has been deleted.",
    });
  };

  const deleteSession = (sessionId: string) => {
    try {
      const stored = localStorage.getItem('traderSessions');
      if (stored) {
        const parsedSessions = JSON.parse(stored);
        const filteredSessions = parsedSessions.filter((s: SessionData) => s.id !== sessionId);
        localStorage.setItem('traderSessions', JSON.stringify(filteredSessions));
        setSessions(filteredSessions.reverse());
        toast({
          title: "Session Deleted",
          description: "Session removed from history.",
        });
      }
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  const exportSessionToPDF = async (session: SessionData) => {
    // Create a temporary div with session data for PDF export
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = `
      <div style="padding: 20px; font-family: Arial, sans-serif;">
        <h1 style="color: #333; margin-bottom: 20px;">Trading Session Report</h1>
        <p><strong>Date:</strong> ${new Date(session.timestamp).toLocaleString()}</p>
        <p><strong>Account Size:</strong> $${session.accountSize.toLocaleString()}</p>
        <p><strong>Profit Target:</strong> ${session.profitTargetPercentage}%</p>
        <p><strong>Consistency Rule:</strong> ${session.consistencyRulePercentage}%</p>
        
        <h3>Daily Entries:</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr style="background-color: #f5f5f5;">
            <th style="border: 1px solid #ddd; padding: 8px;">Day</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Profit/Loss</th>
          </tr>
          ${session.dailyEntries.map(entry => `
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">${entry.day}</td>
              <td style="border: 1px solid #ddd; padding: 8px; color: ${entry.profit >= 0 ? 'green' : 'red'};">
                $${entry.profit.toFixed(2)}
              </td>
            </tr>
          `).join('')}
        </table>
        
        <h3>Results:</h3>
        <p><strong>Total Profit:</strong> $${session.results?.totalProfit?.toFixed(2) || '0.00'}</p>
        <p><strong>Biggest Profit Day:</strong> Day ${session.results?.biggestProfitDay || 'N/A'}</p>
        <p><strong>Biggest Day Percentage:</strong> ${session.results?.biggestDayPercentage?.toFixed(2) || '0'}%</p>
        <p><strong>Consistency Rule:</strong> 
          <span style="color: ${session.results?.passedConsistencyRule ? 'green' : 'red'};">
            ${session.results?.passedConsistencyRule ? 'PASSED' : 'FAILED'}
          </span>
        </p>
      </div>
    `;
    
    document.body.appendChild(tempDiv);
    
    const opt = {
      margin: 1,
      filename: `trading-session-${new Date(session.timestamp).toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    try {
      await html2pdf().set(opt).from(tempDiv).save();
      document.body.removeChild(tempDiv);
      toast({
        title: "Export Successful",
        description: "Session exported as PDF.",
      });
    } catch (error) {
      document.body.removeChild(tempDiv);
      toast({
        title: "Export Error",
        description: "Failed to export PDF.",
        variant: "destructive"
      });
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (sessions.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm border-primary/20 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            <History className="w-5 h-5 text-primary" />
            Session History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No previous sessions found. Complete a calculation to see your history here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm border-primary/20 shadow-lg">
      <CardHeader>
        <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            <History className="w-5 h-5 text-primary" />
            <span className="text-lg sm:text-xl">Session History ({sessions.length})</span>
          </div>
          <Button 
            onClick={clearAllSessions} 
            variant="outline" 
            size="sm"
            className="bg-gradient-to-r from-red-500/10 to-pink-500/10 hover:from-red-500/20 hover:to-pink-500/20 border-red-500/30 transition-all duration-300 w-full sm:w-auto h-10 sm:h-9"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 sm:space-y-4 max-h-96 overflow-y-auto">
          {sessions.map((session) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border rounded-lg p-3 sm:p-4 space-y-3 bg-gradient-to-r from-card/50 to-card/80 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-all duration-300"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div className="space-y-1 min-w-0 flex-1">
                  <p className="text-sm font-medium">{formatDate(session.timestamp)}</p>
                  <p className="text-xs text-muted-foreground">
                    Account: {formatCurrency(session.accountSize)} | 
                    Target: {session.profitTargetPercentage}% | 
                    Rule: {session.consistencyRulePercentage}%
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {session.results && (
                    <Badge 
                      variant={session.results.passedConsistencyRule ? "default" : "destructive"}
                      className="text-xs sm:text-sm"
                    >
                      {session.results.passedConsistencyRule ? "PASSED" : "FAILED"}
                    </Badge>
                  )}
                </div>
              </div>
              
              {session.results && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground text-xs sm:text-sm">Total P&L:</span>
                    <p className={`font-medium text-sm sm:text-base ${session.results.totalProfit >= 0 ? 'text-profit' : 'text-loss'}`}>
                      {formatCurrency(session.results.totalProfit)}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs sm:text-sm">Biggest Day:</span>
                    <p className="font-medium text-sm sm:text-base">
                      Day {session.results.biggestProfitDay} ({session.results.biggestDayPercentage?.toFixed(1)}%)
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={() => onLoadSession(session)} variant="outline" size="sm" className="flex-1 h-10 sm:h-9">
                  Load Session
                </Button>
                <Button 
                  onClick={() => exportSessionToPDF(session)} 
                  variant="outline" 
                  size="sm"
                  className="h-10 sm:h-9"
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button 
                  onClick={() => deleteSession(session.id)} 
                  variant="ghost" 
                  size="sm"
                  className="text-destructive hover:text-destructive h-10 sm:h-9"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SessionHistory;