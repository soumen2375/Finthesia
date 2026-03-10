import React, { useEffect, useState } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line
} from 'recharts';
import { useUI } from '../context/UIContext';
import { cn } from '../lib/utils';
import { 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Download,
  Calendar
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { api, Transaction } from '../services/api';
import { formatCurrency } from '../lib/formatters';

export default function AnalyticsPage() {
  const { isPrivacyMode, refreshKey } = useUI();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const txs = await api.getTransactions();
        setTransactions(txs);
      } catch (error) {
        console.error('Failed to fetch transactions', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [refreshKey]);

  // Calculate spending breakdown
  const spendingByCategory = transactions
    .filter(tx => tx.type === 'expense')
    .reduce((acc, tx) => {
      acc[tx.category] = (acc[tx.category] || 0) + Number(tx.amount);
      return acc;
    }, {} as Record<string, number>);

  const colors = ['#27C4E1', '#00BFFF', '#545E63', '#8A8F93', '#F59E0B', '#22C55E', '#EC4899', '#8B5CF6'];
  const spendingData = Object.entries(spendingByCategory).map(([name, value], index) => ({
    name,
    value: value as number,
    color: colors[index % colors.length]
  })).sort((a, b) => (b.value as number) - (a.value as number));

  // Calculate monthly trends (last 6 months)
  const monthlyTrends = transactions.reduce((acc, tx) => {
    const date = new Date(tx.transaction_date);
    const monthKey = date.toLocaleString('default', { month: 'short', year: '2-digit' });
    if (!acc[monthKey]) acc[monthKey] = { month: monthKey, spending: 0, income: 0 };
    if (tx.type === 'expense') acc[monthKey].spending += Number(tx.amount);
    else acc[monthKey].income += Number(tx.amount);
    return acc;
  }, {} as Record<string, { month: string; spending: number; income: number }>);

  const monthlyTrendData = Object.values(monthlyTrends).slice(-6);

  // Calculate health score (mocked algorithm based on savings rate)
  const totalIncome = transactions.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + Number(tx.amount), 0);
  const totalSpending = transactions.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + Number(tx.amount), 0);
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalSpending) / totalIncome) * 100 : 0;
  const healthScore = Math.min(Math.max(Math.round(50 + savingsRate), 0), 100);

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between px-1 animate-slam">
        <div>
          <h2 className="text-3xl font-bold text-text-dark tracking-tight">Analytics</h2>
          <p className="text-text-muted text-sm font-medium">Your financial health at a glance</p>
        </div>
        <Button variant="secondary" size="sm">
          <Download size={18} className="mr-2" /> Export
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-text-muted font-medium">Analyzing your finances...</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="card p-12 text-center">
          <TrendingUp size={48} className="mx-auto text-border mb-4" />
          <h3 className="text-xl font-bold text-text-dark mb-2">No Data Yet</h3>
          <p className="text-text-muted max-w-xs mx-auto">Add some assets, cards, or transactions to see your financial analytics.</p>
        </div>
      ) : (
        <>
          {/* Financial Health Score */}
          <section className="card p-8 flex flex-col items-center text-center space-y-4">
            <div className="relative h-64 w-64 flex items-center justify-center">
              <svg className="h-full w-full transform -rotate-90">
                <circle
                  cx="128"
                  cy="128"
                  r="104"
                  stroke="currentColor"
                  strokeWidth="24"
                  fill="transparent"
                  className="text-border"
                />
                <circle
                  cx="128"
                  cy="128"
                  r="104"
                  stroke="currentColor"
                  strokeWidth="24"
                  fill="transparent"
                  strokeDasharray={653.45}
                  strokeDashoffset={653.45 * (1 - healthScore / 100)}
                  className={cn(
                    "transition-all duration-1000 ease-out",
                    healthScore > 70 ? "text-primary" : healthScore > 40 ? "text-secondary" : "text-warning"
                  )}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center space-y-1">
                <span className="text-6xl font-black tracking-tight text-text-dark">{healthScore}</span>
                <span className="text-xs font-bold text-text-muted uppercase tracking-widest">Health Score</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-lg font-bold text-text-dark">
                {healthScore > 80 ? 'Excellent' : healthScore > 60 ? 'Good' : healthScore > 40 ? 'Fair' : 'Needs Attention'} Financial Health
              </p>
              <p className="text-sm text-text-muted max-w-[240px]">
                {healthScore > 60 
                  ? "You're managing your finances effectively. Keep up the good work!" 
                  : "Consider reviewing your spending habits to improve your financial health."}
              </p>
            </div>
          </section>

          {/* Spending Breakdown */}
          <section className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xl font-bold text-text-dark">Spending Breakdown</h3>
              <div className="flex items-center space-x-2 bg-background p-1 rounded-xl border border-border">
                <button className="px-3 py-1 text-xs font-bold bg-card rounded-lg shadow-sm">Month</button>
                <button className="px-3 py-1 text-xs font-bold text-text-muted">Year</button>
              </div>
            </div>
            <div className="card p-6">
              <div className="h-[250px] w-full min-h-0 min-w-0 flex-1">
                <ResponsiveContainer width="99%" height="99%">
                  <PieChart>
                    <Pie
                      data={spendingData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {spendingData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value, isPrivacyMode)}
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: 'var(--color-card)', color: 'var(--color-text-dark)' }}
                      itemStyle={{ color: 'var(--color-text-dark)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                {spendingData.map((item) => (
                  <div key={item.name} className="flex items-center space-x-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs font-medium text-text-muted truncate">{item.name}</span>
                    <span className="text-xs font-bold text-text-dark ml-auto">{formatCurrency(item.value, isPrivacyMode)}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Monthly Trends */}
          <section className="space-y-4">
            <h3 className="text-xl font-bold text-text-dark px-1">Income vs Spending</h3>
            <div className="card p-6">
              <div className="h-[250px] w-full min-h-0 min-w-0 flex-1">
                <ResponsiveContainer width="99%" height="99%">
                  <BarChart data={monthlyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fontWeight: 600, fill: '#64748B' }} 
                    />
                    <YAxis hide />
                    <Tooltip 
                      cursor={{ fill: 'var(--color-background)' }}
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: 'var(--color-card)', color: 'var(--color-text-dark)' }}
                      itemStyle={{ color: 'var(--color-text-dark)' }}
                      formatter={(value: number) => formatCurrency(value, isPrivacyMode)}
                    />
                    <Bar dataKey="income" fill="#27C4E1" radius={[4, 4, 0, 0]} barSize={12} />
                    <Bar dataKey="spending" fill="#64748B" radius={[4, 4, 0, 0]} barSize={12} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center space-x-6 mt-4">
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 rounded-full bg-secondary" />
                  <span className="text-xs font-bold text-text-dark">Income</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 rounded-full bg-text-muted" />
                  <span className="text-xs font-bold text-text-dark">Spending</span>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
